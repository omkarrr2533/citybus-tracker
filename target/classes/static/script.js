// Main application JavaScript - Updated with real-time location tracking

// Global variables
let trackingMap = null;
let homeMap = null;
let busMarkers = {};
let userMarker = null;
let routeLayers = {};
let selectedBusRoute = null;
let ws = null;
let currentUser = null;
let userLocation = null;
let currentPathToStop = null;
let nearestStopMarker = null;
let routingControl = null;

// Initialize particles background
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 5 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 18}s`;
        particle.style.animationDuration = `${18 + Math.random() * 12}s`;

        particlesContainer.appendChild(particle);
    }
}

// Initialize dark mode toggle
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (!darkModeToggle || !themeIcon) return;

    // Check for saved theme preference
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update icon based on current theme
    updateThemeIcon(currentTheme, themeIcon);

    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
    });
}

function updateThemeIcon(theme, iconElement) {
    if (theme === 'dark') {
        iconElement.className = 'fas fa-sun';
    } else {
        iconElement.className = 'fas fa-moon';
    }
}

// Initialize navigation and button functionality
function setupNavigationAndButtons() {
    // Track Now button functionality
    const trackNowBtn = document.getElementById('track-now-btn');
    if (trackNowBtn) {
        trackNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchToPage('tracking');
        });
    }

    // Search button functionality
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performBusSearch();
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleContactFormSubmit();
        });
    }

    // FAQ functionality
    setupFAQ();
}

// Setup FAQ accordion functionality
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// Switch to specific page
function switchToPage(pageName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });

    // Show target page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        if (page.id === pageName) {
            page.classList.add('active');

            // Initialize map if tracking page
            if (pageName === 'tracking') {
                setTimeout(() => initTrackingMap(), 100);
            }
        }
    });

    window.scrollTo(0, 0);
}

// Navigation functionality with driver login fix
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');

            // Handle driver login specially
            if (link.id === 'driver-login-link') {
                // Redirect to driver page
                window.location.href = '/driver';
                return;
            }

            if (targetPage) {
                switchToPage(targetPage);
            }
        });
    });
}

// Auto-login user (no authentication required for regular users)
function autoLoginUser() {
    currentUser = {
        username: 'Guest User',
        role: 'user',
        isAuthenticated: true
    };

    updateUserInterface();

    // Store in session
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

    console.log('User auto-logged in as guest');
}

// Update user interface based on login status
function updateUserInterface() {
    const userInfo = document.getElementById('user-info');
    const userStatusText = document.getElementById('user-status-text');
    const logoutBtn = document.getElementById('logout-btn');

    if (userInfo && userStatusText) {
        userInfo.style.display = 'block';
        userStatusText.textContent = currentUser ? currentUser.username : 'Guest';

        if (logoutBtn && currentUser && currentUser.role === 'driver') {
            logoutBtn.style.display = 'block';
        }
    }
}

// Initialize home map with enhanced styling
function initHomeMap() {
    const homeMapElement = document.getElementById('home-map');
    if (!homeMapElement || homeMap) return;

    homeMap = L.map('home-map').setView([19.8762, 75.3433], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(homeMap);

    // Add sample bus stop markers with fresh styling
    const sampleStops = [
        { name: "Central Bus Station", coords: [19.8762, 75.3433] },
        { name: "Railway Station", coords: [19.8610, 75.3101] },
        { name: "Airport Road", coords: [19.8650, 75.3980] },
        { name: "City Center Mall", coords: [19.8750, 75.3450] },
        { name: "Medical College", coords: [19.8690, 75.3200] }
    ];

    sampleStops.forEach(stop => {
        L.marker(stop.coords, {
            icon: L.divIcon({
                className: 'stop-marker',
                html: `<div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);"></div>`,
                iconSize: [21, 21],
                iconAnchor: [10, 10]
            })
        }).addTo(homeMap).bindPopup(`
            <div style="text-align: center; font-weight: 600;">
                <strong style="color: #ff6b6b;">${stop.name}</strong><br>
                <small style="color: #4a5568;">Bus Stop</small>
            </div>
        `);
    });

    console.log('Home map initialized with fresh theme');
}

