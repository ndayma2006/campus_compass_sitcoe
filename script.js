// ==========================================================================
// SITCOE Smart Campus Navigation - Core Logic & Data
// ==========================================================================

// Global Coordinates & Map Variables
const mainGate = [16.708013698320368, 74.47822739425105];
let userLocation = null;
let currentDestination = null;
let currentDestinationLabel = "";
let currentDestinationColor = "#3b82f6"; // Default tech blue
let arrivalSpoken = false; // Flag to prevent repeating arrival speech

// Leaflet Map Layers
let map, routeLayer, userMarkerLayer;

// ==========================================================================
// Campus Data - Structured Classrooms, Labs, and Faculty (NO DUPLICATES)
// ==========================================================================

let departments = {
    "CSE": {
        38: [16.70790, 74.47940],
        43: [16.70791, 74.47941],
        44: [16.70792, 74.47942],
        45: [16.70793, 74.47943],
        60: [16.70794, 74.47944]
    },
    "MECH": {
        21: [16.70770, 74.47920],
        22: [16.70771, 74.47921],
        23: [16.70772, 74.47922]
    },
    "Civil": {
        41: [16.70750, 74.47900],
        42: [16.70751, 74.47901]
    },
    "Electrical": {
        61: [16.70730, 74.47880],
        62: [16.70731, 74.47881]
    },
    "ECE": {
        81: [16.70710, 74.47860],
        82: [16.70711, 74.47861]
    },
    "AR": {
        101: [16.70690, 74.47840],
        102: [16.70691, 74.47841]
    },
    "AIDS": {
        111: [16.70700, 74.47850],
        112: [16.70701, 74.47851]
    },
    "Library": {
        121: [16.70670, 74.47820]
    },
    "Admin": {
        "Principal's Cabin": [16.70805, 74.47955],
        "ED Sir's Cabin": [16.70806, 74.47956],
        "Board Room": [16.70807, 74.47957],
        "Main Office": [16.70808, 74.47958],
        "Exam Cell": [16.70810, 74.47960],
        "Placement Cell": [16.70811, 74.47961]
    }
};

let Lab = {
    "CSE": {
        59: { name: "Project Lab", coord: [16.70795, 74.47945] },
        58: { name: "Programming Lab", coord: [16.70796, 74.47946] },
        56: { name: "Network Lab", coord: [16.70797, 74.47947] },
        55: { name: "Web Lab", coord: [16.70798, 74.47948] },
        54: { name: "OS Lab", coord: [16.70799, 74.47949] },
        53: { name: "HOD Office", coord: [16.70800, 74.47950] },
        52: { name: "Language Lab", coord: [16.70802, 74.47952] },
        51: { name: "DB Lab", coord: [16.70803, 74.47953] }
    },
    "MECH": {
        201: { name: "Thermal Lab", coord: [16.70780, 74.47930] },
        202: { name: "Workshop", coord: [16.70781, 74.47931] }
    },
    "Civil": {
        301: { name: "Survey Lab", coord: [16.70755, 74.47905] }
    },
    "Electrical": {
        401: { name: "Machine Lab", coord: [16.70735, 74.47885] }
    },
    "ECE": {
        501: { name: "VLSI Lab", coord: [16.70715, 74.47865] }
    },
    "AR": {
        601: { name: "Robotics Lab", coord: [16.70695, 74.47845] }
    },
    "AIDS": {
        701: { name: "AI Lab", coord: [16.70702, 74.47852] }
    },
    "Admin": {
        "Board Room": { name: "Board Room", coord: [16.70807, 74.47957] },
        "Exam Cell": { name: "Exam Cell Office", coord: [16.70810, 74.47960] },
        "Placement Cell": { name: "Placement Cell Office", coord: [16.70811, 74.47961] }
    }
};

