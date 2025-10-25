import {getNearestPoint} from "./api.js";
import {map} from "./map.js";

let start = {
    'id': 0,
    'lat': 0,
    'lng': 0,
    'start': true,
    'name': 'undefine',
    'set': false
}

let end = {
    'id': 0,
    'lat': 0,
    'lng': 0,
    'start': false,
    'name': 'undefine',
    'set': false
}
export let mode = null;
let startInput
let endInput
export let selecting = 'start'; // 'start' hoặc 'end'
let algorithm = 'dijkstra';


export function handleNode(e){
    const {lat, lng} = e.latlng;
    if(selecting === 'start'){
        start['lat'] = lat;
        start['lng'] = lng;
        getNearestPoint(start).then(node => {
            start = node
            L.marker([start['lat'], start['lng']])
                .addTo(map)
                .bindPopup(`Streets: ${start['name']}`)
                .openPopup();
        })
    }else if(selecting === 'end'){
        end['lat'] = lat;
        end['lng'] = lng;
        getNearestPoint(end).then(node => {
            end = node
            L.marker([end['lat'], end['lng']])
                .addTo(map)
                .bindPopup(`Streets: ${end['name']}`)
                .openPopup();
        })
    }
}

export function handleRefresh(e){
    document.getElementById('algorithm').selectedIndex = 0;
    startInput.value = '';
    endInput.value = '';
    selecting = null;
    startInput.classList.remove('active-select');
    endInput.classList.remove('active-select');
}

export function handleChangeMode(e){
    mode = e.target.checked ? 'Admin' : 'Guest';
    console.log(mode);
}

export function handleChangeAlgorithm(e) {
    algorithm = e.target.value; // Lấy loại thuật toán được chọn

    console.log("Thuật toán được chọn:", algorithm);
}


export function handleFindPathBtn(e){
    const algo = document.getElementById('algorithm').value;
    const start = startInput.value;
    const end = endInput.value;

    if (!algo || algo === 'Chọn thuật toán') return alert('Vui lòng chọn thuật toán!');
    if (!start || !end) return alert('Vui lòng chọn đủ điểm bắt đầu và kết thúc!');

    alert(`Tìm đường từ "${start}" đến "${end}" bằng ${algo}`);
}

export function setStart(e){
    selecting = 'start';
    console.log(selecting);
}

export function setEnd(e){
    selecting = 'end'
    console.log(selecting);
}