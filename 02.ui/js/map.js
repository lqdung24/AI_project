// Tạo bản đồ Leaflet

import {API_URL} from "./config.js";

export const map = L.map('map', {
    center: [10.776, 106.7], // Tọa độ trung tâm (lat, lon)
    zoom: 15,                // Độ zoom mặc định
    minZoom: 15,             // Zoom nhỏ nhất mà người dùng có thể thu nhỏ
    maxZoom: 19            // Zoom lớn nhất mà người dùng có thể phóng to
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
}).addTo(map);

// Đọc file GeoJSON và hiển thị lên bản đồ
fetch(`${API_URL}/boundary`)
    .then(response => response.json())
    .then(data => {
        const geoLayer = L.geoJSON(data, {
            style: {
                color: 'blue',
                weight: 4,
                fillOpacity: 0
            }
        }).addTo(map);

        // Tự động căn giữa và zoom theo vùng phường
        map.fitBounds(geoLayer.getBounds());
    })
    .catch(err => console.error("Không thể tải GeoJSON:", err));



