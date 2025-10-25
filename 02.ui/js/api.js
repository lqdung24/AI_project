import {map} from "./map.js";

export const API_URL='http://localhost:8000'

export async function getNearestPoint(node) {
    const res = await fetch(`${API_URL}/point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'node': node})
    }).catch(err => console.error("Fetch error:", err));

    const resData = await res.json()
    console.log(resData.data)
    return resData.data
}

export async function getBoundary(){
    fetch(`${API_URL}/data/boundary`)
        .then(response => response.json())
        .then(data => {
            const geoLayer = L.geoJSON(data, {
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

export async function getNodes(){
    Papa.parse(`${API_URL}/data/nodes`, {
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
}

export async function getEdges(){
    Papa.parse(`${API_URL}/data/edges`, {
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
                        .map(([x, y]) => [y, x]); // [lat, lng]

                    L.polyline(coords, { color: "green", weight: 2 }).addTo(map);
                }
            });
        }
    });
}