// Initialize tracking map with enhanced functionality
function initTrackingMap() {
    const trackingMapElement = document.getElementById('tracking-map');
    if (!trackingMapElement) {
        console.error('Tracking map element not found');
        return;
    }

    if (trackingMap) {
        trackingMap.invalidateSize();
        return;
    }

    // Create map
    trackingMap = L.map('tracking-map').setView([19.8762, 75.3433], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(trackingMap);

    // Get user location
    getUserLocation();

    // Load bus routes
    loadBusRoutes();

    // Generate bus list
    generateBusList();

    // Connect to WebSocket for real-time updates
    connectWebSocket();

    console.log('Tracking map initialized with fresh theme');
}

// Get user's current location with enhanced marker
function getUserLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        // Default to Aurangabad coordinates
        if (trackingMap) {
            trackingMap.setView([19.8762, 75.3433], 13);
        }
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            userLocation = { lat: latitude, lng: longitude };

            if (!userMarker && trackingMap) {
                // Create user location marker with pulsing effect
                userMarker = L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'user-marker',
                        html: `
                            <div style="
                                background: linear-gradient(135deg, #4ecdc4, #ffe66d);
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 4px solid white;
                                box-shadow: 0 3px 12px rgba(78, 205, 196, 0.4);
                                position: relative;
                                animation: pulse 2s infinite;
                            ">
                                <div style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    font-size: 10px;
                                    color: white;
                                    font-weight: bold;
                                ">📍</div>
                            </div>
                        `,
                        iconSize: [28, 28],
                        iconAnchor: [14, 14]
                    })
                }).addTo(trackingMap);

                userMarker.bindPopup(`
                    <div style="text-align: center; font-weight: 600;">
                        <strong style="color: #4ecdc4;">📍 Your Location</strong><br>
                        <small style="color: #4a5568;">Lat: ${latitude.toFixed(6)}</small><br>
                        <small style="color: #4a5568;">Lng: ${longitude.toFixed(6)}</small>
                    </div>
                `);

                // Center map on user location
                trackingMap.setView([latitude, longitude], 15);

                // Send user location to server
                sendUserLocation(latitude, longitude);
            }
        },
        (error) => {
            console.error('Error getting location:', error);
            // Default to Aurangabad coordinates
            if (trackingMap) {
                trackingMap.setView([19.8762, 75.3433], 13);
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}



// Load and display bus routes with fresh colors
function loadBusRoutes() {
    if (!trackingMap) return;

    const routes = {
"1": {
    name: "Harsul t,point to Csmss college",
    path: [
        [19.83253681483603, 75.29043365981501],
        [19.83341867846705, 75.29048568252132],
        [19.83545011799008, 75.29206138806062],
        [19.83734651194447, 75.29236146398863],
        [19.83873183684019, 75.2925903271297],
        [19.84285287402733, 75.29322724566526],
        [19.84468356620371, 75.29444799544524],
        [19.84667706215674, 75.29463815658494],
        [19.84787376336374, 75.29666519701549],
        [19.86127185576102, 75.3070330890779],
        [19.86094604268669, 75.31019683092944],
        [19.86955028334207, 75.31225875519746],
        [19.87651901726746, 75.31712996224708],
        [19.88157695314591, 75.31761273158502],
        [19.88414221501092, 75.31718918183617],
        [19.88762132653282, 75.3204123125509],
        [19.89054244155257, 75.32156126453295],
        [19.89119786081724, 75.32222794091739],
        [19.89190929469798, 75.32540114141526],
        [19.89231445373854, 75.32840299354088],
        [19.89326257913964, 75.32933341206237],
        [19.89322989703486, 75.33163885267477],
        [19.89434722705892, 75.33467361323066],
        [19.89414944955452, 75.33717747091215],
        [19.89656112452172, 75.33747043665575],
        [19.90520354370145, 75.34261288712844],
        [19.91284184704634, 75.34917687942682],
        [19.91489372986223, 75.35246186091891]
    ],
    color: '#1c92eb',
    stops: [
               { name: "Csmss college", coords: [19.83253681483603, 75.29043365981501] },
               { name: "Hudico corner", coords: [19.90965254287012, 75.34628072302766] },
               { name: "Collector office", coords: [19.89431393518074, 75.33729288190757] },
               { name: "Mill corner", coords: [19.88402875484406, 75.31706712485533] },
               { name: "Baba petrol pump", coords: [19.8738334732043, 75.31554731002528] },
               { name: "Railway station", coords: [19.86111970411336, 75.31022282226043] },
               { name: "Dhule-Solapur highway", coords: [19.85490610933454, 75.30237099822557] },
               { name: "Harsul T point ", coords: [19.91489372986223, 75.35246186091891] }
           ]
},

        "2": {
            name: "Fame Tapadia Signal",
            path:
            [
                              [19.86936646701711, 75.39632256251001],
                              [19.870611879497, 75.39080178044756],
                              [19.87146529078089, 75.38745659019966],
                              [19.87216114774766, 75.38265369697324],
                              [19.87225005031377, 75.37708618391231],
                              [19.87408976024522, 75.36563879717801],
                              [19.8747413175669, 75.36229225120753],
                              [19.87487511786902, 75.35564886462205],
                              [19.8763785526522, 75.34565907432639],
                              [19.87541008177487, 75.3362910685772],
                              [19.8753199061867, 75.33495277435907],
                              [19.87331838306769, 75.32857296684109],
                              [19.87219392328148, 75.32563303176121],
                              [19.87205852069712, 75.32269327142923],
                              [19.87396779635687, 75.31542643778187],
                              [19.87446166837491, 75.31141116387577],
                              [19.87695562494967, 75.30483788382271],
                              [19.87711282179161, 75.30397732253373],
                              [19.87596564722558, 75.30079871633696]
            ],
            color: '#1c92eb',
            stops: [
                       { name: 'Fame Tapadia Signal', coords: [19.86971570872217, 75.39514179647698] },
                       { name: 'N1 Ganpati ', coords: [19.87230727333787, 75.37588314921581] },
                       { name: ' Wokhardt ', coords: [19.87389490107866, 75.36689875963823] },
                       { name: 'Ambedkar Chowk', coords: [19.87527134017097, 75.35235331030567] },
                       { name: 'Jaiswal Hall ', coords: [19.87576379041766, 75.33946849733468] },
                       { name: ' SBOA ', coords: [19.87332246553949, 75.32844657676995] },
                       { name: ' T. Point ', coords: [19.87213261517093, 75.32248160270399] },
                       { name: 'Power House ', coords: [19.8739295312812, 75.31534864403808] },
                       { name: 'Nagar Naka ', coords: [19.87609014058089, 75.3008869356705] }
                   ]
        },

        "3": {
                    name: "Chikalthana",
                    path: [
                        [19.873573, 75.394782],
                        [19.869982, 75.394397],
                        [19.871974, 75.385324],
                        [19.873522, 75.370390],
                        [19.874840, 75.355761],
                        [19.875275, 75.352356],
                        [19.876049, 75.341475],
                        [19.873642, 75.328705],
                        [19.872266, 75.322000],
                        [19.860902, 75.310143],
                        [19.861369, 75.306988],
                        [19.847678, 75.296336],
                        [19.833201, 75.290463]
                    ],
                    color: '#ff6b6b',
                    stops: [
                                { name: 'Chikalthana', coords: [19.873573, 75.394782] },
                                { name: ' Dhoot Hospita', coords: [19.869982, 75.394397] },
                                { name: ' Ram Nagar', coords: [19.871974, 75.385324] },
                                { name: 'API Corner', coords: [19.873522, 75.370390] },
                                { name: 'Ramgiri Hotel', coords: [19.874840, 75.355761] },
                                { name: ' Seven Hills', coords: [19.875275, 75.352356] },
                                { name: 'Akashwani', coords: [19.876049, 75.341475] },
                                { name: 'Mondha Naka', coords: [19.873642, 75.328705] },
                                { name: ' Amarpreet', coords: [19.872266, 75.322000] },
                                { name: 'Kranti Chowk', coords: [19.872266, 75.322000] },
                                { name: ' Gopal T', coords: [19.860902, 75.310143] },
                                { name: ' Jai Tower', coords: [19.861369, 75.306988] },
                                { name: ' Padampura', coords: [19.847678, 75.296336] },
                                { name: ' csmss', coords: [19.833201, 75.290463] },
                            ]
                },

                "4": {
                                    name: "Baliram Patil High School",
                                    path: [
                                        [19.895877, 75.358173],
                                        [19.888110, 75.360340],
                                        [19.879980, 75.360448],
                                        [19.883450420753835, 75.35381853503729],
                                        [19.875295, 75.353286],
                                        [19.869060, 75.350870],
                                        [19.858987, 75.344975],
                                        [19.857757, 75.334539],
                                        [19.850451, 75.333036],
                                        [19.854130, 75.305745],
                                        [19.854687, 75.302286],
                                        [19.841854, 75.293056],
                                        [19.832519, 75.290360]
                                    ],
                                    color: '#ff6b6b',
                                    stops: [
                                                { name: ' Baliram Patil High School', coords: [19.895877, 75.358173] },
                                                { name: ' Bajrang Chowk RD', coords: [19.888110, 75.360340] },
                                                { name: ' Chistiya Chowk RD', coords: [19.879980, 75.360448] },
                                                { name: ' Central Naka RD', coords: [19.883450420753835, 75.35381853503729] },
                                                { name: ' Seven Hills Signal', coords: [19.875295, 75.353286] },
                                                { name: ' Gajanan Mandir', coords: [19.869060, 75.350870] },
                                                { name: ' Reliance Mall', coords: [19.865591, 75.349258] },
                                                { name: ' suthgirni showk RD', coords: [19.858987, 75.344975] },
                                                { name: ' Shivaji Nagar RD', coords: [19.857757, 75.334539] },
                                                { name: ' Darga RD', coords: [19.850451, 75.333036] },
                                                { name: ' Dhule- Solapur Hwy', coords: [19.854130, 75.305745] },
                                                { name: ' Dhule- Solapur Hwy Corner', coords: [19.854687, 75.302286] },
                                                { name: ' Jai Shriram Square', coords: [19.841854, 75.293056] },
                                                { name: ' CSMSS', coords: [19.832519, 75.290360] }
                                            ]
                                },
    };

    // Store routes but don't display initially
    window.busRoutes = routes;
    console.log('Bus routes loaded with fresh colors');
}

// Generate bus list with enhanced styling
function generateBusList() {
    const busList = document.getElementById('bus-list');
    if (!busList) return;

    // Default buses (will be updated with real data from WebSocket)
    const defaultBuses = [
        { id: 'bus-1', route: 'Route 1: Harsul', routeId: '1', status: 'Active', nextStop: 'Hudico corner' },
        { id: 'bus-2', route: 'Route 1: Ambedkar Chowk', routeId: '1', status: 'Active', nextStop: 'Bai' },
        { id: 'bus-3', route: 'Route 2: Chikalthana', routeId: '2', status: 'Active', nextStop: 'Wokhardt' },
        { id: 'bus-4', route: 'Route 2: Mahalaxmi Chowk', routeId: '2', status: 'Active', nextStop: 'Railway Station' },
        { id: 'bus-5', route: 'Route 1: Baliram Patil High School', routeId: '1', status: 'Active', nextStop: 'Pratap Chowk' }
    ];

    busList.innerHTML = '';

    defaultBuses.forEach(bus => {
        const busCard = document.createElement('div');
        busCard.className = 'bus-card';
        busCard.setAttribute('data-bus-id', bus.id);
        busCard.setAttribute('data-route-id', bus.routeId);

        busCard.innerHTML = `
            <div class="bus-number">${bus.id.toUpperCase()}</div>
            <div class="bus-route">${bus.route}</div>
            <div class="bus-status status-active">
                <i class="fas fa-circle"></i> ${bus.status}
            </div>
            <div class="bus-next-stop">Next: ${bus.nextStop}</div>
            <button class="track-bus-btn" data-bus-id="${bus.id}" data-route-id="${bus.routeId}">
                <i class="fas fa-map-marker-alt"></i> Track This Bus
            </button>
        `;

        busList.appendChild(busCard);

        // Add click event to track button
        const trackBtn = busCard.querySelector('.track-bus-btn');
        trackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            trackBus(bus.id, bus.routeId);
        });

        // Add click event to entire card
        busCard.addEventListener('click', () => {
            selectBusRoute(bus.routeId);
        });
    });

    console.log('Bus list generated with fresh styling');
}

