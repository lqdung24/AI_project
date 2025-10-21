import {map} from "./map.js";
import {API_URL} from "./config.js";

map.on('click', function(e) {
    const {lat, lng} = e.latlng;

    fetch(`${API_URL}/point`, {
        method: "POST",
            headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: lat, lng: lng })
        })
        .then(response => response.json())
        .then(response => {
            const node = response.data;
            console.log(response)
            L.marker([node.lat, node.lng])
                .addTo(map)
                .bindPopup(`ID: ${node.id}, Streets: ${node.street_count}`)
                .openPopup();
        })
        .catch(err => console.error("Fetch error:", err));
});
