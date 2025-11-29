package com.citybus.service;

import com.citybus.model.Route;
import com.citybus.model.Stop;
import com.citybus.util.DistanceCalculator;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoutePathService {

    private final BusTrackingService busTrackingService;

    public RoutePathService(BusTrackingService busTrackingService) {
        this.busTrackingService = busTrackingService;
    }

    /**
     * Find the nearest bus stop on a specific route to the user's location
     */
    public Map<String, Object> findNearestStopOnRoute(String routeId, double userLat, double userLng) {
        Route route = busTrackingService.getRoute(routeId);
        if (route == null || route.getStops() == null || route.getStops().isEmpty()) {
            return null;
        }

        Stop nearestStop = null;
        double minDistance = Double.MAX_VALUE;
        int stopIndex = -1;

        for (int i = 0; i < route.getStops().size(); i++) {
            Stop stop = route.getStops().get(i);
            if (stop.getCoords() != null && stop.getCoords().length >= 2) {
                double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                        userLat, userLng,
                        stop.getCoords()[0], stop.getCoords()[1]
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestStop = stop;
                    stopIndex = i;
                }
            }
        }

        if (nearestStop == null) {
            return null;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("stop", nearestStop);
        result.put("stopIndex", stopIndex);
        result.put("distance", Math.round(minDistance * 1000)); // meters
        result.put("distanceKm", Math.round(minDistance * 100.0) / 100.0);
        result.put("walkingTime", calculateWalkingTime(minDistance));
        result.put("routeName", route.getName());

        return result;
    }

    /**
     * Calculate walking time in minutes based on distance
     * Average walking speed: 5 km/h
     */
    private int calculateWalkingTime(double distanceKm) {
        double walkingSpeedKmh = 5.0;
        return (int) Math.ceil((distanceKm / walkingSpeedKmh) * 60);
    }

    /**
     * Get all stops on a route with their distances from user
     */
    public List<Map<String, Object>> getAllStopsWithDistances(String routeId, double userLat, double userLng) {
        Route route = busTrackingService.getRoute(routeId);
        if (route == null || route.getStops() == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> stopsWithDistances = new ArrayList<>();

        for (int i = 0; i < route.getStops().size(); i++) {
            Stop stop = route.getStops().get(i);
            if (stop.getCoords() != null && stop.getCoords().length >= 2) {
                double distance = DistanceCalculator.getDistanceFromLatLonInKm(
                        userLat, userLng,
                        stop.getCoords()[0], stop.getCoords()[1]
                );

                Map<String, Object> stopData = new HashMap<>();
                stopData.put("name", stop.getName());
                stopData.put("coords", stop.getCoords());
                stopData.put("index", i);
                stopData.put("distance", Math.round(distance * 1000)); // meters
                stopData.put("distanceKm", Math.round(distance * 100.0) / 100.0);
                stopData.put("walkingTime", calculateWalkingTime(distance));

                stopsWithDistances.add(stopData);
            }
        }

        // Sort by distance
        stopsWithDistances.sort(Comparator.comparingDouble(s -> (Double) s.get("distanceKm")));

        return stopsWithDistances;
    }
}