let faculty = {
    "CSE": [
        {
            name: "Dr. A. B. Patil",
            designation: "Professor & HOD",
            cabin: "HOD Office (Room 53)",
            subject: "Computer Networks & Wireless Communication",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70800, 74.47950]
        },
        {
            name: "Prof. P. Q. Deshmukh",
            designation: "Assistant Professor",
            cabin: "OS Lab (Room 54)",
            subject: "Operating Systems",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70799, 74.47949]
        },
        {
            name: "Prof. S. R. Mane",
            designation: "Assistant Professor",
            cabin: "Programming Lab (Room 58)",
            subject: "Java Programming",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70796, 74.47946]
        }
    ],
    "MECH": [
        {
            name: "Dr. S. K. Jadhav",
            designation: "Professor & HOD",
            cabin: "Thermal Lab (Room 201)",
            subject: "Thermodynamics",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70780, 74.47930]
        },
        {
            name: "Prof. A. L. Shinde",
            designation: "Assistant Professor",
            cabin: "Workshop Room (Room 202)",
            subject: "Manufacturing Engineering",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70781, 74.47931]
        }
    ],
    "Civil": [
        {
            name: "Dr. R. V. Kulkarni",
            designation: "Professor & HOD",
            cabin: "Survey Office (Room 301)",
            subject: "Surveying & Building Planning",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70755, 74.47905]
        }
    ],
    "Electrical": [
        {
            name: "Dr. K. N. Joshi",
            designation: "Professor & HOD",
            cabin: "Machine Cabin (Room 401)",
            subject: "Electrical Machines",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70735, 74.47885]
        }
    ],
    "ECE": [
        {
            name: "Dr. M. M. Kamble",
            designation: "Professor & HOD",
            cabin: "VLSI Cabin (Room 501)",
            subject: "VLSI Systems & Microprocessors",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70715, 74.47865]
        }
    ],
    "AR": [
        {
            name: "Dr. G. B. Chavan",
            designation: "Professor & HOD",
            cabin: "Robotics Design (Room 601)",
            subject: "Automation Systems",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70695, 74.47845]
        }
    ],
    "AIDS": [
        {
            name: "Dr. S. S. Kamble",
            designation: "Professor & HOD",
            cabin: "AI Room (Room 701)",
            subject: "Artificial Intelligence & Data Science",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70702, 74.47852]
        }
    ],
    "Library": [
        {
            name: "Mr. P. B. More",
            designation: "Librarian",
            cabin: "Library Cabin (Room 121)",
            subject: "Information Management",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70670, 74.47820]
        }
    ],
    "Admin": [
        {
            name: "Dr. Sanjay A. Khot",
            designation: "Principal",
            cabin: "Principal's Cabin",
            subject: "Administration & Leadership",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70805, 74.47955]
        },
        {
            name: "Hon. Anil A. Bagane",
            designation: "Executive Director (ED Sir)",
            cabin: "ED Sir's Cabin",
            subject: "Strategic Management",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70806, 74.47956]
        },
        {
            name: "Mr. S. M. Dhabade",
            designation: "Registrar / Administrative Officer",
            cabin: "Main Office",
            subject: "Campus Records & Finance",
            image: "faculty-image-placeholder.jpg",
            coord: [16.70808, 74.47958]
        }
    ]
};

// Department Display Labels
const deptDisplayNames = {
    "CSE": "Computer Science & Engineering",
    "MECH": "Mechanical Engineering",
    "Civil": "Civil Engineering",
    "Electrical": "Electrical Engineering",
    "ECE": "Electronics & Computer Engineering",
    "AR": "Architecture Department",
    "AIDS": "AI & Data Science",
    "Library": "Central Library",
    "Admin": "Admin & Executive Offices"
};

// Emergency Services Coordinates
let emergency = {
    "hospital": {
        "name": "Sharad Ayurved Hospital (Yadrav)",
        "phone": "02322-253000",
        "coord": [16.70582, 74.47563],
        "description": "Right next to the SITCOE campus."
    },
    "police": {
        "name": "Shivaji Nagar Police Station",
        "phone": "0230-2432000",
        "coord": [16.68551, 74.45861],
        "description": "Police station serving the Yadrav/Ichalkaranji sector."
    }
};

// ==========================================================================
// Map Initialization
// ==========================================================================

