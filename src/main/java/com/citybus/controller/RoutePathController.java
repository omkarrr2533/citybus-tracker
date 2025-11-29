package com.citybus.controller;

import com.citybus.service.RoutePathService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/route-path")
@CrossOrigin(origins = "*")
public class RoutePathController {

    private final RoutePathService routePathService;

    public RoutePathController(RoutePathService routePathService) {
        this.routePathService = routePathService;
    }

    /**
     * Find the nearest bus stop on a route to user's location
     * POST /api/route-path/nearest-stop
     * Body: { "routeId": "1", "userLat": 19.8762, "userLng": 75.3433 }
     */
    @PostMapping("/nearest-stop")
    public ResponseEntity<?> getNearestStop(@RequestBody Map<String, Object> request) {
        try {
            String routeId = (String) request.get("routeId");
            Double userLat = getDoubleValue(request.get("userLat"));
            Double userLng = getDoubleValue(request.get("userLng"));

            if (routeId == null || userLat == null || userLng == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required parameters: routeId, userLat, userLng")
                );
            }

            Map<String, Object> nearestStop = routePathService.findNearestStopOnRoute(
                    routeId, userLat, userLng
            );

            if (nearestStop == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(nearestStop);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error finding nearest stop: " + e.getMessage())
            );
        }
    }

    /**
     * Get all stops on a route with distances from user location
     * POST /api/route-path/all-stops
     * Body: { "routeId": "1", "userLat": 19.8762, "userLng": 75.3433 }
     */
    @PostMapping("/all-stops")
    public ResponseEntity<?> getAllStopsWithDistances(@RequestBody Map<String, Object> request) {
        try {
            String routeId = (String) request.get("routeId");
            Double userLat = getDoubleValue(request.get("userLat"));
            Double userLng = getDoubleValue(request.get("userLng"));

            if (routeId == null || userLat == null || userLng == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required parameters: routeId, userLat, userLng")
                );
            }

            List<Map<String, Object>> stops = routePathService.getAllStopsWithDistances(
                    routeId, userLat, userLng
            );

            return ResponseEntity.ok(stops);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting stops: " + e.getMessage())
            );
        }
    }

    private Double getDoubleValue(Object value) {
        if (value == null) return null;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Number) return ((Number) value).doubleValue();
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("success", false);
        return error;
    }
}