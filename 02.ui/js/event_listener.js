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
}
