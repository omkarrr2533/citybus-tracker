// Advanced Features Frontend Implementation
// Add this to your script.js or create as advanced-features.js

// Global variables for advanced features
let weatherCondition = 'CLEAR';
let capacityUpdateInterval = null;
let stopApproachCheckInterval = null;
let lostItemsCache = new Map();

// ===== WEATHER-ADJUSTED ETA =====

/**
 * Fetch weather data and adjust ETAs
 */
async function initializeWeatherTracking() {
    // Try to get weather data from a free API
    try {
        const position = await getCurrentPosition();
        const weather = await fetchWeatherData(position.coords.latitude, position.coords.longitude);
        weatherCondition = mapWeatherToCondition(weather);
        updateWeatherDisplay(weather);
    } catch (error) {
        console.log('Weather data not available, using default');
    }
}

/**
 * Get weather data from Open-Meteo (free, no API key needed)
 */
async function fetchWeatherData(lat, lng) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

/**
 * Map weather codes to our conditions
 */
function mapWeatherToCondition(weather) {
    if (!weather) return 'CLEAR';

    const weatherCode = weather.weathercode;

    // WMO Weather interpretation codes
    if (weatherCode >= 95) return 'STORM'; // Thunderstorm
    if (weatherCode >= 71 && weatherCode <= 86) return 'SNOW'; // Snow
    if (weatherCode >= 61 && weatherCode <= 67) return 'HEAVY_RAIN'; // Rain
    if (weatherCode >= 51 && weatherCode <= 57) return 'LIGHT_RAIN'; // Drizzle
    if (weatherCode >= 45 && weatherCode <= 48) return 'FOG'; // Fog

    return 'CLEAR';
}

/**
 * Update weather display in UI
 */
function updateWeatherDisplay(weather) {
    const weatherIcon = getWeatherIcon(weatherCondition);
    const weatherInfo = document.createElement('div');
    weatherInfo.id = 'weather-info';
    weatherInfo.className = 'weather-info';
    weatherInfo.innerHTML = `
        <div class="weather-display">
            <span class="weather-icon">${weatherIcon}</span>
            <span class="weather-temp">${Math.round(weather?.temperature || 25)}°C</span>
            <span class="weather-condition">${weatherCondition.replace('_', ' ')}</span>
        </div>
    `;

    const header = document.querySelector('.header-container');
    if (header && !document.getElementById('weather-info')) {
        header.appendChild(weatherInfo);
    }
}

function getWeatherIcon(condition) {
    const icons = {
        'CLEAR': '☀️',
        'LIGHT_RAIN': '🌦️',
        'HEAVY_RAIN': '🌧️',
        'SNOW': '❄️',
        'FOG': '🌫️',
        'STORM': '⛈️'
    };
    return icons[condition] || '☀️';
}

/**
 * Calculate weather-adjusted ETA for a bus
 */
async function getWeatherAdjustedETA(busId, busCoords, targetCoords) {
    try {
        const response = await fetch('/api/advanced/weather-eta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busId: busId,
                busCoords: busCoords,
                targetCoords: targetCoords,
                weatherCondition: weatherCondition
            })
        });

        const etaData = await response.json();
        return etaData;
    } catch (error) {
        console.error('Weather ETA error:', error);
        return null;
    }
}

// ===== STOP-APPROACH PRECISION =====

/**
 * Start monitoring bus approach to stops
 */
function startStopApproachMonitoring(busId, routeId) {
    // Clear any existing interval
    if (stopApproachCheckInterval) {
        clearInterval(stopApproachCheckInterval);
    }

    // Check every 5 seconds
    stopApproachCheckInterval = setInterval(async () => {
        const busLocation = busMarkers[busId];
        if (busLocation && busLocation._latlng) {
            const coords = [busLocation._latlng.lat, busLocation._latlng.lng];
            await checkBusApproach(busId, coords, routeId);
        }
    }, 5000);
}

/**
 * Check if bus is approaching a stop
 */
async function checkBusApproach(busId, coords, routeId) {
    try {
        const response = await fetch('/api/advanced/stop-approach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                busId: busId,
                routeId: routeId,
                coords: coords
            })
        });

        const approachData = await response.json();

        if (approachData.isApproaching) {
            showStopApproachNotification(busId, approachData);
        }
    } catch (error) {
        console.error('Stop approach check error:', error);
    }
}

/**
 * Show stop approach notification with countdown
 */
