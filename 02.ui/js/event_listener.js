import {map} from "./map.js";
import {
    drawPolygon,
    handleChangeAlgorithm,
    handleChangeMode,
    handleFindPathBtn,
    handleNode,
    handleRefresh,
    setEnd,
    setStart,
    removeZone, edgeUIHandle, nodeUIHandle, resetAdmin, buttonClickAdmin
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
            buttonClickAdmin(btn);
        })
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
        .addEventListener("click", resetAdmin);

    document.getElementById("toggleEdgeGuest")
        .addEventListener("change", (e) => edgeUIHandle(e, 'guest'))
    document.getElementById("toggleNodeGuest")
        .addEventListener("change", (e) => nodeUIHandle(e, 'guest'))
    document.getElementById("toggleEdgeAdmin")
        .addEventListener("change", (e) => edgeUIHandle(e, 'admin'))
    document.getElementById("toggleNodeAdmin")
        .addEventListener("change", (e) => nodeUIHandle(e, 'admin'))
}
