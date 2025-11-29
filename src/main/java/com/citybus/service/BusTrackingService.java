package com.citybus.service;

import com.citybus.model.BusLocation;
import com.citybus.model.Route;
import com.citybus.model.Stop;
import com.citybus.util.DistanceCalculator;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BusTrackingService {

    private Map<String, BusLocation> busLocations = new ConcurrentHashMap<>();
    private Map<String, Route> routes = new ConcurrentHashMap<>();
    private Map<String, Map<String, Object>> userConnections = new ConcurrentHashMap<>();
    private Map<String, Map<String, Object>> activeDrivers = new ConcurrentHashMap<>();

    private static final double PROXIMITY_THRESHOLD_KM = 0.5;

    @PostConstruct
    public void initRoutes() {
        // Initialize route data
        routes.put("1", new Route("Ranjangaon Phata",
                Arrays.asList(
                        new double[] { 19.851408, 75.209897 },
                        new double[] { 19.840466, 75.232433 },
                        new double[] { 19.845526, 75.240380 },
                        new double[] { 19.838546, 75.251527 },
                        new double[] { 19.837301, 75.253563 },
                        new double[] { 19.847091, 75.265890 },
                        new double[] { 19.832842, 75.270292 },
                        new double[] { 19.827377, 75.289950 },
                        new double[] { 19.832516, 75.290357 }),
                Arrays.asList(
                        new Stop("Ranjangaon Phata", new double[] { 19.875743, 75.334755 }),
                        new Stop("Alphonsa", new double[] { 19.840466, 75.232433 }),
                        new Stop("Pratap Chowk", new double[] { 19.839425, 75.241251 }),
                        new Stop("MIDC RD", new double[] { 19.838546, 75.251527 }),
                        new Stop("MIDC RD corner", new double[] { 19.837301, 75.253563 }),
                        new Stop("Gollwadi Chowk", new double[] { 19.847091, 75.265890 }),
                        new Stop("Near Waladgaon Rd", new double[] { 19.847091, 75.265890 }),
                        new Stop("Paithan RD", new double[] { 19.827377, 75.289950 }),
                        new Stop("csmss", new double[] { 19.832516, 75.290357 }))));

        routes.put("2", new Route("Fame Tapadia Signal",
                Arrays.asList(
                        new double[] { 19.883575, 75.365027 },
                        new double[] { 19.894559, 75.365062 },
                        new double[] { 19.895284, 75.364767 },
                        new double[] { 19.898180, 75.362212 },
                        new double[] { 19.904718, 75.357021 },
                        new double[] { 19.909854, 75.353163 },
                        new double[] { 19.914915, 75.352384 },
                        new double[] { 19.906784, 75.343839 },
                        new double[] { 19.904839, 75.342060 },
                        new double[] { 19.894397, 75.337078 },
                        new double[] { 19.892250, 75.327619 },
                        new double[] { 19.884206, 75.317144 },
                        new double[] { 19.873789, 75.315127 },
                        new double[] { 19.861054, 75.310145 },
                        new double[] { 19.861327, 75.307114 },
                        new double[] { 19.846803, 75.294608 },
                        new double[] { 19.832545, 75.290382 }),
                Arrays.asList(
                        new Stop("Fame Tapadia Signal", new double[] { 19.876796, 75.366045 }),
                        new Stop("N1 Ganpati", new double[] { 19.883883, 75.365047 }),
                        new Stop("Wokhardt", new double[] { 19.895284, 75.364767 }),
                        new Stop("Ambedkar Chowk", new double[] { 19.898180, 75.362212 }),
                        new Stop("Jaiswal Hall", new double[] { 19.904718, 75.357021 }),
                        new Stop("SBOA", new double[] { 19.909854, 75.353163 }),
                        new Stop("T. Point", new double[] { 19.914915, 75.352384 }),
                        new Stop("Power House", new double[] { 19.906784, 75.343839 }),
                        new Stop("Hudco Corner", new double[] { 19.904839, 75.342060 }),
                        new Stop("Collector Office", new double[] { 19.894397, 75.337078 }),
                        new Stop("Jubilee Park", new double[] { 19.892250, 75.327619 }),
                        new Stop("Mill Corner", new double[] { 19.884206, 75.317144 }),
                        new Stop("bharat petroleum", new double[] { 19.884206, 75.317144 }),
                        new Stop("Railway Station", new double[] { 19.861054, 75.310145 }),
                        new Stop("Paithan RD", new double[] { 19.861054, 75.310145 }),
                        new Stop("Csmss", new double[] { 19.832545, 75.290382 }))));
    }

    public Route getRoute(String routeId) {
        return routes.get(routeId);
    }

    public Map<String, BusLocation> getBusLocations() {
        return new HashMap<>(busLocations);
    }

    public void updateBusLocation(String busId, BusLocation location) {
        busLocations.put(busId, location);
    }

    public void addUserConnection(String sessionId, String userId, WebSocketSession session) {
        Map<String, Object> connection = new HashMap<>();
        connection.put("userId", userId);
        connection.put("session", session);
        connection.put("lat", null);
        connection.put("lng", null);
        connection.put("trackingBusId", null);
        userConnections.put(sessionId, connection);
    }

    public void removeUserConnection(String sessionId) {
        userConnections.remove(sessionId);
    }

    public void updateUserLocation(String sessionId, double lat, double lng) {
        Map<String, Object> connection = userConnections.get(sessionId);
        if (connection != null) {
            connection.put("lat", lat);
            connection.put("lng", lng);
        }
    }

    public void setUserTrackingBus(String sessionId, String busId) {
        Map<String, Object> connection = userConnections.get(sessionId);
        if (connection != null) {
            connection.put("trackingBusId", busId);
        }
    }

    public List<Map<String, Object>> checkProximityNotifications() {
        List<Map<String, Object>> notifications = new ArrayList<>();

        for (Map.Entry<String, Map<String, Object>> entry : userConnections.entrySet()) {
            Map<String, Object> user = entry.getValue();
            Double lat = (Double) user.get("lat");
            Double lng = (Double) user.get("lng");
            String trackingBusId = (String) user.get("trackingBusId");

            if (lat != null && lng != null && trackingBusId != null) {
                BusLocation trackedBus = busLocations.get(trackingBusId);
                if (trackedBus != null && trackedBus.getCoords() != null) {
                    double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                            lat, lng,
                            trackedBus.getCoords()[0],
                            trackedBus.getCoords()[1]);

                    if (distance <= PROXIMITY_THRESHOLD_KM) {
                        Map<String, Object> notification = new HashMap<>();
                        notification.put("sessionId", entry.getKey());
                        notification.put("session", user.get("session"));
                        notification.put("busId", trackingBusId);
                        notification.put("distance", String.format("%.2f", distance));
                        notification.put("message",
                                String.format("Your tracking bus %s is %.2f km away!", trackingBusId, distance));
                        notifications.add(notification);
                    }
                }
            }
        }

        return notifications;
    }

    /**
     * Calculate ETA for a specific bus to reach a user location
     */
    public Map<String, Object> calculateBusETA(String busId, double userLat, double userLng) {
        Map<String, Object> etaInfo = new HashMap<>();

        BusLocation busLocation = busLocations.get(busId);
        if (busLocation == null || busLocation.getCoords() == null) {
            etaInfo.put("available", false);
            etaInfo.put("message", "Bus location not available");
            return etaInfo;
        }

        double[] busCoords = busLocation.getCoords();
        double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                userLat, userLng,
                busCoords[0], busCoords[1]
        );

        int etaMinutes = DistanceCalculator.calculateETAMinutes(distance);
        String formattedETA = DistanceCalculator.getFormattedETA(distance);

        etaInfo.put("available", true);
        etaInfo.put("busId", busId);
        etaInfo.put("distanceKm", Math.round(distance * 100.0) / 100.0);
        etaInfo.put("etaMinutes", etaMinutes);
        etaInfo.put("formattedETA", formattedETA);
        etaInfo.put("busLocation", new double[]{busCoords[0], busCoords[1]});
        etaInfo.put("userLocation", new double[]{userLat, userLng});
        etaInfo.put("timestamp", System.currentTimeMillis());

        return etaInfo;
    }

    /**
     * Get ETA information for all active buses relative to a user location
     */
    public List<Map<String, Object>> getAllBusETAs(double userLat, double userLng) {
        List<Map<String, Object>> allETAs = new ArrayList<>();

        for (Map.Entry<String, BusLocation> entry : busLocations.entrySet()) {
            String busId = entry.getKey();
            Map<String, Object> etaInfo = calculateBusETA(busId, userLat, userLng);
            if ((Boolean) etaInfo.get("available")) {
                allETAs.add(etaInfo);
            }
        }

        // Sort by ETA (closest buses first)
        allETAs.sort((a, b) -> {
            Integer etaA = (Integer) a.get("etaMinutes");
            Integer etaB = (Integer) b.get("etaMinutes");
            return etaA.compareTo(etaB);
        });

        return allETAs;
    }
}