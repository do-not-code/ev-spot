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

// NLEVBEEVBP2444412*2429171 = confirmed (0,1)
// NLEVBEEVBP2444412*2429125 = confirmed (0,3)

const EVSE_ID_GRID_POSITION = {
    "NLEVBEEVBP2444412*2429255": [0,0], "NLEVBEEVBP2444412*2429010": [1,0],
    "NLEVBEEVBP2444412*2429171": [0,1], "NLEVBEEVBP2444412*2429124": [1,1],
    "NLEVBEEVBP2444412*2429112": [0,2], "NLEVBEEVBP2444412*2429105": [1,2],
    "NLEVBEEVBP2444412*2429125": [0,3], "NLEVBEEVBP2444412*2429260": [1,3],
    "NLEVBEEVBP2444412*2429088": [0,4], "NLEVBEEVBP2444412*2429239": [1,4]
};

function updateStatus(evses) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "80vw");
    svg.setAttribute("height", "80vh");
    svg.setAttribute("viewBox", "0 0 24 60");
    for (const i in evses) {
        if (evses[i].evseId in EVSE_ID_GRID_POSITION) {
            const [x, y] = EVSE_ID_GRID_POSITION[evses[i].evseId];
            const rect = document.createElementNS(svgNS, "rect");
            rect.setAttribute("x", x * 12 + 1);
            rect.setAttribute("y", y * 12 + 1);
            rect.setAttribute("width", 10);
            rect.setAttribute("height", 10);
            rect.setAttribute("rx", 1);
            rect.setAttribute("ry", 1);
            rect.setAttribute("fill", evses[i].status === "AVAILABLE" ? "green" : "red");
            svg.appendChild(rect);
        }
    }
    document.getElementById("page").replaceChildren(svg);
}

const LATITUDE = 52.29063197504729;
const LONGITUDE = 4.700785959139466;
const MARGIN = 0;

async function refresh() {
    // get location ids
    var search = await fetchJSON(
        "https://api.road.io/1/map/search",
        {
            "gridPrecision": 8,
            "bbox": {
                "nwLat": LATITUDE + MARGIN,
                "nwLng": LONGITUDE - MARGIN,
                "seLat": LATITUDE - MARGIN,
                "seLng": LONGITUDE + MARGIN
            }
        }
    );
    var evses = [];
    for (const i in search.data) {
        const ids = search.data[i].ids;
        // get status for each location id
        var locations = await fetchJSON(
            "https://api.road.io/1/map/locations",
            {
                "ids": ids
            }
        );
        // aggregate status for each evse
        for (const j in locations.data) {
            for (const k in locations.data[j].evses) {
                evses.push({
                    "evseId": locations.data[j].evses[k].evseId,
                    "status": locations.data[j].evses[k].status
                });
            }
        }
    }
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
