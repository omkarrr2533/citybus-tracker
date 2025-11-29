package com.citybus.service;

import com.citybus.model.BusLocation;
import com.citybus.model.Route;
import com.citybus.model.Stop;
import com.citybus.util.DistanceCalculator;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PredictiveLocationService {

    private final BusTrackingService busTrackingService;

    // Store geofence data for stops
    private static final double GEOFENCE_RADIUS_KM = 0.05; // 50 meters
    private static final double APPROACH_RADIUS_KM = 0.1; // 100 meters

    // Track buses approaching stops
    private Map<String, Map<String, Object>> busApproachData = new ConcurrentHashMap<>();

    // Historical speed data for different conditions
    private Map<String, Double> weatherSpeedFactors = new ConcurrentHashMap<>();

    public PredictiveLocationService(BusTrackingService busTrackingService) {
        this.busTrackingService = busTrackingService;
        initializeWeatherFactors();
    }

    private void initializeWeatherFactors() {
        // Speed reduction factors based on weather conditions
        weatherSpeedFactors.put("CLEAR", 1.0);
        weatherSpeedFactors.put("LIGHT_RAIN", 0.9);
        weatherSpeedFactors.put("HEAVY_RAIN", 0.7);
        weatherSpeedFactors.put("SNOW", 0.6);
        weatherSpeedFactors.put("FOG", 0.8);
        weatherSpeedFactors.put("STORM", 0.5);
    }

    /**
     * Check if bus is approaching a stop and provide precision countdown
     */
    public Map<String, Object> checkStopApproach(String busId, double[] busCoords, String routeId) {
        Map<String, Object> approachInfo = new HashMap<>();
        approachInfo.put("isApproaching", false);

        Route route = busTrackingService.getRoute(routeId);
        if (route == null || route.getStops() == null) {
            return approachInfo;
        }

        Stop nearestStop = null;
        double minDistance = Double.MAX_VALUE;
        int stopIndex = -1;

        // Find nearest stop
        for (int i = 0; i < route.getStops().size(); i++) {
            Stop stop = route.getStops().get(i);
            if (stop.getCoords() != null && stop.getCoords().length >= 2) {
                double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                        busCoords[0], busCoords[1],
                        stop.getCoords()[0], stop.getCoords()[1]
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStop = stop;
                    stopIndex = i;
                }
            }
        }

        if (nearestStop != null) {
            // Check if within geofence (50m)
            if (minDistance <= GEOFENCE_RADIUS_KM) {
                approachInfo.put("isApproaching", true);
                approachInfo.put("inGeofence", true);
                approachInfo.put("stopName", nearestStop.getName());
                approachInfo.put("stopIndex", stopIndex);
                approachInfo.put("distanceMeters", Math.round(minDistance * 1000));

                // Calculate precise seconds countdown
                int secondsToArrival = calculatePreciseSeconds(minDistance);
                approachInfo.put("secondsToArrival", secondsToArrival);
                approachInfo.put("countdown", String.format("%d seconds to arrival", secondsToArrival));

                // Update approach tracking
                updateApproachTracking(busId, stopIndex, minDistance);

            } else if (minDistance <= APPROACH_RADIUS_KM) {
                // Approaching zone (within 100m)
                approachInfo.put("isApproaching", true);
                approachInfo.put("inGeofence", false);
                approachInfo.put("stopName", nearestStop.getName());
                approachInfo.put("stopIndex", stopIndex);
                approachInfo.put("distanceMeters", Math.round(minDistance * 1000));
                approachInfo.put("status", "approaching");
            }
        }

        return approachInfo;
    }

    /**
     * Calculate precise seconds based on distance (assuming ~10 km/h for final approach)
     */
    private int calculatePreciseSeconds(double distanceKm) {
        double approachSpeedKmh = 10.0; // Slow approach speed
        double hours = distanceKm / approachSpeedKmh;
        return (int) Math.ceil(hours * 3600); // Convert to seconds
    }

    /**
     * Calculate weather-adjusted ETA
     */
    public Map<String, Object> calculateWeatherAdjustedETA(
            String busId,
            double[] busCoords,
            double[] targetCoords,
            String weatherCondition) {

        Map<String, Object> etaInfo = new HashMap<>();

        // Calculate base distance
        double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                busCoords[0], busCoords[1],
                targetCoords[0], targetCoords[1]
        );

        // Get weather factor
        double weatherFactor = weatherSpeedFactors.getOrDefault(
                weatherCondition.toUpperCase(),
                1.0
        );

        // Base speed: 20 km/h
        double baseSpeedKmh = 20.0;
        double adjustedSpeedKmh = baseSpeedKmh * weatherFactor;

        // Calculate ETAs
        int baseEtaMinutes = DistanceCalculator.calculateETAMinutes(distance);
        int adjustedEtaMinutes = (int) Math.ceil((distance / adjustedSpeedKmh) * 60);

        etaInfo.put("distance", distance);
        etaInfo.put("distanceMeters", Math.round(distance * 1000));
        etaInfo.put("baseEtaMinutes", baseEtaMinutes);
        etaInfo.put("adjustedEtaMinutes", adjustedEtaMinutes);
        etaInfo.put("weatherCondition", weatherCondition);
        etaInfo.put("weatherFactor", weatherFactor);
        etaInfo.put("delayMinutes", adjustedEtaMinutes - baseEtaMinutes);
        etaInfo.put("adjustedSpeed", adjustedSpeedKmh);

        // Format display string
        String etaDisplay = formatWeatherAdjustedETA(adjustedEtaMinutes, weatherCondition, weatherFactor);
        etaInfo.put("displayText", etaDisplay);

        return etaInfo;
    }

    private String formatWeatherAdjustedETA(int minutes, String weather, double factor) {
        if (factor < 1.0) {
            int delayMinutes = (int) Math.ceil(minutes * (1 - factor));
            return String.format("%d min (+" + delayMinutes + " min due to %s)",
                    minutes, weather.toLowerCase().replace('_', ' '));
        }
        return minutes + " min";
    }

    /**
     * Track bus approach to stops for better predictions
     */
    private void updateApproachTracking(String busId, int stopIndex, double distance) {
        Map<String, Object> tracking = busApproachData.computeIfAbsent(busId, k -> new HashMap<>());

        tracking.put("stopIndex", stopIndex);
        tracking.put("distance", distance);
        tracking.put("timestamp", System.currentTimeMillis());
        tracking.put("lastUpdateDistance", tracking.getOrDefault("distance", distance));

        // Calculate approach speed
        if (tracking.containsKey("lastUpdateTime") && tracking.containsKey("lastUpdateDistance")) {
            long timeDiff = System.currentTimeMillis() - (Long) tracking.get("lastUpdateTime");
            double distDiff = (Double) tracking.get("lastUpdateDistance") - distance;

            if (timeDiff > 0 && distDiff > 0) {
                double speedKmh = (distDiff / (timeDiff / 1000.0)) * 3600;
                tracking.put("approachSpeed", speedKmh);
            }
        }

        tracking.put("lastUpdateTime", System.currentTimeMillis());
    }

    /**
     * Get enhanced approach information with speed and trajectory
     */
    public Map<String, Object> getEnhancedApproachInfo(String busId) {
        Map<String, Object> tracking = busApproachData.get(busId);
        if (tracking == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> info = new HashMap<>(tracking);

        // Add trajectory prediction
        if (tracking.containsKey("approachSpeed")) {
            double speed = (Double) tracking.get("approachSpeed");
            double distance = (Double) tracking.get("distance");

            if (speed > 0) {
                int predictedSeconds = (int) Math.ceil((distance / speed) * 3600);
                info.put("predictedArrivalSeconds", predictedSeconds);
            }
        }

        return info;
    }

    /**
     * Clear approach tracking when bus leaves geofence
     */
    public void clearApproachTracking(String busId) {
        busApproachData.remove(busId);
    }

    /**
     * Get all buses currently approaching stops
     */
    public List<Map<String, Object>> getAllApproachingBuses() {
        List<Map<String, Object>> approaching = new ArrayList<>();

        long now = System.currentTimeMillis();
        long timeout = 60000; // 1 minute timeout

        busApproachData.forEach((busId, data) -> {
            long timestamp = (Long) data.getOrDefault("timestamp", 0L);
            if (now - timestamp < timeout) {
                Map<String, Object> info = new HashMap<>(data);
                info.put("busId", busId);
                approaching.add(info);
            }
        });

        return approaching;
    }
}