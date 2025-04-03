const GRID_POSITION = {
    "NLEVBEEVBP2444412*2429112": [0, 0],
    "NLEVBEEVBP2444412*2429260": [1, 0],
    "NLEVBEEVBP2444412*2429171": [0, 1], // confirmed
    "NLEVBEEVBP2444412*2429239": [1, 1],
    "NLEVBEEVBP2444412*2429255": [0, 2],
    "NLEVBEEVBP2444412*2429088": [1, 2],
    "NLEVBEEVBP2444412*2429124": [0, 3],
    "NLEVBEEVBP2444412*2429010": [1, 3],
    "NLEVBEEVBP2444412*2429105": [0, 4],
    "NLEVBEEVBP2444412*2429125": [1, 4]
};

function updateStatus(data) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "80vw");
    svg.setAttribute("height", "80vh");
    svg.setAttribute("viewBox", "0 0 24 60");
    data.data[0].evses.forEach(evse => {
        if (evse.evseId !== undefined) {
            const [x, y] = GRID_POSITION[evse.evseId];
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x * 12 + 1);
            rect.setAttribute("y", y * 12 + 1);
            rect.setAttribute("width", 10);
            rect.setAttribute("height", 10);
            rect.setAttribute("rx", 1);
            rect.setAttribute("ry", 1);
            rect.setAttribute("fill", evse.status === "AVAILABLE" ? "green" : "red");
            svg.appendChild(rect);
        }
    });

    document.getElementById("page").replaceChildren(svg);
}

const ID = "67c1a6581da267ce0513e042";
const URL = "https://api.e-flux.nl/1/map/locations";

async function refresh() {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ids: [ID]})
        });
        const data = await response.json();
        updateStatus(data);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

window.addEventListener("load", refresh);
window.addEventListener("focus", () => location.reload());

var touchStart = 0;

document.addEventListener("touchstart", (e) => {
    touchStart = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    if (e.changedTouches[0].clientY - touchStart > 240) {
        location.reload();
    }
});