function showStopApproachNotification(busId, approachData) {
    const notificationId = `approach-${busId}`;

    // Remove existing notification
    const existing = document.getElementById(notificationId);
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'stop-approach-notification';

    if (approachData.inGeofence && approachData.secondsToArrival) {
        // Show precise countdown
        notification.innerHTML = `
            <div class="approach-content">
                <div class="approach-icon">🚏</div>
                <div class="approach-details">
                    <strong>${busId.toUpperCase()} Approaching!</strong>
                    <div class="countdown-timer">${approachData.secondsToArrival}s</div>
                    <small>Next: ${approachData.stopName}</small>
                </div>
            </div>
        `;

        // Start countdown
        startCountdownTimer(notification, approachData.secondsToArrival);
    } else {
        notification.innerHTML = `
            <div class="approach-content">
                <div class="approach-icon">📍</div>
                <div class="approach-details">
                    <strong>${busId.toUpperCase()} Approaching</strong>
                    <div>${approachData.distanceMeters}m to ${approachData.stopName}</div>
                </div>
            </div>
        `;
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-remove after arrival
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, (approachData.secondsToArrival || 30) * 1000);
}

/**
 * Start countdown timer in notification
 */
function startCountdownTimer(element, seconds) {
    const timerElement = element.querySelector('.countdown-timer');
    if (!timerElement) return;

    let remaining = seconds;
    const interval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            timerElement.textContent = remaining + 's';
        } else {
            timerElement.textContent = 'Arriving!';
            clearInterval(interval);
        }
    }, 1000);
}

// ===== BUS CAPACITY CONFIDENCE SCORE =====

/**
 * Get and display bus capacity information
 */
async function getBusCapacity(busId, routeId, stopIndex = 0) {
    try {
        const response = await fetch(
            `/api/advanced/capacity/${busId}?routeId=${routeId}&stopIndex=${stopIndex}`
        );
        const capacityData = await response.json();

        displayCapacityInfo(busId, capacityData);
        return capacityData;
    } catch (error) {
        console.error('Capacity fetch error:', error);
        return null;
    }
}

/**
 * Display capacity info on bus card or map popup
 */
function displayCapacityInfo(busId, capacityData) {
    const busCard = document.querySelector(`[data-bus-id="${busId}"]`);
    if (busCard) {
        updateBusCardWithCapacity(busCard, capacityData);
    }

    // Update map marker popup if exists
    const marker = busMarkers[busId];
    if (marker) {
        updateMarkerWithCapacity(marker, busId, capacityData);
    }
}

/**
 * Update bus card with capacity badge
 */
function updateBusCardWithCapacity(busCard, capacityData) {
    // Remove existing capacity badge
    const existingBadge = busCard.querySelector('.capacity-badge');
    if (existingBadge) existingBadge.remove();

    const badge = document.createElement('div');
    badge.className = 'capacity-badge';
    badge.style.background = capacityData.color;
    badge.innerHTML = `
        <div class="capacity-icon">${capacityData.icon}</div>
        <div class="capacity-text">
            <strong>${capacityData.capacityPercentage}% Full</strong>
            <small>${capacityData.comfortLevel}</small>
        </div>
    `;

    busCard.appendChild(badge);

    // Add tooltip
    badge.title = capacityData.recommendation;
}

/**
 * Update marker popup with capacity info
 */
function updateMarkerWithCapacity(marker, busId, capacityData) {
    const originalContent = marker.getPopup().getContent();
    const capacityHTML = `
        <div class="capacity-info" style="margin-top: 10px; padding: 10px; background: ${capacityData.color}22; border-radius: 8px; border-left: 4px solid ${capacityData.color};">
            <strong style="color: ${capacityData.color};">${capacityData.icon} ${capacityData.capacityPercentage}% Capacity</strong><br>
            <small>${capacityData.comfortLevel}</small><br>
            <small style="color: #718096;">${capacityData.recommendation}</small>
        </div>
    `;

    marker.setPopupContent(originalContent + capacityHTML);
}

/**
 * Start periodic capacity updates for all buses
 */
function startCapacityUpdates() {
    if (capacityUpdateInterval) {
        clearInterval(capacityUpdateInterval);
    }

    // Update every 2 minutes
    capacityUpdateInterval = setInterval(() => {
        document.querySelectorAll('.bus-card').forEach(card => {
            const busId = card.getAttribute('data-bus-id');
            const routeId = card.getAttribute('data-route-id');
            if (busId && routeId) {
                getBusCapacity(busId, routeId);
            }
        });
    }, 120000);
}

// ===== LOST & FOUND SYSTEM =====

/**
 * Show lost & found reporting dialog
 */
