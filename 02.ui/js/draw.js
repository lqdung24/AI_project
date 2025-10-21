// 4. Hiển thị node từ CSV
import {map} from "./map.js";
import {API_URL} from "./config.js";

Papa.parse(`${API_URL}/nodes`, {
    download: true,
    header: true,
    complete: function(results) {
        results.data.forEach(n => {
            if(n.x && n.y) {
                L.circleMarker([parseFloat(n.y), parseFloat(n.x)], {
                    radius: 3,
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 0.7
                })
                    .bindPopup(`Node ID: ${n.osmid}`)
                    .addTo(map);
            }
        });
    }
});

// 5. Hiển thị edges (đường đi) từ CSV
Papa.parse(`${API_URL}/edges`, {
    download: true,
    header: true,
    complete: function(results) {
        results.data.forEach(e => {
            if(e.geometry && e.geometry.includes("LINESTRING")) {
                const coords = e.geometry
                    .replace("LINESTRING (", "")
                    .replace(")", "")
                    .split(", ")
                    .map(pair => pair.split(" ").map(Number))
                    .map(([x, y]) => [y, x]); // [lat, lon]

                L.polyline(coords, { color: "green", weight: 2 }).addTo(map);
            }
        });
    }
});