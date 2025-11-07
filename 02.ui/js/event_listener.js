import {map} from "./map.js";
import {
    drawPolygon,
    handleChangeAlgorithm,
    handleChangeMode,
    handleFindPathBtn,
    handleNode,
    handleRefresh, renderZoneList,
    setEnd,
    setStart, zones,
    removeZone
} from "./functions.js";


export let guestPanel
export let adminPanel
export let switchGuest
export let switchAdmin
export function initEventListener() {
    map.on('click', handleNode);

    document.getElementById('startPoint')
            .addEventListener('focus', setStart);

    document.getElementById('endPoint')
            .addEventListener('focus', setEnd);

    document.getElementById('algorithm')
        .addEventListener('change', handleChangeAlgorithm);

    document.getElementById('refreshBtn')
        .addEventListener('click', handleRefresh);

    document.getElementById('modeSwitchGuest')
        .addEventListener('change', handleChangeMode);

    document.getElementById('modeSwitchAdmin')
        .addEventListener('change', handleChangeMode);

    document.getElementById('findPathBtn')
        .addEventListener('click', handleFindPathBtn);

    guestPanel = document.getElementById('guestPanel');
    adminPanel = document.getElementById('adminPanel');
    switchGuest = document.getElementById('modeSwitchGuest');
    switchAdmin = document.getElementById('modeSwitchAdmin');

    guestPanel.style.display = 'block';
    adminPanel.style.display = 'none';

    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const active = btn.classList.toggle("active");
            const panel = btn.nextElementSibling;
            if (panel) panel.classList.toggle("hidden", !active);

            // Ẩn các panel khác
            document.querySelectorAll(".toggle-btn").forEach(b => {
                if (b !== btn) {
                    b.classList.remove("active");
                    const p = b.nextElementSibling;
                    if (p) p.classList.add("hidden");
                }
            });
        });
    });

    document.getElementById("createBlockZone")
        .addEventListener("click", () => drawPolygon("block"));
    document.getElementById("createFloodZone")
        .addEventListener("click", () => drawPolygon("flood"));
    document.getElementById("createTrafficZone")
        .addEventListener("click", () => drawPolygon("traffic"));
    document.getElementById("createOnewayZone")
        .addEventListener("click", () => drawPolygon("oneway"));

    document.getElementById("resetAdmin")
        .addEventListener("click", () => {
            Object.keys(zones).forEach(type => {
                zones[type].forEach(z => map.removeLayer(z.layer));
                zones[type] = [];
                renderZoneList(type);
            });
        });
    window.removeZone = removeZone;

}
