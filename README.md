# 🚌 CityBus Tracker

**A Real-time Bus Tracking System for Aurangabad City**

CityBus Tracker is a comprehensive solution that bridges the gap between public transportation and modern technology. Built with Spring Boot and WebSocket technology, it provides live tracking, route planning, and intelligent ETA predictions for city buses.

---

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Public transportation in cities faces several challenges:
- Passengers have no visibility into bus locations and arrival times
- Long waiting times due to unpredictable schedules
- Lack of real-time communication between drivers and passengers
- Difficulty in planning journeys efficiently

## Solution

CityBus Tracker addresses these challenges by providing a comprehensive real-time tracking system that connects drivers, passengers, and city transportation management through modern web technology.

### What Makes It Different?

**Real-time Communication**: Using WebSocket technology, location updates are transmitted instantly without the need for constant page refreshes.

**Intelligent Routing**: Integration with OSRM (Open Source Routing Machine) provides realistic walking routes to nearest bus stops, considering actual road networks.

**User-Centric Design**: Separate interfaces for passengers and drivers ensure each user type gets exactly what they need without unnecessary complexity.

**Privacy First**: Drivers can control their visibility, and no personal data is stored beyond the active session.

---

## Key Features

### For Passengers

**Live Bus Tracking**
See all active buses moving on the map in real-time. Each bus marker updates its position automatically as drivers move through their routes.

**Smart ETA Calculations**
Get accurate arrival time predictions based on current bus location, distance, and average city traffic patterns. ETAs update automatically every 15 seconds.

**Route Planning**
View complete route information including all stops, schedules, and frequency. Find the nearest stop to your location with walking directions.

**AI Assistant**
An intelligent chatbot helps you find bus information, track specific buses, and answer questions about routes and schedules using natural language.

**Multi-route Support**
Currently supports 5 major routes across Aurangabad:
- Route 1: Harsul T-Point to CSMSS College
- Route 2: Fame Tapadia Signal
- Route 3: Chikalthana
- Route 4: Mahalaxmi Chowk
- Route 5: Baliram Patil High School

### For Drivers

**Automatic Location Sharing**
Once logged in, your GPS location is automatically shared with passengers at 30-second intervals. No manual updates required.

**Driver Dashboard**
Monitor your connection status, see how many location updates you've sent, and control your visibility to passengers.

**Peer Visibility**
Optionally view locations of other active drivers on the network to coordinate better and avoid route conflicts.

**Secure Authentication**
JWT-based login ensures only authorized drivers can access the dashboard and share location data.

---

## Technology Stack

### Backend Technologies

**Spring Boot 2.7.14** - Provides the foundation for the application with dependency injection, auto-configuration, and embedded server capabilities.

**Java 11** - Core programming language offering stability, performance, and modern language features.

**WebSocket Protocol** - Enables bidirectional, real-time communication between servers and clients without the overhead of HTTP polling.

**JWT (JSON Web Tokens)** - Implements secure, stateless authentication for driver login sessions.

**Maven** - Manages project dependencies and builds.

### Frontend Technologies

**Vanilla JavaScript (ES6+)** - Pure JavaScript without frameworks, ensuring fast load times and minimal dependencies.

**Leaflet.js 1.9.4** - Open-source mapping library providing interactive maps with custom markers and overlays.

**HTML5 & CSS3** - Modern web standards with features like Geolocation API and custom properties for theming.

**WebSocket Client API** - Browser-native WebSocket support for real-time data streaming.

### External Integrations

**OpenStreetMap** - Provides free, community-driven map data and tiles.

**OSRM (Open Source Routing Machine)** - Calculates realistic walking routes between user location and bus stops.

---

## Architecture Overview

### System Design

The application follows a three-tier architecture:

**Presentation Layer**
- User Interface (HTML/CSS/JS) for passengers
- Driver Dashboard for bus operators
- Responsive design adapting to all screen sizes

**Application Layer**
- Spring Boot REST Controllers handling HTTP requests
- WebSocket Handler managing real-time connections
- Service layer implementing business logic
- JWT-based authentication and authorization

**Data Layer**
- In-memory storage for active sessions
- Concurrent data structures for thread-safe operations
- Route and stop information in memory