// Track specific bus and show route
function trackBus(busId, routeId) {
    console.log(`Tracking bus ${busId} on route ${routeId}`);

    // Clear previous selection
    clearRouteSelection();

    // Show route
    showRoute(routeId);

    // Send tracking request to server
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'track-bus',
            data: { busId: busId }
        }));
    }

    // Update UI to show tracking status
    updateTrackingStatus(busId, routeId);
}

// Select and highlight route
function selectBusRoute(routeId) {
    // Clear previous routes
    clearRouteSelection();

    // Show selected route
    showRoute(routeId);

    // Update bus cards visual state
    document.querySelectorAll('.bus-card').forEach(card => {
        card.classList.remove('selected');
        if (card.getAttribute('data-route-id') === routeId) {
            card.classList.add('selected');
        }
    });

    selectedBusRoute = routeId;
    console.log(`Selected route ${routeId}`);
}

// Show specific route on map with fresh colors
function showRoute(routeId) {
    if (!trackingMap || !window.busRoutes) return;

    const route = window.busRoutes[routeId];
    if (!route) return;

    // Draw route path with enhanced styling
    const routePath = L.polyline(route.path, {
        color: route.color,
        weight: 5,
        opacity: 0.9,
        dashArray: '10, 5',
        lineJoin: 'round',
        lineCap: 'round'
    }).addTo(trackingMap);

    // Store route layer
    routeLayers[routeId] = {
        path: routePath,
        stops: []
    };

    // Add stops with enhanced markers
    route.stops.forEach((stop, index) => {
        const stopMarker = L.marker(stop.coords, {
            icon: L.divIcon({
                className: 'stop-marker',
                html: `<div style="background: ${route.color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(trackingMap);

        stopMarker.bindPopup(`
            <div style="text-align: center; font-weight: 600;">
                <strong style="color: ${route.color};">Stop ${index + 1}</strong><br>
                <span style="color: #2d3748;">${stop.name}</span><br>
                <small style="color: #4a5568;">Route: ${route.name}</small>
            </div>
        `);
        routeLayers[routeId].stops.push(stopMarker);
    });

    // Fit map to route bounds
    const group = new L.featureGroup([routePath]);
    trackingMap.fitBounds(group.getBounds().pad(0.1));
}

// Clear all route selections
function clearRouteSelection() {
    // Remove route layers
    Object.keys(routeLayers).forEach(routeId => {
        const routeLayer = routeLayers[routeId];
        if (routeLayer.path) {
            trackingMap.removeLayer(routeLayer.path);
        }
        routeLayer.stops.forEach(stop => {
            trackingMap.removeLayer(stop);
        });
    });

    // Clear route layers object
    routeLayers = {};

    // Remove bus markers (but keep real-time driver markers)
    Object.keys(busMarkers).forEach(busId => {
        if (busMarkers[busId].isSimulated) {
            trackingMap.removeLayer(busMarkers[busId]);
        }
    });

    // Clear simulated bus markers only
    Object.keys(busMarkers).forEach(busId => {
        if (busMarkers[busId].isSimulated) {
            delete busMarkers[busId];
        }
    });

    // Clear visual selection
    document.querySelectorAll('.bus-card').forEach(card => {
        card.classList.remove('selected');
    });

    selectedBusRoute = null;
}

// Update bus locations from WebSocket data
function updateBusLocations(busData) {
    if (!trackingMap || !Array.isArray(busData)) return;

    busData.forEach(bus => {
        if (bus.coords && bus.coords.length >= 2) {
            const [lat, lng] = bus.coords;
            const busId = bus.busId;

            if (busMarkers[busId]) {
                // Update existing marker
                busMarkers[busId].setLatLng([lat, lng]);
            } else {
                // Create new real-time bus marker
                const busIcon = L.divIcon({
                    className: 'bus-marker real-time',
                    html: `
                        <div style="
                            background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            border: 4px solid white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 12px;
                            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
                            animation: pulse 2s infinite;
                        ">🚌</div>
                    `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                busMarkers[busId] = L.marker([lat, lng], { icon: busIcon })
                    .addTo(trackingMap)
                    .bindPopup(`
                        <div style="text-align: center; font-weight: 600;">
                            <strong style="color: #ff6b6b;">${busId.toUpperCase()}</strong><br>
                            <span style="color: #2d3748;">Driver: ${bus.driverId || 'Unknown'}</span><br>
                            <span style="color: #4ecdc4; font-size: 0.9rem;">Status: Live Tracking</span><br>
                            <small style="color: #718096;">Last update: ${new Date(bus.lastSeen).toLocaleTimeString()}</small>
                        </div>
                    `);

                // Mark as real-time (not simulated)
                busMarkers[busId].isSimulated = false;
            }

            // Update bus card status if exists
            updateBusCardStatus(busId, 'Active', new Date(bus.lastSeen));
        }
    });
}

// Update bus card status in the list
function updateBusCardStatus(busId, status, lastSeen) {
    const busCard = document.querySelector(`[data-bus-id="${busId}"]`);
    if (busCard) {
        const statusElement = busCard.querySelector('.bus-status');
        const nextStopElement = busCard.querySelector('.bus-next-stop');

        if (statusElement) {
            statusElement.innerHTML = `<i class="fas fa-circle"></i> ${status}`;
            statusElement.className = `bus-status status-${status.toLowerCase()}`;
        }

        if (nextStopElement && lastSeen) {
            const timeAgo = Math.round((Date.now() - lastSeen) / 60000); // minutes ago
            nextStopElement.innerHTML = `Updated ${timeAgo} min ago`;
        }
    }
}

// Connect to WebSocket for real-time updates
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/websocket`;

    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = function() {
            console.log('WebSocket connected to server');

            // Register as user
            ws.send(JSON.stringify({
                type: 'user-register',
                data: {
                    userId: 'user_' + Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now()
                }
            }));
        };

        ws.onmessage = function(event) {
            try {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onclose = function() {
            console.log('WebSocket connection closed');
            // Try to reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
    } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
    }
}
// Add these functions to your existing script.js

// Request ETA for a specific bus
function requestBusETA(busId) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return;
    }

    if (!userLocation) {
        console.error('User location not available');
        showNotification('Please enable location services to see ETA');
        return;
    }

    const message = {
        type: 'request-eta',
        data: {
            busId: busId,
            coords: [userLocation.lat, userLocation.lng]
        }
    };

    ws.send(JSON.stringify(message));
}

// Request ETA for all buses
function requestAllBusETAs() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return;
    }

    if (!userLocation) {
        console.error('User location not available');
        return;
    }

    const message = {
        type: 'request-eta',
        data: {
            coords: [userLocation.lat, userLocation.lng]
        }
    };

    ws.send(JSON.stringify(message));
}

// Update handleWebSocketMessage to include ETA responses
function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'user-registered':
            console.log('User registered successfully:', message.data);
            // Request initial ETAs
            setTimeout(() => requestAllBusETAs(), 1000);
            break;

        case 'active-buses':
            if (message.data) {
                updateBusLocations(message.data);
                // Request ETAs for all active buses
                requestAllBusETAs();
            }
            break;

        case 'bus-location-update':
            if (message.data) {
                updateSingleBusLocation(message.data);
            }
            break;

        case 'bus-location-update-with-eta':  // NEW
            if (message.data) {
                updateBusLocationWithETA(message.data);
            }
            break;

        case 'eta-response':  // NEW
            if (message.data) {
                displayBusETA(message.data);
            }
            break;

        case 'all-etas-response':  // NEW
            if (message.data) {
                updateAllBusETAs(message.data);
            }
            break;

        case 'new-driver-available':
            console.log('New driver available:', message.data);
            break;

        case 'driver-left':
            console.log('Driver left:', message.data);
            removeBusMarker(message.data.driverId);
            break;

        case 'tracking-started':
            console.log('Tracking started:', message.data);
            showNotification(`Now tracking ${message.data.busId}`);
            requestBusETA(message.data.busId);
            break;

        default:
            console.log('Unknown message type:', message.type);
    }
}

// Update bus location with ETA
function updateBusLocationWithETA(busData) {
    if (busData.coords && busData.coords.length >= 2) {
        const [lat, lng] = busData.coords;
        const busId = busData.busId;
        const etaInfo = busData.eta;

        if (busMarkers[busId]) {
            busMarkers[busId].setLatLng([lat, lng]);

            // Update popup with ETA
            if (etaInfo && etaInfo.available) {
                busMarkers[busId].setPopupContent(`
                    <div style="text-align: center; font-weight: 600;">
                        <strong style="color: #ff6b6b;">${busId.toUpperCase()}</strong><br>
                        <span style="color: #2d3748;">Driver: ${busData.driverId || 'Unknown'}</span><br>
                        <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;">
                        <div style="background: linear-gradient(135deg, #4ecdc4, #44a08d); color: white; padding: 8px; border-radius: 8px; margin: 8px 0;">
                            <i class="fas fa-clock"></i> <strong>ETA: ${etaInfo.formattedETA}</strong><br>
                            <small>📍 Distance: ${etaInfo.distanceKm} km</small>
                        </div>
                        <small style="color: #718096;">Last update: ${new Date().toLocaleTimeString()}</small>
                    </div>
                `);
            }
        } else {
            updateBusLocations([busData]);
        }

        // Update bus card with ETA
        if (etaInfo && etaInfo.available) {
            updateBusCardWithETA(busId, etaInfo);
        }
    }
}

// Display ETA for a specific bus
function displayBusETA(etaInfo) {
    if (!etaInfo.available) {
        showNotification('ETA not available for this bus');
        return;
    }

    const busId = etaInfo.busId;
    updateBusCardWithETA(busId, etaInfo);

    // Show notification with ETA
    showNotification(`Bus ${busId.toUpperCase()}: ${etaInfo.formattedETA} away (${etaInfo.distanceKm} km)`);
}

// Update all bus cards with ETAs
function updateAllBusETAs(etaList) {
    if (!Array.isArray(etaList)) return;

    etaList.forEach(etaInfo => {
        if (etaInfo.available) {
            updateBusCardWithETA(etaInfo.busId, etaInfo);
        }
    });
}

// Update bus card with ETA information
function updateBusCardWithETA(busId, etaInfo) {
    const busCard = document.querySelector(`[data-bus-id="${busId}"]`);
    if (!busCard) return;

    const nextStopElement = busCard.querySelector('.bus-next-stop');
    if (nextStopElement) {
        nextStopElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="background: linear-gradient(135deg, #4ecdc4, #44a08d); color: white; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                    <i class="fas fa-clock"></i> ${etaInfo.formattedETA}
                </span>
                <span style="color: var(--text-secondary);">
                    📍 ${etaInfo.distanceKm} km away
                </span>
            </div>
        `;
    }
}

// Auto-refresh ETAs every 15 seconds
setInterval(() => {
    if (userLocation && ws && ws.readyState === WebSocket.OPEN) {
        requestAllBusETAs();
    }
}, 15000);

// Request ETAs when user location changes
function sendUserLocation(lat, lng) {
    userLocation = { lat, lng };

    if (ws && ws.readyState === WebSocket.OPEN) {
        const message = {
            type: 'user-location',
            data: {
                coords: [lat, lng],
                timestamp: Date.now()
            }
        };
        ws.send(JSON.stringify(message));

        // Request ETAs for new location
        setTimeout(() => requestAllBusETAs(), 500);
    }
}


// Update single bus location
function updateSingleBusLocation(busData) {
    if (busData.coords && busData.coords.length >= 2) {
        const [lat, lng] = busData.coords;
        const busId = busData.busId;

        if (busMarkers[busId]) {
            busMarkers[busId].setLatLng([lat, lng]);
        } else {
            updateBusLocations([busData]);
        }
    }
}

// Remove bus marker when driver disconnects
function removeBusMarker(busId) {
    if (busMarkers[busId]) {
        trackingMap.removeLayer(busMarkers[busId]);
        delete busMarkers[busId];

        // Update bus card status
        updateBusCardStatus(busId, 'Offline', new Date());
    }
}

// Show notification to user
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-bell"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update tracking status in UI
function updateTrackingStatus(busId, routeId) {
    showNotification(`Now tracking ${busId.toUpperCase()} on ${window.busRoutes[routeId]?.name || 'Route ' + routeId}`);
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('route-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterBusList(searchTerm);
        });

        // Allow Enter key to trigger search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performBusSearch();
            }
        });
    }
}

// Perform bus search
function performBusSearch() {
    const searchInput = document.getElementById('route-search');
    if (searchInput) {
        const searchTerm = searchInput.value.toLowerCase();
        filterBusList(searchTerm);
    }
}

// Filter bus list based on search
function filterBusList(searchTerm) {
    const busCards = document.querySelectorAll('.bus-card');

    busCards.forEach(card => {
        const busId = card.querySelector('.bus-number').textContent.toLowerCase();
        const routeName = card.querySelector('.bus-route').textContent.toLowerCase();

        if (busId.includes(searchTerm) || routeName.includes(searchTerm) || searchTerm === '') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Route filter functionality
function setupRouteFilter() {
    const routeFilter = document.getElementById('route-filter');
    if (routeFilter) {
        routeFilter.addEventListener('change', (e) => {
            const selectedRoute = e.target.value;
            filterBusByRoute(selectedRoute);
        });
    }
}

// Filter buses by route
function filterBusByRoute(routeId) {
    const busCards = document.querySelectorAll('.bus-card');

    busCards.forEach(card => {
        const cardRouteId = card.getAttribute('data-route-id');

        if (routeId === 'all' || cardRouteId === routeId) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

async function showPathToNearestStop(routeId) {
    if (!trackingMap || !userLocation) {
        showNotification('Please enable location services to see the path');
        return;
    }

    try {
        // Clear any existing path
        clearPathToStop();

        // Find nearest stop on the selected route
        const response = await fetch('/api/route-path/nearest-stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                routeId: routeId,
                userLat: userLocation.lat,
                userLng: userLocation.lng
            })
        });

        if (!response.ok) {
            throw new Error('Failed to find nearest stop');
        }

        const nearestStopData = await response.json();

        if (!nearestStopData || !nearestStopData.stop) {
            showNotification('No stops found on this route');
            return;
        }

        const stopCoords = nearestStopData.stop.coords;
        const stopName = nearestStopData.stop.name;
        const distanceMeters = nearestStopData.distance;
        const walkingTime = nearestStopData.walkingTime;

        // Create routing using Leaflet Routing Machine for realistic paths
        await createRealisticRoute(
            userLocation.lat,
            userLocation.lng,
            stopCoords[0],
            stopCoords[1],
            stopName,
            distanceMeters,
            walkingTime
        );

        // Add marker at nearest stop
        addNearestStopMarker(stopCoords, stopName, distanceMeters, walkingTime);

        // Show info panel
        showRouteInfoPanel(nearestStopData);

        // Zoom to show both user and stop
        const bounds = L.latLngBounds(
            [userLocation.lat, userLocation.lng],
            [stopCoords[0], stopCoords[1]]
        );
        trackingMap.fitBounds(bounds, { padding: [50, 50] });

    } catch (error) {
        console.error('Error showing path to stop:', error);
        showNotification('Could not calculate path to bus stop');
    }
}

/**
 * Create realistic routing using OSRM (Open Source Routing Machine)
 * This provides actual road-based routing with turns and curves
 */
async function createRealisticRoute(startLat, startLng, endLat, endLng, stopName, distance, walkingTime) {
    try {
        // Use OSRM API for realistic routing
        const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates;

            // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
            const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

            // Create animated, highlighted path
            currentPathToStop = L.polyline(latLngs, {
                color: '#FF1744',  // Bright red/pink
                weight: 8,
                opacity: 0.9,
                dashArray: '20, 15',
                lineCap: 'round',
                lineJoin: 'round',
                className: 'animated-path'
            }).addTo(trackingMap);

            // Add glow effect
            L.polyline(latLngs, {
                color: '#FF6B9D',
                weight: 12,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(trackingMap);

            // Animate the path
            animatePath(currentPathToStop);

            // Add turn-by-turn markers
            if (route.legs && route.legs[0] && route.legs[0].steps) {
                addTurnMarkers(route.legs[0].steps);
            }

            // Show distance and duration from OSRM
            const routeDistance = Math.round(route.distance);
            const routeDuration = Math.round(route.duration / 60);

            showNotification(
                `📍 Path to ${stopName}: ${routeDistance}m (${routeDuration} min walk)`
            );

            // Bind popup to path
            currentPathToStop.bindPopup(`
                <div style="text-align: center; font-weight: 600;">
                    <strong style="color: #FF1744;">🚶 Walking Route</strong><br>
                    <small>To: ${stopName}</small><br>
                    <hr style="margin: 5px 0;">
                    <strong>${routeDistance} meters</strong><br>
                    <small>≈ ${routeDuration} minutes walk</small>
                </div>
            `);

        } else {
            // Fallback to straight line if routing fails
            createFallbackRoute(startLat, startLng, endLat, endLng, stopName, distance, walkingTime);
        }

    } catch (error) {
        console.error('Routing error:', error);
        // Fallback to straight line
        createFallbackRoute(startLat, startLng, endLat, endLng, stopName, distance, walkingTime);
    }
}

/**
 * Fallback route (straight line) if OSRM fails
 */
function createFallbackRoute(startLat, startLng, endLat, endLng, stopName, distance, walkingTime) {
    currentPathToStop = L.polyline([
        [startLat, startLng],
        [endLat, endLng]
    ], {
        color: '#FF1744',
        weight: 6,
        opacity: 0.8,
        dashArray: '15, 10',
        lineCap: 'round'
    }).addTo(trackingMap);

    animatePath(currentPathToStop);

    currentPathToStop.bindPopup(`
        <div style="text-align: center; font-weight: 600;">
            <strong style="color: #FF1744;">🚶 Direct Path</strong><br>
            <small>To: ${stopName}</small><br>
            <hr style="margin: 5px 0;">
            <strong>${distance} meters</strong><br>
            <small>≈ ${walkingTime} minutes walk</small>
        </div>
    `);
}

/**
 * Animate the path with a moving dash effect
 */
function animatePath(polyline) {
    let offset = 0;

    setInterval(() => {
        offset = (offset + 1) % 35;
        if (polyline && polyline._path) {
            polyline._path.style.strokeDashoffset = offset;
        }
    }, 100);
}

/**
 * Add turn-by-turn direction markers
 */
function addTurnMarkers(steps) {
    const importantManeuvers = ['turn', 'merge', 'fork', 'roundabout'];

    steps.forEach((step, index) => {
        if (index === 0 || index === steps.length - 1) return; // Skip start/end

        const maneuver = step.maneuver;
        if (maneuver && importantManeuvers.some(m => maneuver.type.includes(m))) {
            const coords = maneuver.location;

            L.circleMarker([coords[1], coords[0]], {
                radius: 6,
                fillColor: '#FFF',
                color: '#FF1744',
                weight: 2,
                opacity: 1,
                fillOpacity: 1
            }).addTo(trackingMap).bindPopup(`
                <small><strong>${maneuver.modifier || maneuver.type}</strong></small>
            `);
        }
    });
}

/**
 * Add marker at the nearest bus stop
 */
function addNearestStopMarker(coords, name, distance, walkingTime) {
    if (nearestStopMarker) {
        trackingMap.removeLayer(nearestStopMarker);
    }

    const icon = L.divIcon({
        className: 'nearest-stop-marker',
        html: `
            <div style="
                background: linear-gradient(135deg, #FF1744, #F50057);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 4px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                box-shadow: 0 4px 15px rgba(255, 23, 68, 0.5);
                animation: bounce 2s infinite;
            ">🚏</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    nearestStopMarker = L.marker(coords, { icon: icon })
        .addTo(trackingMap)
        .bindPopup(`
            <div style="text-align: center; min-width: 200px;">
                <strong style="color: #FF1744; font-size: 16px;">🚏 Nearest Stop</strong><br>
                <strong style="font-size: 14px;">${name}</strong><br>
                <hr style="margin: 8px 0; border: none; border-top: 2px solid #FF1744;">
                <div style="display: flex; justify-content: space-around; margin-top: 8px;">
                    <div>
                        <strong style="color: #FF1744;">${distance}m</strong><br>
                        <small>Distance</small>
                    </div>
                    <div>
                        <strong style="color: #FF1744;">~${walkingTime} min</strong><br>
                        <small>Walking</small>
                    </div>
                </div>
            </div>
        `);

    nearestStopMarker.openPopup();
}

/**
 * Show route information panel
 */
function showRouteInfoPanel(stopData) {
    // Remove existing panel if any
    const existingPanel = document.getElementById('route-info-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'route-info-panel';
    panel.className = 'route-info-panel';
    panel.innerHTML = `
        <div class="panel-header">
            <h3>📍 Nearest Stop: ${stopData.stop.name}</h3>
            <button class="close-panel" onclick="clearPathToStop()">✕</button>
        </div>
        <div class="panel-content">
            <div class="info-item">
                <span class="info-icon">📏</span>
                <span class="info-label">Distance:</span>
                <span class="info-value">${stopData.distance} meters (${stopData.distanceKm} km)</span>
            </div>
            <div class="info-item">
                <span class="info-icon">🚶</span>
                <span class="info-label">Walking Time:</span>
                <span class="info-value">~${stopData.walkingTime} minutes</span>
            </div>
            <div class="info-item">
                <span class="info-icon">🚌</span>
                <span class="info-label">Route:</span>
                <span class="info-value">${stopData.routeName}</span>
            </div>
        </div>
        <button class="navigate-btn" onclick="openInMaps(${stopData.stop.coords[0]}, ${stopData.stop.coords[1]}, '${stopData.stop.name}')">
            🗺️ Open in Maps
        </button>
    `;

    document.body.appendChild(panel);

    // Animate panel entry
    setTimeout(() => {
        panel.classList.add('show');
    }, 100);
}

/**
 * Clear the path and markers
 */
function clearPathToStop() {
    if (currentPathToStop) {
        trackingMap.removeLayer(currentPathToStop);
        currentPathToStop = null;
    }

    if (nearestStopMarker) {
        trackingMap.removeLayer(nearestStopMarker);
        nearestStopMarker = null;
    }

    // Remove info panel
    const panel = document.getElementById('route-info-panel');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 300);
    }

    // Remove all turn markers (circles)
    trackingMap.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            trackingMap.removeLayer(layer);
        }
    });
}

