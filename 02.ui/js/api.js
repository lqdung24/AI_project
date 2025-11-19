import {map} from "./map.js";
import {showAlert} from './functions.js'
export const API_URL='http://localhost:8000'

export async function getNearestPoint(node) {
    const res = await fetch(`${API_URL}/point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'node': node})
    }).catch(err => console.error("Fetch error:", err));

    const resData = await res.json()
    //console.log(resData.data)
    return resData.data
}

export async function refreshGuest(data){
    const res = await fetch(`${API_URL}/guest/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'data': data})
    }).catch(err => console.error("Fetch error:", err));

    const resData = await res.json()
    //console.log(resData.data)
    return resData.data
}


export async function findPath(data){
    const res = await fetch(`${API_URL}/guest/find-path`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'data': data})
    }).catch(err => console.error("Fetch error:", err));

    const resData = await res.json()
    //console.log(resData.data)
    return resData.data
}

export async function sendData(data){
    const res = await fetch(`${API_URL}/guest/update-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'data': data})
    }).catch(err => console.error("Fetch error:", err));

    const resData = await res.json()
    //console.log(resData.data)
    return resData.data
}

export async function getData(){
    return send_fetch('/data', 'POST', null)
}

export async function send_fetch(url, method, data){
    let res;
    if(method === "GET"){
        res = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: { "Content-Type": "application/json" },
        }).catch(err => console.error("Fetch error:", err));
    }else {
        res = await fetch(`${API_URL}${url}`, {
            method: method,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({'data': data})
        }).catch(err => console.error("Fetch error:", err));
    }

    const resData = await res.json()
    //console.log(resData.data)
    return resData.data;
}

//admin function
export async function set_one_way(type, id, data){
    return send_fetch('/admin/zones/oneway', 'POST', {type, id, data})
}
export async function changeCoeffFetch(type, id, data){
    return send_fetch('/admin/zones/coeff', 'POST', {type, id, data})
}
export async function delete_zone(data){
    return send_fetch('/admin/zones', 'DELETE', data)
}
export async function reset_admin(){
    return send_fetch('/admin/reset', 'DELETE', {})
}
export async function postBoundary(data){
    const res = await fetch(`${API_URL}/admin/zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'data': data})
    }).catch(err => {
        console.error("Fetch error:", err)
    });

    if (!res.ok){
        showAlert('Vui lòng chọn đường không phân nhánh')
        return
    }
    const resData = await res.json()
    //console.log(resData.data)
    return resData.data
}

// lấy thông tin về phuong
export async function getBoundary(){
    fetch(`${API_URL}/data/boundary`)
        .then(res => res.json())
        .then(data => {
            const filtered = {
                ...data,
                features: data.features.filter(f => f.geometry.type !== 'Point')
            };

            const geoLayer = L.geoJSON(filtered, {
                style: {
                    color: 'blue',
                    weight: 4,
                    fillOpacity: 0
                }
            }).addTo(map);

            map.fitBounds(geoLayer.getBounds());
        })
        .catch(err => console.error("Không thể tải GeoJSON:", err));
}
export let nodeLayer
export async function getNodes(){
    nodeLayer = L.layerGroup().addTo(map)
    Papa.parse(`${API_URL}/data/nodes`, {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(n => {
                if(n.lat && n.lng) {
                    L.circleMarker([parseFloat(n.lat), parseFloat(n.lng)], {
                        radius: 2,
                        color: "red",
                        fillColor: "red",
                        fillOpacity: 0.3
                    }).addTo(nodeLayer);
                }
            });
        }
    });
}
export let edgeLayer
export const edgePolyLines = {}
export async function getEdges(){
    edgeLayer = L.layerGroup().addTo(map); // nhóm chứa tất cả edge

    Papa.parse(`${API_URL}/data/edges`, {
        download: true,
        header: true,
        complete: function(results) {
            results.data.forEach(e => {
                if (e.geometry && e.geometry.includes("LINESTRING")) {
                    const coords = e.geometry
                        .replace("LINESTRING (", "")
                        .replace(")", "")
                        .split(", ")
                        .map(pair => pair.split(" ").map(Number))
                        .map(([x, y]) => [y, x]); // [lat, lng]

                    const polyline = L.polyline(coords, { color: "green", weight: 2 });
                    edgePolyLines[e.id] = polyline;
                    polyline.addTo(edgeLayer).bringToFront();
                }
            });
        }
    });
}

