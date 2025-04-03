async function fetchJSON(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

const EVSE_ID_GRID_POSITION = {
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

function updateStatus(evses) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "80vw");
    svg.setAttribute("height", "80vh");
    svg.setAttribute("viewBox", "0 0 24 60");
    evses.forEach(evse => {
        if (evse.evseId !== undefined) {
            const [x, y] = EVSE_ID_GRID_POSITION[evse.evseId];
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

const LATITUDE = 52.290632;
const LONGITUDE = 4.700786;

async function refresh() {
    var search = await fetchJSON(
        "https://api.road.io/1/map/search",
        {
            "gridPrecision": 8,
            "bbox": {
                "nwLat": LATITUDE,
                "nwLng": LONGITUDE,
                "seLat": LATITUDE,
                "seLng": LONGITUDE
            }
        }
    );
    const ids = search.data[0].ids;
    var locations = await fetchJSON(
        "https://api.road.io/1/map/locations",
        {
            "ids": ids
        }
    );
    const evses = locations.data[0].evses;
    updateStatus(evses);
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