function initMap() {
    // Initialize leaflet map centered at SITCOE Main Gate
    map = L.map('map').setView(mainGate, 18);

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Create persistent overlays
    routeLayer = L.layerGroup().addTo(map);
    userMarkerLayer = L.layerGroup().addTo(map);

    // Initial marker at Main Gate
    L.marker(mainGate)
        .addTo(map)
        .bindPopup("🏫 <strong>SITCOE Main Gate</strong><br>Starting Fallback Location");
}

// ==========================================================================
// Live GPS Tracking System
// ==========================================================================

function setupGPSTracking() {
    const statusText = document.getElementById("trackingStatus");
    const gpsDot = document.getElementById("gpsDot");

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                userLocation = [lat, lng];

                // Update UI status bar to Connected (Green)
                gpsDot.className = "status-dot pulsing-green";
                statusText.innerHTML = `Live GPS Connected (Accuracy: ${Math.round(accuracy)}m)`;

                // Clear previous tracking visual overlays
                userMarkerLayer.clearLayers();

                // Draw user location accuracy circle and custom marker
                L.circle(userLocation, {
                    radius: accuracy,
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 1
                }).addTo(userMarkerLayer);

                L.circleMarker(userLocation, {
                    radius: 8,
                    color: '#ffffff',
                    fillColor: '#ef4444',
                    fillOpacity: 1,
                    weight: 3
                }).addTo(userMarkerLayer).bindPopup("🙋‍♂️ <strong>You are here</strong>");

                // Live dynamic rerouting during walking
                if (currentDestination) {
                    drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
                    checkArrivalDetection(userLocation, currentDestination, currentDestinationLabel);
                }
            },
            (error) => {
                console.warn('Geolocation positioning issue: ' + error.message);
                gpsDot.className = "status-dot pulsing-yellow";

                if (error.code === error.PERMISSION_DENIED) {
                    statusText.innerHTML = "⚠️ GPS Permission denied. Using Main Gate fallback.";
                } else {
                    statusText.innerHTML = "⚠️ GPS signal missing. Using Main Gate fallback.";
                }
                userLocation = null;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        gpsDot.className = "status-dot pulsing-red";
        statusText.innerHTML = "❌ Geolocation is not supported by your browser.";
    }
}

// ==========================================================================
// Route Drawer Component (OSRM API + Straight Dashed Fallback)
// ==========================================================================

