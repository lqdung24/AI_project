import {load_map} from "./map.js";
import {loadHTML} from "./load-html.js";
import {initEventListener} from "./event_listener.js";

loadHTML().then(() => {
    initEventListener();
    load_map();
})
