import {
    changeCoeffFetch,
    delete_zone,
    edgePolyLines,
    findPath,
    getData,
    getNearestPoint,
    nodeLayer,
    postBoundary,
    refreshGuest, reset_admin,
    sendData, set_one_way
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
        document.getElementById("pathLength")
            .textContent = `${backendData.length} m`
        let time_unit = 'hours'
        if(backendData.cost < 1){
            backendData.cost *= 60;
            time_unit = 'minutes'
        }
        if(backendData.cost < 1){
            backendData.cost *= 60;
            time_unit = 'seconds'
        }
        document.getElementById("pathTime")
            .textContent = `${Math.round(backendData.cost)} ${time_unit}`
        console.log("da tim duong di")
    }
}

export function setStart(e){
    data.selecting = 'start';
}

export function setEnd(e){
    data.selecting = 'end'
}

export function showAlert(message){
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
function getEdgeColorByCoeff(coeff) {
    // coeff từ 1 → 5
    const colors = [
        "#cce5ff", // 1 nhạt
        "#99ccff", // 2
        "#66b2ff", // 3
        "#3399ff", // 4
        "#0066ff"  // 5 đậm
    ];
    return colors[Math.min(Math.max(coeff, 1), 5) - 1];
}

export async function drawPolygon(type) {
    const drawControl = new L.Draw.Polygon(map);
    drawControl.enable();

    map.once(L.Draw.Event.CREATED, async (e) => {
        const layer = e.layer
        layer.setStyle({color: zoneColors[type], fillOpacity: 0.2})
        let id = String(Date.now()%1000)
        while(draw_zones[type].has(id)) id = String(Date.now()%1000)

        const boundary = layer.getLatLngs()[0]
        await sendData(data)
        const selected_edges = await postBoundary({boundary, type, id})
        if(!selected_edges){

            return
        }
        draw_zones[type].set(id, layer)
        layer.addTo(map)
        renderZoneList(type)
        data = await getData()

        let coeff = data.zones[type][id][2]
        if(type === 'oneway'){
            draw_one_way(selected_edges)
        }
        else selected_edges.forEach(edge => {
            edgePolyLines[edge[2]].setStyle({
                color: getEdgeColorByCoeff(coeff),
                weight: 5
            });
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
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.gap = "12px";

        // Tên vùng
        const span = document.createElement("span");
        span.textContent = `${type.toUpperCase()} #${id}`;
        li.appendChild(span);

        // 🔹 flood / traffic: label + input hệ số
        if (type === "flood" || type === "traffic") {
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.gap = "4px";

            const label = document.createElement("span");
            label.textContent = "Hệ số:";

            const input = document.createElement("input");
            input.type = "number";
            input.step = "1";
            input.min = "1";
            input.max = "5";
            input.value = 1;
            input.classList.add("zone-coeff-input");

            input.addEventListener("change", () => {
                changeCoeff(type, id, Number(input.value))
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            li.appendChild(wrapper);
        }

        // 🔹 oneway: checkbox đảo chiều
        if (type === "oneway") {
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.gap = "4px";

            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = 'Đổi chiều'
            btn.classList.add("zone-delete-btn");
            btn.addEventListener("click", () => {
                invert_way(type, id)
            });

            wrapper.appendChild(btn);
            li.appendChild(wrapper);
        }

        // Nút Xóa
        const btn = document.createElement("button");
        btn.textContent = "Xóa";
        btn.classList.add("zone-delete-btn");
        btn.addEventListener("click", () => removeZone(type, id));
        li.appendChild(btn);

        list.appendChild(li);
    });
}

export async function changeCoeff(type, id, newCoeff){
    data.zones[type][id][2] = newCoeff
    await changeCoeffFetch(type, id, data)
    let selected_edges = data.zones[type][id][1]
    selected_edges.forEach(edge => {
        edgePolyLines[edge[2]].setStyle({
            color: getEdgeColorByCoeff(newCoeff),
            weight: 5
        });
    });
}


export async function removeZone(type, id) {
    map.removeLayer(draw_zones[type].get(id));
    draw_zones[type].delete(id)
    renderZoneList(type);
    let selected_edges = data.zones[type][id][1]
    selected_edges.forEach(edge => {
        edgePolyLines[edge[2]].setStyle({color: "green", weight: 3});
    });
    if(type === 'oneway'){
        remove_one_way(data.zones[type][id][1])
        remove_one_way(data.zones[type][id][3])
    }
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

export async function resetAdmin(e){
    Object.keys(draw_zones).forEach(type => {
        const zoneMap = draw_zones[type]; // Đây là Map()
        zoneMap.forEach((z, id) => {
            let selected_edges = data.zones[type][id][1]
            selected_edges.forEach(edge => {
                edgePolyLines[edge[2]].setStyle({color: "green", weight: 3});
            });
            if(type === 'oneway'){
                remove_one_way(data.zones[type][id][1])
                remove_one_way(data.zones[type][id][3])
            }
            map.removeLayer(z);
        });
        zoneMap.clear();
        renderZoneList(type);
    });
    data = await reset_admin()

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

export async function invert_way(type, id){
    data.zones[type][id][2] = !data.zones[type][id][2]
    let edge = data.zones[type][id][1]
    let invert = data.zones[type][id][3]
    data = await set_one_way(type, id, data)
    if(!data.zones[type][id][2]){
        remove_one_way(invert)
        draw_one_way(edge)
    }else{
        draw_one_way(invert)
        remove_one_way(edge)
    }
}

export function remove_one_way(edges){
    edges.forEach(edge => {
        const id = edge[2];
        const poly = edgePolyLines[id];
        if (poly._arrow) {
            map.removeLayer(poly._arrow);
        }
        poly.setStyle({
            color: 'green',
            weight: 2
        });
    })
}
export function draw_one_way(edges){
    edges.forEach(edge => {
        const id = edge[2];
        const poly = edgePolyLines[id];

        // đổi màu cạnh
        poly.setStyle({
            color: getEdgeColorByCoeff(5),
            weight: 5
        });

        // xoá arrow cũ nếu có
        if (poly._arrow) {
            map.removeLayer(poly._arrow);
        }

        // tạo arrow head ở giữa cạnh
        const arrow = L.polylineDecorator(poly, {
            patterns: [
                {
                    offset: '50%',     // 50% = giữa
                    repeat: 0,         // chỉ 1 mũi tên
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 12,
                        headAngle: 45,
                        pathOptions: {
                            stroke: true,
                            color: getEdgeColorByCoeff(5),
                            weight: 2,
                            fill: true,                       // ⬅️ bật fill
                            fillColor: getEdgeColorByCoeff(5),  // ⬅️ màu bên trong
                            fillOpacity: 1
                        }

                    })
                }
            ]
        }).addTo(map);

        // lưu lại để sau có thể xoá hoặc update
        poly._arrow = arrow;
    });
}