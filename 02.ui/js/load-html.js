async function loadFileHTML(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}

export async function loadHTML(){
    // await loadFileHTML('control-panel', 'control-panel.html')
    await loadFileHTML('guest-pane', 'guest-pane.html')
    await loadFileHTML('admin-pane', 'admin-pane.html')
}