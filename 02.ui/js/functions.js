import {findPath, getNearestPoint, refreshGuest, updateData} from "./api.js";
import {map} from "./map.js";

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let data =
    {
    'start':
    {
        'id': 0,
        'lat': 0,
        'lng': 0,
        'start': true,
        'name': 'undefine',
        'set': false
    },
    'end':
    {
        'id': 0,
        'lat': 0,
        'lng': 0,
        'start': false,
        'name': 'undefine',
        'set': false
    },
    'mode': 'guest',
    'algorithm': '',
    'selecting': ''
}

// điểm trên bản đồ
let startMarker;
let endMarker;
let pathDraw;

export function handleNode(e){
    const {lat, lng} = e.latlng;
    if(data.selecting === 'start'){
        data.start['lat'] = lat;
        data.start['lng'] = lng;
        getNearestPoint(data.start).then(node => {
            data.start = node
            name = `Id: ${data.start['id']}, ${data.start['name']}`

            if(startMarker) startMarker.remove();
            startMarker = L.marker([data.start['lat'], data.start['lng']])
                .addTo(map)
                .bindPopup(name)
                .openPopup()

            setTimeout(() => {
                startMarker.closePopup()
            }, 2000)

            document.getElementById('startPoint')
                .value = name
        })
    }else if(data.selecting === 'end'){
        data.end['lat'] = lat;
        data.end['lng'] = lng;
        getNearestPoint(data.end).then(node => {
            data.end = node
            name = `Id: ${data.end['id']}, ${data.end['name']}`

            if(endMarker) endMarker.remove();
            endMarker = L.marker([data.end['lat'], data.end['lng']], {icon: redIcon})
                .addTo(map)
                .bindPopup(name)
                .openPopup()
            setTimeout(() => {
                endMarker.closePopup()
            }, 2000)
            document.getElementById('endPoint')
                .value = name
        })
    }
}

export function handleRefresh(e){
    refresh()
}

async function refresh(){
    //xu li voi frontend
    document.getElementById('algorithm').selectedIndex = 0;
    data.algorithm = '';

    data.selecting = '';
    data.start['set'] = false;
    data.end['set'] = false;
    document.getElementById('startPoint').value = ''
    document.getElementById('endPoint').value = ''
    if(startMarker) startMarker.remove();
    if(endMarker) endMarker.remove();
    if(pathDraw) pathDraw.remove();

    data.mode = 'guest'
    document.getElementById('modeSwitch').checked = false
    //xu li voi backend
    let tmp = await refreshGuest(data);
    if(tmp !== null){
        data = tmp;
    }
}

export function handleChangeMode(e){
    data.mode = e.target.checked ? 'Admin' : 'Guest';
    updateData(data)
    console.log(data.mode);
}

export function handleChangeAlgorithm(e) {
    data.algorithm = e.target.value; // Lấy loại thuật toán được chọn
    updateData(data)
    console.log("Thuật toán được chọn:", data.algorithm);
}


export async function handleFindPathBtn(e){
    let message = '';
    if(data.algorithm === ''){
        message = 'Vui lòng chọn thuật toán tìm đường'
    }else if(data.start['set'] === false){
        message = 'Vui lòng chọn điểm bắt đầu'
    }else if(data.end['set'] === false){
        message = 'Vui lòng chọn điểm kết thúc'
    }
    if(message !== '') {
        Toastify({
            text: message,
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: "#f56565",  // ✅ dùng 'style.background' thay vì 'backgroundColor'
                color: "white",
                borderRadius: "8px"
            }
        }).showToast();
    }else{
        let backendData = await findPath(data)
        console.log(backendData.path)
        if(pathDraw) pathDraw.remove();
        pathDraw = L.polyline(backendData.path, {
            color: 'blue',
            weight: 4
        }).addTo(map);
        console.log("da tim duong di")
    }
}

export function setStart(e){
    data.selecting = 'start';
    console.log(data.selecting);
}

export function setEnd(e){
    data.selecting = 'end'
    console.log(data.selecting);
}