function drawRoute(dest, color, label) {
    routeLayer.clearLayers();

    // Determine start point: use active GPS coords, else fallback to Main Gate
    const startPoint = userLocation ? userLocation : mainGate;

    // Call walking profile on OSRM
    const url = `https://router.project-osrm.org/route/v1/walking/${startPoint[1]},${startPoint[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                // Coordinate points returned by OSRM are [lng, lat], map to [lat, lng] for Leaflet
                const path = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                
                // Draw route line
                L.polyline(path, {
                    color: color,
                    weight: 6,
                    opacity: 0.8,
                    lineJoin: 'round'
                }).addTo(routeLayer);
                
                // Zoom map bounds slightly to fit start and destination
                map.fitBounds(L.polyline(path).getBounds(), { padding: [50, 50] });
            } else {
                drawStraightFallbackLine(startPoint, dest, color);
            }
        })
        .catch(err => {
            console.warn("OSRM routing failure, drawing fallback dashed line: ", err);
            drawStraightFallbackLine(startPoint, dest, color);
        });

    // Add marker at destination
    L.marker(dest)
        .addTo(routeLayer)
        .bindPopup(`📍 <strong>${label}</strong><br>Destination marker`)
        .openPopup();
}

function drawStraightFallbackLine(start, dest, color) {
    L.polyline([start, dest], {
        color: color,
        dashArray: "8, 8",
        weight: 4,
        opacity: 0.7
    }).addTo(routeLayer);

    const bounds = L.latLngBounds(start, dest);
    map.fitBounds(bounds, { padding: [50, 50] });
}

// ==========================================================================
// Arrival Detection Helper (Haversine Distance Model)
// ==========================================================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // returns distance in meters
}

function checkArrivalDetection(userCoords, destCoords, label) {
    const distance = calculateDistance(userCoords[0], userCoords[1], destCoords[0], destCoords[1]);
    
    // Check if within 15-20 meters
    if (distance <= 20) {
        if (!arrivalSpoken) {
            arrivalSpoken = true;
            
            // Speak arrival
            speakVoice(`You have arrived at ${label}.`);
            
            // Trigger visual alert
            alert(`🎉 You have arrived at your destination: ${label}!`);
        }
    } else {
        // Reset arrival spoken indicator if we move away
        arrivalSpoken = false;
    }
}

// ==========================================================================
// Department Workspace Controllers
// ==========================================================================

function selectDepartment(dept) {
    // 1. Highlight clicked department button
    const buttons = document.querySelectorAll(".dept-card");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    const activeBtn = document.getElementById(`btn-dept-${dept}`);
    if (activeBtn) activeBtn.classList.add("active");

    // 2. Open workspace card panel
    const deck = document.getElementById("contentDeck");
    deck.style.display = "block";
    
    // Set workspace title
    document.getElementById("selectedDeptName").innerText = deptDisplayNames[dept] || dept;

    // 3. Render Classrooms List
    renderClassrooms(dept);

    // 4. Render Labs List
    renderLabs(dept);

    // 5. Render Faculty Grid
    renderFaculty(dept);

    // Scroll view smoothly to the workspace card
    deck.scrollIntoView({ behavior: 'smooth' });
}

function closeWorkspace() {
    document.getElementById("contentDeck").style.display = "none";
    const buttons = document.querySelectorAll(".dept-card");
    buttons.forEach(btn => btn.classList.remove("active"));
}

function renderClassrooms(dept) {
    const listContainer = document.getElementById("classroomsList");
    listContainer.innerHTML = "";

    const classrooms = departments[dept];
    if (!classrooms || Object.keys(classrooms).length === 0) {
        listContainer.innerHTML = "<p class='text-muted'>No classrooms registered.</p>";
        return;
    }

    for (let roomNum in classrooms) {
        const btn = document.createElement("button");
        btn.className = "badge-btn";
        const isNum = !isNaN(roomNum);
        btn.innerText = isNum ? `Room ${roomNum}` : roomNum;
        btn.onclick = () => {
            currentDestination = classrooms[roomNum];
            currentDestinationLabel = isNum ? `${dept} Room ${roomNum}` : roomNum;
            currentDestinationColor = "#3b82f6"; // Blue accent for classrooms
            arrivalSpoken = false;
            
            speakVoice(`Navigating to ${currentDestinationLabel}.`);
            drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
        };
        listContainer.appendChild(btn);
    }
}

function renderLabs(dept) {
    const listContainer = document.getElementById("labsList");
    listContainer.innerHTML = "";

    const labs = Lab[dept];
    if (!labs || Object.keys(labs).length === 0) {
        listContainer.innerHTML = "<p class='text-muted' style='padding: 10px;'>No laboratories registered.</p>";
        return;
    }

    for (let labId in labs) {
        const labItem = labs[labId];
        
        const card = document.createElement("div");
        card.className = "lab-card";
        
        card.innerHTML = `
            <div class="lab-title-desc">
                <h4>${labItem.name}</h4>
                <p>Room ${labId}</p>
            </div>
            <button class="btn-nav-small">Navigate</button>
        `;

        card.querySelector(".btn-nav-small").onclick = () => {
            currentDestination = labItem.coord;
            currentDestinationLabel = `${labItem.name} (${dept})`;
            currentDestinationColor = "#10b981"; // Green accent for labs
            arrivalSpoken = false;
            
            speakVoice(`Navigating to ${labItem.name}.`);
            drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
        };

        listContainer.appendChild(card);
    }
}

function renderFaculty(dept) {
    const listContainer = document.getElementById("facultyList");
    listContainer.innerHTML = "";

    const facultyMembers = faculty[dept];
    if (!facultyMembers || facultyMembers.length === 0) {
        listContainer.innerHTML = "<p class='text-muted'>No faculty listings available.</p>";
        return;
    }

    facultyMembers.forEach(fac => {
        const card = document.createElement("div");
        card.className = "faculty-card";
        
        // Initial letter for fallback avatar icon
        const initial = fac.name.replace("Dr. ", "").replace("Prof. ", "").charAt(0);

        card.innerHTML = `
            <div class="faculty-avatar">
                <span class="avatar-placeholder">${initial}</span>
            </div>
            <div class="faculty-info">
                <h4>${fac.name}</h4>
                <p class="designation">${fac.designation}</p>
            </div>
            <div class="faculty-details">
                <p>🔑 <strong>Cabin:</strong> ${fac.cabin}</p>
                <p>📚 <strong>Subject:</strong> ${fac.subject}</p>
            </div>
            <button class="btn-faculty-nav">
                <svg viewBox="0 0 24 24" style="width:16px;height:16px;" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                <span>Navigate to Cabin</span>
            </button>
        `;

        card.querySelector(".btn-faculty-nav").onclick = () => {
            currentDestination = fac.coord;
            currentDestinationLabel = `${fac.name}'s Cabin`;
            currentDestinationColor = "#8b5cf6"; // Purple accent for faculty
            arrivalSpoken = false;

            speakVoice(`Navigating to ${fac.name}'s cabin.`);
            drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
        };

        listContainer.appendChild(card);
    });
}