### Communication Flow

**User Connection Flow:**
1. User opens the web application
2. WebSocket connection established automatically
3. User registers with session ID
4. Receives list of active buses
5. Can request ETA calculations or track specific buses

**Driver Connection Flow:**
1. Driver logs in with credentials
2. JWT token generated and stored
3. WebSocket connection with authenticated session
4. GPS location captured automatically
5. Location broadcast to all connected users
6. Driver can control visibility and view other drivers

**Real-time Update Mechanism:**
- Drivers send GPS coordinates every 30 seconds
- Server validates and broadcasts to all users
- Users receive updates with ETA calculations
- Automatic cleanup of inactive sessions after 2 minutes

### Security Architecture

**Authentication:** Drivers must provide valid credentials which are verified against BCrypt-hashed passwords. Successful authentication returns a JWT token valid for 24 hours.

**Session Management:** Each WebSocket connection is tracked with unique session IDs. Sessions are automatically cleaned up on disconnection or timeout.

**Data Privacy:** User locations are never persisted to disk. All GPS data is kept in memory only during active sessions.

**CORS Configuration:** Configured to allow controlled cross-origin requests while maintaining security.

---

## Getting Started

### Prerequisites

You'll need the following installed on your system:

- Java Development Kit (JDK) 11 or higher
- Maven 3.6 or higher
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git for cloning the repository

### Installation Steps

**1. Clone the Repository**
```bash
git clone https://github.com/yourusername/citybus-tracker.git
cd citybus-tracker
```

**2. Build the Project**
```bash
mvn clean install
```

**3. Run the Application**
```bash
mvn spring-boot:run
```

The server will start on port 8087 by default.

**4. Access the Application**
- User Interface: `http://localhost:8087`
- Driver Dashboard: `http://localhost:8087/driver`

### Configuration

The application can be configured through `application.yml`:

**Port Configuration**
Change the server port if needed (default is 8087).

**JWT Secret**
For production, set a strong JWT secret key as an environment variable:
```bash
export JWT_SECRET="your-secure-256-bit-secret-key"
```

**Logging Levels**
Adjust logging levels for debugging or production use.

### Default Driver Credentials

Five driver accounts are pre-configured for testing:
- Username: `driver1` to `driver5`
- Password: `password123` (for all)
- Assigned buses: `bus-1` to `bus-5`

**Important:** Change these credentials before deploying to production!

---

## Usage Guide

### For Passengers

**Tracking a Bus:**
1. Open the application in your browser
2. Navigate to the "Track Bus" section
3. Allow location access when prompted
4. Select a bus from the available list
5. View real-time location and ETA on the map

**Finding Nearest Stop:**
1. Ensure location services are enabled
2. Select a route or bus
3. The system automatically highlights the nearest stop
4. View walking directions with estimated time

**Using the Chatbot:**
1. Click the floating chatbot icon in the bottom-right
2. Ask questions like:
    - "Where is bus 1?"
    - "What's the schedule for route 2?"
    - "Show me the nearest stop"
3. Receive instant, intelligent responses

### For Drivers

**Logging In:**
1. Navigate to `/driver`
2. Enter your driver credentials
3. Your assigned bus will be displayed automatically

**Sharing Location:**
Once logged in, your GPS location is automatically captured and shared every 30 seconds. No manual action required.

**Controlling Visibility:**
Use the visibility toggle in your dashboard to control whether passengers can see your location.

**Viewing Other Drivers:**
Click "Show Other Drivers" to see locations of other active buses on your map.

---

## API Reference

### Authentication Endpoints

**POST** `/api/auth/login`
Authenticate a driver and receive a JWT token.

Request body:
```json
{
  "username": "driver1",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "role": "driver",
  "busId": "bus-1",
  "username": "driver1",
  "success": true
}
```

**POST** `/api/auth/logout`
Invalidate current session (requires Bearer token in header).

**GET** `/api/auth/validate`
Validate a JWT token and retrieve user information.

### Route Endpoints

**POST** `/api/route-path/nearest-stop`
Find the nearest bus stop on a route.

Request:
```json
{
  "routeId": "1",
  "userLat": 19.8762,
  "userLng": 75.3433
}
```

