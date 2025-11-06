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

// Demo hiển thị thông tin
document.getElementById('findPathBtn').addEventListener('click', () => {
    document.getElementById('pathLength').textContent = '3.5 km';
    document.getElementById('pathTime').textContent = '5 phút';
});

// ===== Khởi tạo bản đồ =====
// const map = L.map("map").setView([21.0285, 105.8542], 13);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     maxZoom: 19,
// }).addTo(map);

// ===== Dữ liệu các loại vùng =====
const zones = {
    block: [],
    flood: [],
    traffic: [],
    oneway: []
};

// ===== Màu polygon theo loại =====
const zoneColors = {
    block: "#ff4d4d",
    flood: "#4da6ff",
    traffic: "#ffcc00",
    oneway: "#66cc66"
};

// ===== Hàm vẽ polygon =====
function drawPolygon(type) {
    const drawControl = new L.Draw.Polygon(map);
    drawControl.enable();

    map.once(L.Draw.Event.CREATED, (e) => {
        const layer = e.layer;
        layer.setStyle({ color: zoneColors[type], fillOpacity: 0.4 });
        layer.addTo(map);

        const id = Date.now();
        zones[type].push({ id, layer });
        renderZoneList(type);
    });
}

// ===== Hiển thị danh sách vùng =====
function renderZoneList(type) {
    const listId = {
        block: "blockedList",
        flood: "floodList",
        traffic: "trafficList",
        oneway: "onewayList"
    }[type];

    const list = document.getElementById(listId);
    list.innerHTML = "";
    zones[type].forEach(z => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${type.toUpperCase()} #${z.id}</span><button onclick="removeZone('${type}', ${z.id})">Xóa</button>`;
        list.appendChild(li);
    });
}

// ===== Xóa vùng =====
function removeZone(type, id) {
    const idx = zones[type].findIndex(z => z.id === id);
    if (idx !== -1) {
        map.removeLayer(zones[type][idx].layer);
        zones[type].splice(idx, 1);
        renderZoneList(type);
    }
}

// ===== Toggle các panel =====
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

// ===== Sự kiện tạo vùng =====
document.getElementById("createBlockZone").addEventListener("click", () => drawPolygon("block"));
document.getElementById("createFloodZone").addEventListener("click", () => drawPolygon("flood"));
document.getElementById("createTrafficZone").addEventListener("click", () => drawPolygon("traffic"));
document.getElementById("createOnewayZone").addEventListener("click", () => drawPolygon("oneway"));

// ===== Reset tất cả =====
document.getElementById("resetAll").addEventListener("click", () => {
    Object.keys(zones).forEach(type => {
        zones[type].forEach(z => map.removeLayer(z.layer));
        zones[type] = [];
        renderZoneList(type);
    });
});