/**
 * Open location in external maps app
 */
function openInMaps(lat, lng, name) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(mapsUrl, '_blank');
}

/**
 * Update the trackBus function to include path showing
 */
const originalTrackBus = window.trackBus;
window.trackBus = function(busId, routeId) {
    // Call original function
    if (originalTrackBus) {
        originalTrackBus(busId, routeId);
    }

    // Clear previous selection
    clearRouteSelection();

    // Show route
    showRoute(routeId);

    // Show path to nearest stop (NEW!)
    showPathToNearestStop(routeId);

    // Send tracking request to server
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'track-bus',
            data: { busId: busId }
        }));
    }

    // Update UI to show tracking status
    updateTrackingStatus(busId, routeId);
};

/**
 * Update selectBusRoute to also show path
 */
const originalSelectBusRoute = window.selectBusRoute;
window.selectBusRoute = function(routeId) {
    // Call original function
    if (originalSelectBusRoute) {
        originalSelectBusRoute(routeId);
    }

    // Show path to nearest stop
    showPathToNearestStop(routeId);
};

// Also update when bus cards are clicked
document.addEventListener('DOMContentLoaded', () => {
    // Wait for bus list to be generated
    setTimeout(() => {
        document.querySelectorAll('.bus-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking the track button
                if (!e.target.closest('.track-bus-btn')) {
                    const routeId = this.getAttribute('data-route-id');
                    if (routeId) {
                        showPathToNearestStop(routeId);
                    }
                }
            });
        });
    }, 2000);
});