// Emergency / Main Gate direct navigation button
function navigateToMainGate() {
    currentDestination = mainGate;
    currentDestinationLabel = "SITCOE Main Gate";
    currentDestinationColor = "#ef4444"; // Red accent
    arrivalSpoken = false;

    speakVoice("Navigating to SITCOE Main Gate.");
    drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
}

function navigateFaculty(dept, facultyName) {
    const list = faculty[dept] || [];
    const member = list.find(f => f.name.toLowerCase() === facultyName.toLowerCase());
    if (member) {
        currentDestination = member.coord;
        currentDestinationLabel = `${member.name}'s Cabin`;
        currentDestinationColor = "#8b5cf6";
        arrivalSpoken = false;
        drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
    }
}

// ==========================================================================
// Search Auto-complete & Selection Engine
// ==========================================================================

function setupSearchFeature() {
    const searchInput = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("searchSuggestions");
    const clearBtn = document.getElementById("btnClearSearch");

    // Gather flat list of search targets
    function getSearchTargets() {
        let targets = [];

        // 1. Add Departments
        for (let dept in departments) {
            targets.push({
                name: deptDisplayNames[dept] || dept,
                type: "Department",
                deptCode: dept,
                icon: "🏢",
                action: () => {
                    selectDepartment(dept);
                    speakVoice(`Opened ${deptDisplayNames[dept] || dept} details.`);
                }
            });
        }

        // 2. Add Classrooms
        for (let dept in departments) {
            for (let roomNum in departments[dept]) {
                const isNum = !isNaN(roomNum);
                const label = isNum ? `${dept} Room ${roomNum}` : roomNum;
                targets.push({
                    name: label,
                    type: isNum ? "Classroom" : "Admin Office",
                    deptCode: dept,
                    icon: isNum ? "✏️" : "💼",
                    action: () => {
                        selectDepartment(dept);
                        currentDestination = departments[dept][roomNum];
                        currentDestinationLabel = label;
                        currentDestinationColor = "#3b82f6";
                        arrivalSpoken = false;
                        speakVoice(`Navigating to ${label}.`);
                        drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
                    }
                });
            }
        }

        // 3. Add Laboratories
        for (let dept in Lab) {
            for (let labId in Lab[dept]) {
                const labItem = Lab[dept][labId];
                targets.push({
                    name: labItem.name,
                    type: `Lab (Room ${labId})`,
                    deptCode: dept,
                    icon: "🔬",
                    action: () => {
                        selectDepartment(dept);
                        currentDestination = labItem.coord;
                        currentDestinationLabel = `${labItem.name} (${dept})`;
                        currentDestinationColor = "#10b981";
                        arrivalSpoken = false;
                        speakVoice(`Navigating to ${labItem.name}.`);
                        drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
                    }
                });
            }
        }

        // 4. Add Faculty
        for (let dept in faculty) {
            faculty[dept].forEach(fac => {
                targets.push({
                    name: fac.name,
                    type: `Faculty - ${fac.designation}`,
                    deptCode: dept,
                    icon: "👨‍🏫",
                    action: () => {
                        selectDepartment(dept);
                        currentDestination = fac.coord;
                        currentDestinationLabel = `${fac.name}'s Cabin`;
                        currentDestinationColor = "#8b5cf6";
                        arrivalSpoken = false;
                        speakVoice(`Navigating to ${fac.name}'s cabin.`);
                        drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
                    }
                });
            });
        }

        return targets;
    }

    const flatTargets = getSearchTargets();

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length > 0) {
            clearBtn.style.display = "block";
        } else {
            clearBtn.style.display = "none";
            suggestionsBox.style.display = "none";
            return;
        }

        // Attempt server-side search first, fallback to client-side local search
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(results => {
                // Map backend properties back to frontend format
                const matches = results.map(item => ({
                    name: item.name,
                    type: item.type,
                    deptCode: item.dept,
                    icon: item.type.includes("Lab") ? "🔬" : item.type.includes("Faculty") ? "👨‍🏫" : item.type.includes("Classroom") ? "✏️" : "🏢",
                    action: () => {
                        selectDepartment(item.dept);
                        currentDestination = item.coord;
                        currentDestinationLabel = item.name;
                        currentDestinationColor = item.color;
                        arrivalSpoken = false;
                        speakVoice(`Navigating to ${item.name}.`);
                        drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);
                    }
                }));
                renderSuggestions(matches);
            })
            .catch(err => {
                console.warn("Backend search failed, using local fallback: ", err);
                const matches = flatTargets.filter(item => {
                    return item.name.toLowerCase().includes(query) || 
                           item.type.toLowerCase().includes(query) ||
                           item.deptCode.toLowerCase().includes(query);
                });
                renderSuggestions(matches);
            });
    });

    function renderSuggestions(matches) {
        suggestionsBox.innerHTML = "";
        
        if (matches.length === 0) {
            suggestionsBox.innerHTML = `
                <div class="suggestion-item" style="cursor: default; font-style: italic;">
                    <div class="suggestion-name">No matching results found</div>
                </div>
            `;
            suggestionsBox.style.display = "block";
            return;
        }

        // Render at most 6 matching items
        matches.slice(0, 6).forEach(match => {
            const item = document.createElement("div");
            item.className = "suggestion-item";
            item.innerHTML = `
                <span class="suggestion-icon">${match.icon}</span>
                <div class="suggestion-details">
                    <span class="suggestion-name">${match.name}</span>
                    <span class="suggestion-meta">${match.type} (${match.deptCode})</span>
                </div>
            `;
            
            item.onclick = () => {
                match.action();
                searchInput.value = match.name;
                suggestionsBox.style.display = "none";
            };

            suggestionsBox.appendChild(item);
        });

        suggestionsBox.style.display = "block";
    }

    // Hide dropdown on click outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });

    // Clear search box clicked
    clearBtn.onclick = () => {
        searchInput.value = "";
        clearBtn.style.display = "none";
        suggestionsBox.style.display = "none";
    };
}