function showLostItemDialog(busId, routeId) {
    const dialog = document.createElement('div');
    dialog.id = 'lost-item-dialog';
    dialog.className = 'feature-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h2>🔍 Report Lost Item</h2>
                <button class="close-dialog" onclick="closeLostItemDialog()">✕</button>
            </div>
            <form id="lost-item-form">
                <div class="form-group">
                    <label>Item Description</label>
                    <input type="text" id="lost-item-desc" placeholder="e.g., Blue backpack" required>
                </div>
                <div class="form-group">
                    <label>Where did you exit?</label>
                    <select id="lost-item-stop" required>
                        <option value="">Select stop...</option>
                        <!-- Stops will be populated dynamically -->
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">
                    📢 Report & Notify Other Passengers
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(dialog);

    // Populate stops
    populateLostItemStops(busId, routeId);

    // Setup form handler
    document.getElementById('lost-item-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitLostItemReport(busId, routeId);
    });

    setTimeout(() => dialog.classList.add('show'), 100);
}

/**
 * Submit lost item report
 */
async function submitLostItemReport(busId, routeId) {
    const description = document.getElementById('lost-item-desc').value;
    const exitStop = document.getElementById('lost-item-stop').value;
    const userId = sessionStorage.getItem('userId') || 'user_' + Date.now();

    try {
        const response = await fetch('/api/advanced/lost-found/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                busId: busId,
                routeId: routeId,
                description: description,
                exitStop: exitStop
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showNotification(`✅ ${result.message}`);
            closeLostItemDialog();

            // Broadcast to other users on this bus
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'lost-item-alert',
                    data: {
                        busId: busId,
                        description: description,
                        reportId: result.reportId
                    }
                }));
            }
        }
    } catch (error) {
        console.error('Lost item report error:', error);
        showNotification('❌ Failed to report item');
    }
}

function closeLostItemDialog() {
    const dialog = document.getElementById('lost-item-dialog');
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 300);
    }
}

/**
 * Check for lost items on a bus
 */
async function checkLostItems(busId) {
    try {
        const response = await fetch(`/api/advanced/lost-found/bus/${busId}`);
        const items = await response.json();

        if (items.length > 0) {
            showLostItemsNotification(busId, items);
        }
    } catch (error) {
        console.error('Lost items check error:', error);
    }
}

/**
 * Show lost items notification
 */