// Handle contact form submission
function handleContactFormSubmit() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('contact-success');

    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Simple validation
    if (!name || !email || !message) {
        alert('Please fill in all required fields');
        return;
    }

    // Show success message
    if (successMessage) {
        successMessage.classList.add('show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }

    // Reset form
    form.reset();
    console.log('Contact form submitted successfully');
}

// Check for existing session
function checkExistingSession() {
    const userData = sessionStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUserInterface();
    } else {
        // Auto-login as guest
        autoLoginUser();
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing CityBus application with real-time tracking...');

    // Initialize components
    initParticles();
    initDarkModeToggle();
    setupNavigation();
    setupNavigationAndButtons();
    setupSearch();
    setupRouteFilter();

    // Check/setup user session
    checkExistingSession();

    // Initialize home map when home page loads
    const homeSection = document.getElementById('home');
    if (homeSection && homeSection.classList.contains('active')) {
        setTimeout(() => initHomeMap(), 500);
    }

    // Set up observer to initialize maps when pages become visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    if (target.id === 'home' && !homeMap) {
                        setTimeout(() => initHomeMap(), 100);
                    } else if (target.id === 'tracking' && !trackingMap) {
                        setTimeout(() => initTrackingMap(), 100);
                    }
                }
            }
        });
    });

    // Observe all page elements
    document.querySelectorAll('.page').forEach(page => {
        observer.observe(page, { attributes: true });
    });

    console.log('CityBus application initialized with real-time tracking');
});

