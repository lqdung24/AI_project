import {map} from "./map.js";
import {
    handleChangeAlgorithm,
    handleChangeMode,
    handleFindPathBtn,
    handleNode,
    handleRefresh,
    setEnd,
    setStart
} from "./functions.js";

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

    document.getElementById('modeSwitch')
        .addEventListener('change', handleChangeMode);

    document.getElementById('findPathBtn')
        .addEventListener('click', handleFindPathBtn);

    const guestPanel = document.getElementById('guestPanel');
    const adminPanel = document.getElementById('adminPanel');
    const switchGuest = document.getElementById('modeSwitch');
    const switchAdmin = document.getElementById('modeSwitchAdmin');

// Khi bật sang admin
    switchGuest.addEventListener('change', (e) => {
        if (e.target.checked) {
            guestPanel.style.display = 'none';
            adminPanel.style.display = 'block';
        }
        switchAdmin.checked = true;
    });

// Khi tắt admin quay về guest
    switchAdmin.addEventListener('change', (e) => {
        if (!e.target.checked) {
            adminPanel.style.display = 'none';
            guestPanel.style.display = 'block';
        }
        switchGuest.checked = false;
    });

}
