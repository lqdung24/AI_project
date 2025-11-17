import {load_map} from "./map.js";
import {loadHTML} from "./load-html.js";
import {initEventListener} from "./event_listener.js";
import {__init__} from "./functions.js";

loadHTML().then(() => {
    initEventListener();
    load_map();
    __init__();
});