// Map click handler to clear route selection
document.addEventListener('click', (e) => {
    // If clicking on map (not on bus cards or buttons), clear route selection
    if (e.target.closest('#tracking-map') && !e.target.closest('.bus-card') && !e.target.closest('.track-bus-btn')) {
        if (selectedBusRoute) {
            clearRouteSelection();
        }
    }
});
// Add to your existing script.js
function integrateChatbot() {
    // Make chatbot functions available globally
    window.openBusChatbot = function(busNumber) {
        if (window.citybusChatbot) {
            window.citybusChatbot.openChatbot();
            setTimeout(() => {
                window.askChatbot(`Where is bus ${busNumber}?`);
            }, 300);
        }
    };

    // Add chatbot help to navigation
    const helpLink = document.createElement('a');
    helpLink.href = '#';
    helpLink.className = 'nav-item nav-link';
    helpLink.innerHTML = '<i class="nav-icon fas fa-robot"></i><span class="nav-text">AI Assistant</span>';
    helpLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.citybusChatbot) {
            window.citybusChatbot.openChatbot();
        }
    });

    // Add to navigation menu
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.appendChild(helpLink);
    }
}

// Call this function in your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // ... your existing code ...
    integrateChatbot();
});
// Handle page resize
window.addEventListener('resize', () => {
    if (trackingMap) {
        setTimeout(() => trackingMap.invalidateSize(), 100);
    }
    if (homeMap) {
        setTimeout(() => homeMap.invalidateSize(), 100);
    }
});

// Service Worker Registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}