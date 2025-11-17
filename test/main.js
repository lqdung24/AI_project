// // === 1️⃣ Khởi tạo bản đồ Kim Liên ===
// const map = L.map('map').setView([21.0105, 105.8368], 16);
//
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
// }).addTo(map);
//
// // === 2️⃣ Chuẩn bị layer chứa đường và vùng vẽ ===
// const drawnItems = new L.FeatureGroup();
// map.addLayer(drawnItems);
//
// let allRoads = [];
// let allNodes = {};
//
// // === 3️⃣ Thêm công cụ vẽ vùng ===
// const drawControl = new L.Control.Draw({
//     draw: {
//         polygon: true,
//         rectangle: true,
//         circle: false,
//         circlemarker: false,
//         polyline: false,
//         marker: false,
//     },
//     edit: {
//         featureGroup: drawnItems
//     }
// });
// map.addControl(drawControl);
//
// // === 4️⃣ Hàm tải dữ liệu đường ở phường Kim Liên ===
// async function fetchRoadsInKimLien() {
//     const south = 21.006;
//     const west = 105.828;
//     const north = 21.015;
//     const east = 105.843;
//
//     const query = `
//     [out:json];
//     (
//       way["highway"](${south},${west},${north},${east});
//       node(w);
//     );
//     out body;
//   `;
//     const url = "https://overpass-api.de/api/interpreter";
//     const response = await axios.post(url, query, {
//         headers: { "Content-Type": "text/plain" }
//     });
//
//     return response.data;
// }
//
// // === 5️⃣ Vẽ các tuyến đường thật ===
// function drawOSMData(osmData) {
//     osmData.elements.forEach(el => {
//         if (el.type === 'node') {
//             allNodes[el.id] = [el.lat, el.lon];
//         }
//     });
//
//     osmData.elements.forEach(el => {
//         if (el.type === 'way' && el.tags && el.tags.highway) {
//             const latlngs = el.nodes.map(id => allNodes[id]).filter(Boolean);
//             const name = el.tags.name || '(không tên)';
//             const polyline = L.polyline(latlngs, { color: 'blue', weight: 3 });
//             polyline.roadName = name;
//             polyline.addTo(map);
//             allRoads.push(polyline);
//         }
//     });
// }
//
// // === 6️⃣ Hàm kiểm tra polyline có nằm trong polygon không ===
// function isPolylineInsidePolygon(polyline, polygon) {
//     const latlngs = polyline.getLatLngs();
//     return latlngs.every(p => polygon.contains(p));
// }
//
// // === 7️⃣ Khi người dùng vẽ vùng ===
// map.on(L.Draw.Event.CREATED, (e) => {
//     const layer = e.layer;
//     drawnItems.addLayer(layer);
//     const polygon = layer; // hình vừa vẽ
//
//     allRoads.forEach(road => {
//         if (isPolylineInsidePolygon(road, polygon)) {
//             road.setStyle({ color: 'gray', dashArray: '5, 5' });
//             road.bindPopup(`🚫 Đường "${road.roadName}" bị cấm`);
//         }
//     });
// });
//
// // === 8️⃣ Khởi động ===
// (async function init() {
//     alert("Đang tải dữ liệu đường ở phường Kim Liên...");
//     const osmData = await fetchRoadsInKimLien();
//     drawOSMData(osmData);
// })();