// ==========================================================================
// Voice Navigation System (Web SpeechRecognition & SpeechSynthesis APIs)
// ==========================================================================

let recognition;
function initVoiceAssistant() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.warn("Speech Recognition API is not supported in this browser.");
        document.getElementById("btnVoiceSearch").style.display = "none";
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micBtn = document.getElementById("btnVoiceSearch");
    const voiceOverlay = document.getElementById("voiceOverlay");
    const transcriptText = document.getElementById("voiceTranscript");
    const closeOverlayBtn = document.getElementById("btnCloseVoice");

    micBtn.addEventListener("click", () => {
        const langSelect = document.getElementById("voiceLanguageSelect");
        if (langSelect) {
            recognition.lang = langSelect.value;
        } else {
            recognition.lang = 'en-US';
        }
        
        voiceOverlay.style.display = "flex";
        transcriptText.innerText = "Listening...";
        try {
            recognition.abort(); // Prevent 'already started' error if button is double-clicked
            setTimeout(() => {
                recognition.start();
            }, 50);
        } catch (err) {
            console.error("Speech Recognition start error: ", err);
        }
    });

    closeOverlayBtn.addEventListener("click", () => {
        recognition.abort();
        voiceOverlay.style.display = "none";
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptText.innerText = `"${transcript}"`;
        
        // Let user see recognized command for 800ms before processing
        setTimeout(() => {
            voiceOverlay.style.display = "none";
            parseVoiceCommand(transcript);
        }, 1000);
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error: ", event.error);
        let errorMsg = `Error: ${event.error}. Try again.`;
        let delay = 2000;
        
        if (event.error === 'not-allowed') {
            errorMsg = "🎤 Microphone permission denied or blocked. Please ensure you are running on localhost/HTTPS and allow microphone access.";
            delay = 5000;
        } else if (event.error === 'no-speech') {
            errorMsg = "🔇 No speech detected. Please speak closer to your mic.";
            delay = 3000;
        } else if (event.error === 'network') {
            errorMsg = "🌐 Network error: Speech recognition service unavailable. Please check your connection.";
            delay = 4000;
        }
        
        transcriptText.innerText = errorMsg;
        setTimeout(() => {
            voiceOverlay.style.display = "none";
        }, delay);
    };

    recognition.onend = () => {
        // Recognition automatically turns off when the user stops speaking
    };
}