**POST** `/api/route-path/all-stops`
Get all stops on a route with distances from user location.

### WebSocket Events

**Connection:** `ws://localhost:8087/websocket`

**Client to Server Events:**

`driver-register` - Register as a driver
```json
{
  "type": "driver-register",
  "data": {
    "driverId": "driver1",
    "busId": "bus-1"
  }
}
```

`driver-location` - Update driver GPS location
```json
{
  "type": "driver-location",
  "data": {
    "driverId": "driver1",
    "busId": "bus-1",
    "coords": [19.8762, 75.3433],
    "accuracy": 10
  }
}
```

`user-register` - Register as a passenger

`request-eta` - Request ETA calculation

`track-bus` - Start tracking a specific bus

**Server to Client Events:**

`connection-established` - Confirms connection

`active-buses` - List of all active buses

`bus-location-update-with-eta` - Real-time location update with ETA

`eta-response` - ETA calculation result

`driver-registered` - Driver registration confirmation

---

## Project Structure

```
citybus-tracker/
├── src/
│   ├── main/
│   │   ├── java/com/citybus/
│   │   │   ├── CityBusTrackerApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── WebSocketConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── RouteController.java
│   │   │   │   ├── RoutePathController.java
│   │   │   │   └── WebController.java
│   │   │   ├── model/
│   │   │   │   ├── BusLocation.java
│   │   │   │   ├── Route.java
│   │   │   │   ├── Stop.java
│   │   │   │   └── User.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── BusTrackingService.java
│   │   │   │   ├── RoutePathService.java
│   │   │   │   └── UserService.java
│   │   │   ├── util/
│   │   │   │   └── DistanceCalculator.java
│   │   │   └── websocket/
│   │   │       └── BusTrackingWebSocketHandler.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── index.html
│   │       │   ├── driver.html
│   │       │   ├── styles.css
│   │       │   ├── script.js
│   │       │   ├── driver_script.js
│   │       │   ├── chatbot.js
│   │       │   ├── animations.js
│   │       │   └── sw.js
│   │       └── application.yml
│   └── test/
├── pom.xml
└── README.md
```

### Key Components

**Controllers:** Handle HTTP requests and route them to appropriate services.

**Services:** Contain business logic for tracking, routing, and authentication.

**WebSocket Handler:** Manages all WebSocket connections and real-time messaging.

**Models:** Define data structures for users, routes, stops, and locations.

**Utilities:** Helper classes for distance calculations and ETA predictions.

---

## Future Enhancements

### Short-term Goals

**Database Integration**
Move from in-memory storage to PostgreSQL for persistent data storage. This will enable:
- Historical location data for analytics
- Route optimization based on traffic patterns
- User preferences and favorites

**Push Notifications**
Implement browser push notifications to alert users when their tracked bus is approaching, even when the app is in the background.

**Mobile Applications**
Develop native iOS and Android apps for better performance and offline capabilities.

### Long-term Vision

**Predictive Analytics**
Use machine learning to predict bus delays based on historical data, weather conditions, and traffic patterns.

**Passenger Count Sensors**
Integrate with IoT sensors on buses to show real-time passenger occupancy, helping users avoid crowded buses.

**Multi-city Support**
Expand the system to support multiple cities with different routes and bus networks.

**Admin Dashboard**
Create a comprehensive dashboard for transportation authorities to monitor fleet, generate reports, and manage routes.

**Integration with Payment Systems**
Allow users to purchase tickets directly through the app using digital wallets or cards.

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, etc.)

### Suggesting Features

We love new ideas! Create an issue labeled "enhancement" with:
- Detailed description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

**Technologies:**
- Spring Boot team for the excellent framework
- Leaflet.js community for the mapping library
- OpenStreetMap contributors for map data
- OSRM project for routing capabilities

**Inspiration:**
This project was built to solve real transportation challenges in Aurangabad and can be adapted for any city's public bus system.

---

## Contact & Support

**Developer:** Your Name  
**Email:** your.email@example.com  
**GitHub:** github.com/yourusername  
**Project Link:** github.com/yourusername/citybus-tracker

For questions, suggestions, or collaboration opportunities, feel free to reach out!

---

**Built with ❤️ for smarter cities and better public transportation**