function showLostItemsNotification(busId, items) {
    const notification = document.createElement('div');
    notification.className = 'lost-items-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <strong>🔍 Lost Items on ${busId.toUpperCase()}</strong>
            <button onclick="this.parentElement.parentElement.remove()">✕</button>
        </div>
        <div class="lost-items-list">
            ${items.map(item => `
                <div class="lost-item">
                    <div>${item.description}</div>
                    <small>Exit: ${item.exitStop} • ${item.timeAgo}</small>
                    <button class="found-btn" onclick="markItemFound('${item.reportId}')">
                        Found It!
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
}

async function markItemFound(reportId) {
    const userId = sessionStorage.getItem('userId') || 'user_' + Date.now();

    try {
        const response = await fetch('/api/advanced/lost-found/found', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportId,
                foundByUserId: userId
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showNotification('✅ Great! Item marked as found.');
            // Refresh lost items
            setTimeout(() => location.reload(), 2000);
        }
    } catch (error) {
        console.error('Mark found error:', error);
    }
}

// ===== BUS CONDITION REPORTING =====

/**
 * Show bus condition rating dialog
 */
function showBusConditionDialog(busId, vehicleId) {
    const dialog = document.createElement('div');
    dialog.id = 'condition-dialog';
    dialog.className = 'feature-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h2>⭐ Rate This Bus</h2>
                <button class="close-dialog" onclick="closeConditionDialog()">✕</button>
            </div>
            <form id="condition-form">
                <div class="rating-category">
                    <label>Cleanliness</label>
                    <div class="star-rating" data-category="cleanliness">
                        ${createStarRating()}
                    </div>
                </div>
                <div class="rating-category">
                    <label>Temperature (AC/Heat)</label>
                    <div class="star-rating" data-category="temperature">
                        ${createStarRating()}
                    </div>
                </div>
                <div class="rating-category">
                    <label>Seat Condition</label>
                    <div class="star-rating" data-category="seats">
                        ${createStarRating()}
                    </div>
                </div>
                <div class="rating-category">
                    <label>Overall Experience</label>
                    <div class="star-rating" data-category="overall">
                        ${createStarRating()}
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">
                    ✅ Submit Rating
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(dialog);
    setupStarRatings();

    document.getElementById('condition-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitBusCondition(busId, vehicleId);
    });

    setTimeout(() => dialog.classList.add('show'), 100);
}

function createStarRating() {
    return '★★★★★'.split('').map((star, i) =>
        `<span class="star" data-rating="${i + 1}">★</span>`
    ).join('');
}

function setupStarRatings() {
    const ratings = {};

    document.querySelectorAll('.star-rating').forEach(ratingDiv => {
        const category = ratingDiv.dataset.category;
        ratings[category] = 0;

        ratingDiv.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                ratings[category] = rating;

                // Update visual
                ratingDiv.querySelectorAll('.star').forEach((s, i) => {
                    s.classList.toggle('selected', i < rating);
                });
            });
        });
    });

    // Store ratings globally
    window.currentRatings = ratings;
}

async function submitBusCondition(busId, vehicleId) {
    const userId = sessionStorage.getItem('userId') || 'user_' + Date.now();
    const ratings = window.currentRatings;

    if (Object.keys(ratings).length === 0) {
        showNotification('⚠️ Please rate at least one category');
        return;
    }

    try {
        const response = await fetch('/api/advanced/condition/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                busId: busId,
                vehicleId: vehicleId || busId,
                ratings: ratings
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showNotification('✅ Thank you for your feedback!');
            closeConditionDialog();
        }
    } catch (error) {
        console.error('Condition report error:', error);
        showNotification('❌ Failed to submit rating');
    }
}

function closeConditionDialog() {
    const dialog = document.getElementById('condition-dialog');
    if (dialog) {
        dialog.classList.remove('show');
        setTimeout(() => dialog.remove(), 300);
    }
}

// ===== SYSTEM ISSUE REPORTING =====

/**
 * Quick report system issue
 */
async function reportSystemIssue(busId, issueType, description) {
    const userId = sessionStorage.getItem('userId') || 'user_' + Date.now();

    try {
        const response = await fetch('/api/advanced/issue/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                busId: busId,
                issueType: issueType,
                description: description || ''
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showNotification(`⚠️ ${result.message}`);

            // Broadcast to other users
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'system-issue-alert',
                    data: {
                        busId: busId,
                        issueType: issueType,
                        severity: result.severity
                    }
                }));
            }
        }
    } catch (error) {
        console.error('Issue report error:', error);
    }
}

/**
 * Check for active system issues
 */
async function checkSystemIssues(busId) {
    try {
        const response = await fetch(`/api/advanced/issue/bus/${busId}`);
        const issues = await response.json();

        if (issues.length > 0) {
            displaySystemIssues(busId, issues);
        }
    } catch (error) {
        console.error('System issues check error:', error);
    }
}

/**
 * Display system issues as warnings
 */
function displaySystemIssues(busId, issues) {
    const highPriorityIssues = issues.filter(i => i.severity === 'HIGH');

    if (highPriorityIssues.length > 0) {
        const warning = document.createElement('div');
        warning.className = 'system-issue-warning';
        warning.innerHTML = `
            <div class="warning-header">
                <strong>⚠️ ${busId.toUpperCase()} - Important Notice</strong>
            </div>
            ${highPriorityIssues.map(issue => `
                <div class="issue-item">
                    <strong>${issue.issueType.replace('_', ' ')}</strong>
                    <small>${issue.description || ''}</small>
                    <small class="issue-time">${issue.timeAgo}</small>
                </div>
            `).join('')}
        `;

        document.body.appendChild(warning);
        setTimeout(() => warning.classList.add('show'), 100);
    }
}

// ===== INITIALIZATION =====

// Initialize all advanced features when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize weather tracking
    initializeWeatherTracking();

    // Start capacity updates
    setTimeout(() => startCapacityUpdates(), 3000);

    // Setup event listeners for new features
    setupAdvancedFeatureListeners();
});

function setupAdvancedFeatureListeners() {
    // Add buttons to bus cards for new features
    document.querySelectorAll('.bus-card').forEach(card => {
        const busId = card.getAttribute('data-bus-id');
        const routeId = card.getAttribute('data-route-id');

        // Add capacity check on card click
        card.addEventListener('click', () => {
            getBusCapacity(busId, routeId);
            checkLostItems(busId);
            checkSystemIssues(busId);
        });
    });
}

// Export functions for global use
window.advancedFeatures = {
    getWeatherAdjustedETA,
    getBusCapacity,
    showLostItemDialog,
    showBusConditionDialog,
    reportSystemIssue,
    checkSystemIssues,
    startStopApproachMonitoring
};

console.log('✨ Advanced features initialized!');