// Voice Command Parser Logic
function parseVoiceCommand(command) {
    // Open AI Chat Panel
    openAIChat();
    // Feed the transcript directly to the AI Chatbox
    sendChatMessage(command);
}

let currentSpeechAudio = null;

// SpeechSynthesis wrapper using Flask AI TTS with a native fallback
function speakVoice(phrase) {
    // 1. Cancel ongoing browser-native speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    // 2. Stop any active audio object playing
    if (currentSpeechAudio) {
        currentSpeechAudio.pause();
        currentSpeechAudio = null;
    }

    // 3. Detect language from select dropdown
    const langSelect = document.getElementById("voiceLanguageSelect");
    const lang = langSelect ? langSelect.value : 'en-US';

    // 4. Request neural speech synthesis from Flask API
    const url = `/api/tts?text=${encodeURIComponent(phrase)}&lang=${lang}`;
    currentSpeechAudio = new Audio(url);
    currentSpeechAudio.play().catch(err => {
        console.warn("AI Speech API failed, using browser local SpeechSynthesis: ", err);
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.lang = lang;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    });
}

// Emergency routing drawer
function navigateEmergency(type) {
    const item = emergency[type];
    if (!item) {
        console.error("Emergency contact not found in database: " + type);
        return;
    }

    currentDestination = item.coord;
    currentDestinationLabel = item.name;
    currentDestinationColor = "#ef4444"; // Red color indicator for emergency routes
    arrivalSpoken = false;

    speakVoice(`Navigating to nearest ${type === 'hospital' ? 'hospital' : 'police station'}, ${item.name}.`);
    drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);

    // Update GPS status panel
    const statusText = document.getElementById("trackingStatus");
    if (statusText) {
        statusText.innerHTML = `⚠️ AI Routing to emergency service: ${item.name}`;
    }

    // Scroll to map view
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==========================================================================
// Page Load Initialization
// ==========================================================================

window.addEventListener("DOMContentLoaded", () => {
    initMap();
    setupGPSTracking();
    setupSearchFeature();
    initVoiceAssistant();
    loadDataFromServer();
    setupAIChatbot();
});

// ==========================================================================
// AI Chatbot Helper Logic & Handlers
// ==========================================================================

function loadDataFromServer() {
    fetch('/api/data')
        .then(res => res.json())
        .then(data => {
            departments = data.departments;
            Lab = data.labs;
            faculty = data.faculty;
            if (data.emergency) {
                emergency = data.emergency;
            }
            console.log("Database successfully synced with Python backend.");
        })
        .catch(err => {
            console.warn("Could not sync with Flask API data. Running in static fallback mode.", err);
        });
}

