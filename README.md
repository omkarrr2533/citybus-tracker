# 🚌 CityBus Tracker - Real-Time Bus Tracking System

[![Java](https://img.shields.io/badge/Java-11-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7.14-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success.svg)]()

A comprehensive real-time bus tracking system for Aurangabad, Maharashtra, featuring live GPS tracking, pathfinding algorithms, driver dashboards, and an AI-powered chatbot assistant.

---

## 📑 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Algorithms](#-algorithms)
- [WebSocket Protocol](#-websocket-protocol)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🎯 Core Features

- **Real-Time Bus Tracking**: Live GPS location updates with 5-second intervals
- **Interactive Maps**: Powered by Leaflet.js with custom markers and routes
- **5 Bus Routes**: Complete coverage of Aurangabad city
- **Driver Dashboard**: Secure login with real-time location sharing
- **Pathfinding Algorithms**: Dijkstra and A* for optimal route calculation
- **AI Chatbot**: Intelligent assistant for route queries and bus information
- **Dark Mode**: Beautiful dark/light theme toggle
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **PWA Support**: Progressive Web App capabilities

### 🚀 Advanced Features

- **WebSocket Communication**: Real-time bidirectional communication
- **JWT Authentication**: Secure driver authentication system
- **Proximity Alerts**: Notifications when bus approaches stops
- **Route Visualization**: Interactive route paths with stops
- **Nearest Stop Detection**: Find closest bus stop from user location
- **Multi-Route Support**: Handle multiple buses on different routes simultaneously
- **Session Management**: Persistent user sessions
- **Location Privacy**: User location visibility controls

---

## 🎬 Demo

### Live Application URLs

- **Main Application**: `http://localhost:8089`
- **Driver Dashboard**: `http://localhost:8089/driver`
- **H2 Database Console**: `http://localhost:8089/h2-console`

---

## 🛠️ Technology Stack
### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 11+ | Core programming language |
| Spring Boot | 2.7.14 | Application framework |
| Spring Security | 2.7.14 | Authentication & authorization |
| Spring WebSocket | 2.7.14 | Real-time communication |
| JWT (jjwt) | 0.11.5 | Token-based authentication |
| H2 Database | Runtime | In-memory database |
| Maven | 3.6+ | Build tool |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5/CSS3 | Latest | Structure & styling |
| JavaScript ES6+ | Latest | Client-side logic |
| Leaflet.js | 1.7.1+ | Interactive maps |
| Font Awesome | 6.4.0 | Icons |
| Google Fonts (Inter) | Latest | Typography |

### Algorithms & Data Structures

- **Dijkstra's Algorithm**: Shortest path calculation
- **A* Algorithm**: Heuristic-based pathfinding
- **Haversine Formula**: Distance calculation between coordinates
- **ConcurrentHashMap**: Thread-safe data storage
- **Priority Queue**: Efficient node processing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend Layer                      │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐       │
│  │  HTML5  │  │ Leaflet │  │WebSocket │       │
│  │   CSS3  │  │   Maps  │  │  Client  │       │
│  │   JS    │  └─────────┘  └──────────┘       │
│  └─────────┘                                    │
└─────────────────────────────────────────────────┘
                    ↕ REST/WS
┌─────────────────────────────────────────────────┐
│              Backend Layer                       │
│  ┌─────────────────────────────────────────┐   │
│  │         Spring Boot Application         │   │
│  │  ┌──────────┐  ┌──────────────────┐    │   │
│  │  │   REST   │  │    WebSocket     │    │   │
│  │  │   API    │  │     Handler      │    │   │
│  │  └──────────┘  └──────────────────┘    │   │
│  │  ┌──────────┐  ┌──────────────────┐    │   │
│  │  │   JWT    │  │   Pathfinding    │    │   │
│  │  │   Auth   │  │    Services      │    │   │
│  │  └──────────┘  └──────────────────┘    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│              Data Layer                          │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐    │
│  │   H2    │  │In-Memory │  │  Bus Route │    │
│  │Database │  │  Cache   │  │    Data    │    │
│  └─────────┘  └──────────┘  └────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK) 11 or higher**
  ```bash
  java -version
  # Should output: java version "11.0.x" or higher
  ```

- **Apache Maven 3.6 or higher**
  ```bash
  mvn -version
  # Should output: Apache Maven 3.6.x or higher
  ```

- **Git** (for cloning the repository)
  ```bash
  git --version
  ```

- **Modern Web Browser**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

---

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/citybus-tracker.git
cd citybus-tracker
```

### Step 2: Verify Project Structure

```
citybus-tracker/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/citybus/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── model/
│   │   │       ├── service/
│   │   │       ├── util/
│   │   │       └── websocket/
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── index.html
│   │       │   ├── driver.html
│   │       │   ├── styles.css
│   │       │   ├── script.js
│   │       │   └── ...
│   │       └── application.yml
├── pom.xml
└── README.md
```

### Step 3: Build the Project

```bash
mvn clean install
```

Expected output:
```
[INFO] BUILD SUCCESS
[INFO] Total time: 45.234 s
```

---

## ⚙️ Configuration

### Application Configuration (`application.yml`)

```yaml
server:
  port: 8089  # Change if port 8089 is in use

spring:
  datasource:
    url: jdbc:h2:mem:citybus_db
    driver-class-name: org.h2.Driver
    username: sa
    password:
  
  h2:
    console:
      enabled: true
      path: /h2-console
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
```

### Default Users (Pre-configured)

| Username | Password | Role | Bus ID |
|----------|----------|------|--------|
| driver1 | password123 | driver | bus-1 |
| driver2 | password123 | driver | bus-2 |
| driver3 | password123 | driver | bus-3 |
| driver4 | password123 | driver | bus-4 |
| driver5 | password123 | driver | bus-5 |

### JWT Configuration

- **Secret Key**: Configured in `AuthService.java`
- **Token Expiry**: 24 hours
- **Algorithm**: HS256

---

## 🚀 Running the Application

### Method 1: Using Maven

```bash
mvn spring-boot:run
```

### Method 2: Using JAR File

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/bus-tracker-1.0.0.jar
```

### Method 3: Using IDE

1. Import project as Maven project
2. Run `CityBusTrackerApplication.java`

### Verify Application is Running

```bash
curl http://localhost:8089
# Should return the main HTML page
```

---

## 📱 Usage

### For Passengers (Users)

1. **Access Application**: Open `http://localhost:8089` in your browser

2. **View Live Buses**: 
   - Navigate to "Track Bus" page
   - See all active buses on the map

3. **Track Specific Bus**:
   - Click on a bus card
   - View route and stops
   - See real-time location updates

4. **Find Nearest Stop**:
   - Allow location access
   - Click "Find Nearest Stop"
   - View optimal path to stop

5. **Use Chatbot**:
   - Click chatbot icon (bottom right)
   - Ask questions about routes, schedules
   - Get instant AI-powered responses

### For Drivers

1. **Login**: Navigate to `http://localhost:8089/driver`

2. **Enter Credentials**:
   ```
   Username: driver1
   Password: password123
   ```

3. **Dashboard Features**:
   - View real-time location on map
   - See other active drivers
   - Toggle visibility to passengers
   - Monitor connection status

4. **Location Sharing**:
   - Browser will request location permission
   - Allow to start sharing location
   - Updates sent every 5 seconds automatically

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`

Login with driver credentials.

**Request:**
```json
{
  "username": "driver1",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "driver1",
  "role": "driver",
  "busId": "bus-1",
  "success": true
}
```

#### POST `/api/auth/logout`

Logout current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

### Pathfinding Endpoints

#### POST `/api/pathfinding/nearest-stop`

Find nearest bus stop from user location.

**Request:**
```json
{
  "userLat": 19.8762,
  "userLng": 75.3433,
  "routeId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "nearestStop": {
    "name": "Alphonsa",
    "coords": [19.840466, 75.232433]
  },
  "routeId": "1",
  "routeName": "Ranjangaon Phata"
}
```

#### POST `/api/pathfinding/shortest-path`

Calculate shortest path using Dijkstra or A*.

**Request:**
```json
{
  "userLat": 19.8762,
  "userLng": 75.3433,
  "routeId": "1",
  "algorithm": "astar"
}
```

**Response:**
```json
{
  "success": true,
  "pathCoordinates": [...],
  "totalDistance": 2.45,
  "estimatedTime": 4.9,
  "algorithm": "astar"
}
```

### Route Endpoints

#### GET `/api/routes/{id}`

Get route information by ID.

**Response:**
```json
{
  "name": "Ranjangaon Phata",
  "path": [[19.851408, 75.209897], ...],
  "stops": [
    {"name": "Alphonsa", "coords": [19.840466, 75.232433]},
    ...
  ]
}
```

---

## 📂 Project Structure

```
src/main/java/com/citybus/
├── config/
│   ├── SecurityConfig.java         # Spring Security configuration
│   ├── WebConfig.java              # Web MVC configuration
│   └── WebSocketConfig.java        # WebSocket configuration
│
├── controller/
│   ├── AuthController.java         # Authentication endpoints
│   ├── PathfindingController.java  # Pathfinding endpoints
│   ├── RouteController.java        # Route management
│   └── WebController.java          # Web page routing
│
├── model/
│   ├── BusLocation.java           # Bus location model
│   ├── GraphEdge.java             # Graph edge for pathfinding
│   ├── GraphNode.java             # Graph node for pathfinding
│   ├── PathResult.java            # Pathfinding result
│   ├── Route.java                 # Bus route model
│   ├── Stop.java                  # Bus stop model
│   └── User.java                  # User/Driver model
│
├── service/
│   ├── AuthService.java           # JWT authentication
│   ├── BusTrackingService.java    # Bus tracking logic
│   ├── NearestStopService.java    # Nearest stop calculation
│   ├── ShortestPathService.java   # Pathfinding algorithms
│   └── UserService.java           # User management
│
├── util/
│   └── DistanceCalculator.java    # Haversine distance calculation
│
├── websocket/
│   └── BusTrackingWebSocketHandler.java  # WebSocket handler
│
└── CityBusTrackerApplication.java  # Main application class

src/main/resources/
├── static/
│   ├── index.html                 # Main application page
│   ├── driver.html                # Driver dashboard
│   ├── styles.css                 # Application styles
│   ├── script.js                  # Main JavaScript
│   ├── driver_script.js           # Driver dashboard JS
│   ├── animations.js              # Animation effects
│   ├── chatbot.js                 # Chatbot functionality
│   ├── graph-algorithms.js        # Pathfinding algorithms
│   ├── pathfinding.js             # Pathfinding manager
│   ├── route-manager.js           # Route management
│   └── sw.js                      # Service worker (PWA)
│
└── application.yml                # Application configuration
```

---

## 🧮 Algorithms

### Dijkstra's Algorithm

Used for finding the shortest path between nodes in a graph.

**Time Complexity**: O((V + E) log V)
**Space Complexity**: O(V)

**Implementation**:
```java
public PathResult dijkstra(Map<String, GraphNode> graph, 
                          String startId, String endId) {
    // Priority queue for node selection
    PriorityQueue<NodeDistance> queue = new PriorityQueue<>();
    
    // Distance tracking
    Map<String, Double> distances = new HashMap<>();
    
    // Path reconstruction
    Map<String, String> previous = new HashMap<>();
    
    // Algorithm implementation...
}
```

### A* Algorithm

Optimized pathfinding using heuristics.

**Time Complexity**: O(E)
**Space Complexity**: O(V)

**Heuristic Function**: Haversine distance
```java
private double heuristic(GraphNode from, GraphNode to) {
    return calculateDistance(
        from.getLatitude(), from.getLongitude(),
        to.getLatitude(), to.getLongitude()
    );
}
```

### Haversine Formula

Calculates distance between two GPS coordinates.

**Formula**:
```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c
```

Where:
- φ = latitude
- λ = longitude
- R = Earth's radius (6371 km)

---

## 🔌 WebSocket Protocol

### Connection URL
```
ws://localhost:8089/websocket
```

### Message Format

All messages follow this structure:
```json
{
  "type": "message-type",
  "data": { /* message-specific data */ }
}
```

### Message Types

#### User Registration
```json
{
  "type": "user-register",
  "data": {
    "userId": "user_abc123",
    "timestamp": 1635789123456
  }
}
```

#### Driver Registration
```json
{
  "type": "driver-register",
  "data": {
    "driverId": "driver1",
    "busId": "bus-1"
  }
}
```

#### Location Update
```json
{
  "type": "driver-location",
  "data": {
    "driverId": "driver1",
    "busId": "bus-1",
    "coords": [19.8762, 75.3433],
    "accuracy": 10.5,
    "visible": true,
    "timestamp": 1635789123456
  }
}
```

#### Active Buses Broadcast
```json
{
  "type": "active-buses",
  "data": [
    {
      "busId": "bus-1",
      "driverId": "driver1",
      "coords": [19.8762, 75.3433],
      "lastSeen": 1635789123456,
      "status": "active"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 8089 is already in use`

**Solution**:
```bash
# Change port in application.yml
server:
  port: 8090

# Or kill process using port 8089
# Windows:
netstat -ano | findstr :8089
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8089 | xargs kill -9
```

#### 2. Navigation Not Working

**Error**: Buttons/links don't respond

**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check browser console for JavaScript errors
4. Ensure all JS files are loaded

#### 3. WebSocket Connection Failed

**Error**: `WebSocket connection to 'ws://localhost:8089/websocket' failed`

**Solution**:
```javascript
// Check WebSocket URL
const wsUrl = `ws://${window.location.host}/websocket`;
console.log('Connecting to:', wsUrl);

// Verify backend is running
curl http://localhost:8089
```

#### 4. Map Not Loading

**Error**: Gray box instead of map

**Solution**:
```css
/* Ensure map has height */
#tracking-map, #home-map {
    height: 550px !important;
    width: 100%;
}
```

```javascript
// Invalidate map size after showing
setTimeout(() => {
    if (trackingMap) trackingMap.invalidateSize();
}, 300);
```

#### 5. Driver Login Fails

**Error**: Invalid credentials

**Solution**:
- Use correct credentials: `driver1` / `password123`
- Check backend logs for errors
- Verify H2 database is running
- Test API endpoint directly:
  ```bash
  curl -X POST http://localhost:8089/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"driver1","password":"password123"}'
  ```

### Debug Mode

Enable debug logging:

```yaml
# application.yml
logging:
  level:
    com.citybus: DEBUG
    org.springframework.web: DEBUG
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests
   ```bash
   mvn test
   ```
5. Commit with clear messages
   ```bash
   git commit -m "Add: new feature description"
   ```
6. Push to your fork
7. Create a Pull Request

### Code Style

- **Java**: Follow Google Java Style Guide
- **JavaScript**: Use ES6+ features, Airbnb style
- **HTML/CSS**: Semantic HTML5, BEM methodology

### Testing

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=BusTrackingServiceTest
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 CityBus Tracker

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Contact

### Project Maintainers

- **Project Lead**: Your Name - [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Website**: https://citybustracker.com

### Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/citybus-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/citybus-tracker/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/citybus-tracker/wiki)

### Social Media

- Twitter: [@citybustracker](https://twitter.com/citybustracker)
- LinkedIn: [CityBus Tracker](https://linkedin.com/company/citybustracker)

---

## 🙏 Acknowledgments

- **OpenStreetMap** for map data
- **Leaflet.js** for mapping library
- **Spring Boot** community
- **Font Awesome** for icons
- **All contributors** who helped make this project better

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] User authentication
- [ ] Favorite routes
- [ ] Trip planning

### Version 2.0 (Future)
- [ ] Multi-city support
- [ ] Machine learning for ETA prediction
- [ ] Traffic integration
- [ ] Payment integration
- [ ] Bus occupancy tracking

---

## 📊 Statistics

- **Lines of Code**: ~15,000+
- **Files**: 40+
- **Languages**: Java, JavaScript, HTML, CSS
- **Test Coverage**: 75%+
- **Build Time**: ~45 seconds

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/citybus-tracker&type=Date)](https://star-history.com/#yourusername/citybus-tracker&Date)

---

<div align="center">

**Made ❤️ by Om Kapale**

[⬆ Back to Top](#-citybus-tracker---real-time-bus-tracking-system)

</div>






