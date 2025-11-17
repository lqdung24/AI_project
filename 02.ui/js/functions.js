import {
    delete_zone,
    edgePolyLines,
    findPath,
    getData,
    getNearestPoint,
    nodeLayer,
    postBoundary,
    refreshGuest,
    sendData
} from "./api.js";
import {map} from "./map.js";
import {adminPanel, guestPanel, switchAdmin, switchGuest} from "./event_listener.js";
import {edgeLayer} from "./api.js";

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
    'selecting': '',
    'zones': {
        block: new Map(),
        flood: new Map(),
        traffic: new Map(),
        oneway: new Map()
    }
}

export let draw_zones= {
    block: new Map(),
    flood: new Map(),
    traffic: new Map(),
    oneway: new Map()
}

// ===== Màu polygon theo loại =====
export const zoneColors = {
    block: "#ff4d4d",
    flood: "#4da6ff",
    traffic: "#ffcc00",
    oneway: "#66cc66"
};

let startMarker;
let endMarker;
let pathDraw;
export async function __init__(){
    data = await getData()
}
export function handleNode(e){
    const {lat, lng} = e.latlng;
    if(data.selecting === 'start'){
        data.start['lat'] = lat;
        data.start['lng'] = lng;
        getNearestPoint(data.start).then(node => {
            data.start = node
            name = `ID: ${data.start['id']}, ${data.start['name']}`

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
    document.getElementById('modeSwitchGuest').checked = false
    document.getElementById('modeSwitchAdmin').checked = false
    //xu li voi backend
    let tmp = await refreshGuest(data);
    if(tmp !== null){
        data = tmp;
    }
}

export function handleChangeMode(e){
    data.mode = e.target.checked ? 'Admin' : 'Guest';

    if (e.target.checked) {
        guestPanel.style.display = 'none';
        adminPanel.style.display = 'block';
        switchAdmin.checked = true;
        data.selecting = ''
    }else{
        adminPanel.style.display = 'none';
        guestPanel.style.display = 'block';
        switchGuest.checked = false;
    }
    sendData(data)
}

export function handleChangeAlgorithm(e) {
    data.algorithm = e.target.value; // Lấy loại thuật toán được chọn
    sendData(data)
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
        showAlert(message)
    }else{
        let backendData = await findPath(data)
        if(backendData.length === 0) {
            showAlert("Không tìm thấy đường đi")
            return
        }
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
}

export function setEnd(e){
    data.selecting = 'end'
}

function showAlert(message){
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
}

//admin functions
export async function drawPolygon(type) {
    const drawControl = new L.Draw.Polygon(map);
    drawControl.enable();

    map.once(L.Draw.Event.CREATED, async (e) => {
        const layer = e.layer
        layer.setStyle({color: zoneColors[type], fillOpacity: 0.4})
        layer.addTo(map)
        let id = String(Date.now()%1000)
        while(draw_zones[type].has(id)) id = String(Date.now()%1000)
        draw_zones[type].set(id, layer)
        renderZoneList(type)

        const boundary = layer.getLatLngs()[0]
        await sendData(data)
        const selected_edges = await postBoundary({boundary, type, id})
        data = await getData()
        console.log(data)
        selected_edges.forEach(edge => {
            edgePolyLines[edge[2]].setStyle({color: "black", weight: 3});
        });
    });
}

export function renderZoneList(type) {
    const listId = {
        block: "blockedList",
        flood: "floodList",
        traffic: "trafficList",
        oneway: "onewayList"
    }[type];

    const list = document.getElementById(listId);
    list.innerHTML = "";
    draw_zones[type].forEach((z, id) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = `${type.toUpperCase()} #${id}`;
        li.appendChild(span);
        const btn = document.createElement("button");
        btn.textContent = "Xóa";
        btn.addEventListener("click", () => {
            removeZone(type, id);
        });
        li.appendChild(btn);
        list.appendChild(li);
    });
}


export async function removeZone(type, id) {
    map.removeLayer(draw_zones[type].get(id));
    draw_zones[type].delete(id)
    renderZoneList(type);
    console.log(data.zones[type])
    let selected_edges = data.zones[type][id][1]
    selected_edges.forEach(edge => {
        edgePolyLines[edge[2]].setStyle({color: "green", weight: 3});
    });
    data.zones = await delete_zone({id, type})
}

export function edgeUIHandle(e, mode){
    if(e.target.checked){
        edgeLayer.addTo(map)
    }else{
        map.removeLayer(edgeLayer)
    }
    if(mode === 'admin'){
        document.getElementById('toggleEdgeGuest')
            .checked = e.target.checked
    }else{
        document.getElementById('toggleEdgeAdmin')
            .checked = e.target.checked
    }
}

export function nodeUIHandle(e, mode){
    if(e.target.checked){
        nodeLayer.addTo(map)
    }else{
        map.removeLayer(nodeLayer)
    }
    if(mode === 'admin'){
        document.getElementById('toggleNodeGuest')
            .checked = e.target.checked
    }else{
        document.getElementById('toggleNodeAdmin')
            .checked = e.target.checked
    }
}

export function resetAdmin(e){
    Object.keys(draw_zones).forEach(type => {
        draw_zones[type].forEach(z => map.removeLayer(z.layer));
        draw_zones[type].clear();
        renderZoneList(type);
    });
}

export function buttonClickAdmin(btn){
    const active = btn.classList.toggle("active");
    const panel = btn.nextElementSibling;
    if (panel) panel.classList.toggle("hidden", !active);

    document.querySelectorAll(".toggle-btn").forEach(b => {
        if (b !== btn) {
            b.classList.remove("active");
            const p = b.nextElementSibling;
            if (p) p.classList.add("hidden");
        }
    });
}