function setupAIChatbot() {
    const toggleBtn = document.getElementById("btnAIChatToggle");
    const closeBtn = document.getElementById("btnCloseAIChat");
    const sendBtn = document.getElementById("btnAISend");
    const chatInput = document.getElementById("aiChatInput");

    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleAIChat);
    }
    if (closeBtn) {
        closeBtn.addEventListener("click", closeAIChat);
    }
    if (sendBtn) {
        sendBtn.addEventListener("click", () => sendChatMessage());
    }
    if (chatInput) {
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendChatMessage();
            }
        });
    }
}

function toggleAIChat() {
    const panel = document.getElementById("aiChatPanel");
    if (panel.style.display === "none") {
        openAIChat();
    } else {
        closeAIChat();
    }
}

function openAIChat() {
    const panel = document.getElementById("aiChatPanel");
    panel.style.display = "flex";
    
    // Focus the chat input box
    const chatInput = document.getElementById("aiChatInput");
    if (chatInput) chatInput.focus();
}

function closeAIChat() {
    const panel = document.getElementById("aiChatPanel");
    panel.style.display = "none";
}

function setChatQuery(query) {
    const chatInput = document.getElementById("aiChatInput");
    if (chatInput) {
        chatInput.value = query;
        sendChatMessage();
    }
}

function sendChatMessage(text = null) {
    const chatInput = document.getElementById("aiChatInput");
    const messagesContainer = document.getElementById("aiChatMessages");
    
    const messageText = text ? text.trim() : chatInput.value.trim();
    if (!messageText) return;

    // Clear input if read from input
    if (!text) {
        chatInput.value = "";
    }

    // Append User Message bubble
    appendBubble(messageText, "user");

    // Append Typing Indicator
    const typingId = appendTypingIndicator();
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Send to Flask AI Endpoint
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
    })
    .then(res => res.json())
    .then(data => {
        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Append Assistant Response
        appendBubble(data.reply, "assistant");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Perform TTS Speak
        const speakText = data.reply.replace(/<\/?[^>]+(>|$)/g, "");
        speakVoice(speakText);

        // If navigation target is returned, trigger map routing
        if (data.navigation) {
            const nav = data.navigation;
            currentDestination = nav.coord;
            currentDestinationLabel = nav.label;
            currentDestinationColor = nav.color || "#3b82f6";
            arrivalSpoken = false;

            // Highlight corresponding department if available
            if (nav.dept) {
                selectDepartment(nav.dept);
            }

            // Draw route on Leaflet Map
            drawRoute(currentDestination, currentDestinationColor, currentDestinationLabel);

            // Visual feedback indicator
            const statusText = document.getElementById("trackingStatus");
            if (statusText) {
                statusText.innerHTML = `📍 AI Navigating to: ${nav.label}`;
            }

            // Smooth scroll to the map
            const mapContainer = document.getElementById("map");
            if (mapContainer) {
                mapContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    })
    .catch(err => {
        console.error("AI chat assistant endpoint failure:", err);
        removeTypingIndicator(typingId);
        appendBubble("Sorry, I had trouble connecting to the AI brain. Check if the Python backend is running.", "assistant");
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

function appendBubble(content, sender) {
    const container = document.getElementById("aiChatMessages");
    const bubble = document.createElement("div");
    bubble.className = `chat-message ${sender}`;
    
    if (sender === "assistant") {
        let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        formatted = formatted.replace(/\n/g, "<br>");
        bubble.innerHTML = formatted;
    } else {
        bubble.innerText = content;
    }
    
    container.appendChild(bubble);
}

function appendTypingIndicator() {
    const container = document.getElementById("aiChatMessages");
    const indicator = document.createElement("div");
    const id = "typing-" + Date.now();
    indicator.id = id;
    indicator.className = "chat-message assistant typing-indicator";
    indicator.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    container.appendChild(indicator);
    return id;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}
