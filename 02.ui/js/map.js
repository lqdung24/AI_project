import {getBoundary, getEdges, getNodes} from "./api.js";

const maxZoom = 18;
const minZoom = 15;
export const map = L.map('map', {
    center: [21.0278, 105.8342], // Tọa độ trung tâm (lat, lon)
    zoom: 15,                // Độ zoom mặc định
    minZoom: minZoom,             // Zoom nhỏ nhất mà người dùng có thể thu nhỏ
    maxZoom: maxZoom            // Zoom lớn nhất mà người dùng có thể phóng to
});

export function load_map(){
    console.log("load map")
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: maxZoom
    }).addTo(map);

    getBoundary();
    getNodes();
    getEdges();
}


