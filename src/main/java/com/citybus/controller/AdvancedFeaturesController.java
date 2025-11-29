package com.citybus.controller;

import com.citybus.service.BusCapacityService;
import com.citybus.service.CommunityFeaturesService;
import com.citybus.service.PredictiveLocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advanced")
@CrossOrigin(origins = "*")
public class AdvancedFeaturesController {

    private final PredictiveLocationService predictiveLocationService;
    private final BusCapacityService busCapacityService;
    private final CommunityFeaturesService communityFeaturesService;

    public AdvancedFeaturesController(
            PredictiveLocationService predictiveLocationService,
            BusCapacityService busCapacityService,
            CommunityFeaturesService communityFeaturesService) {
        this.predictiveLocationService = predictiveLocationService;
        this.busCapacityService = busCapacityService;
        this.communityFeaturesService = communityFeaturesService;
    }

    // ===== PREDICTIVE LOCATION & ETA =====

    /**
     * Check if bus is approaching a stop (geofencing)
     */
    @PostMapping("/stop-approach")
    public ResponseEntity<?> checkStopApproach(@RequestBody Map<String, Object> request) {
        try {
            String busId = (String) request.get("busId");
            String routeId = (String) request.get("routeId");

            @SuppressWarnings("unchecked")
            List<Number> coords = (List<Number>) request.get("coords");

            if (busId == null || routeId == null || coords == null || coords.size() < 2) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required parameters")
                );
            }

            double[] busCoords = new double[]{
                    coords.get(0).doubleValue(),
                    coords.get(1).doubleValue()
            };

            Map<String, Object> approachInfo = predictiveLocationService.checkStopApproach(
                    busId, busCoords, routeId
            );

            return ResponseEntity.ok(approachInfo);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error checking stop approach: " + e.getMessage())
            );
        }
    }

    /**
     * Calculate weather-adjusted ETA
     */
    @PostMapping("/weather-eta")
    public ResponseEntity<?> calculateWeatherETA(@RequestBody Map<String, Object> request) {
        try {
            String busId = (String) request.get("busId");
            String weatherCondition = (String) request.get("weatherCondition");

            @SuppressWarnings("unchecked")
            List<Number> busCoords = (List<Number>) request.get("busCoords");
            @SuppressWarnings("unchecked")
            List<Number> targetCoords = (List<Number>) request.get("targetCoords");

            if (busCoords == null || targetCoords == null || weatherCondition == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required parameters")
                );
            }

            double[] busLocation = new double[]{
                    busCoords.get(0).doubleValue(),
                    busCoords.get(1).doubleValue()
            };

            double[] targetLocation = new double[]{
                    targetCoords.get(0).doubleValue(),
                    targetCoords.get(1).doubleValue()
            };

            Map<String, Object> etaInfo = predictiveLocationService.calculateWeatherAdjustedETA(
                    busId, busLocation, targetLocation, weatherCondition
            );

            return ResponseEntity.ok(etaInfo);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error calculating ETA: " + e.getMessage())
            );
        }
    }

    // ===== BUS CAPACITY =====

    /**
     * Get bus capacity confidence score
     */
    @GetMapping("/capacity/{busId}")
    public ResponseEntity<?> getBusCapacity(
            @PathVariable String busId,
            @RequestParam String routeId,
            @RequestParam(defaultValue = "0") int stopIndex) {
        try {
            Map<String, Object> capacityInfo = busCapacityService.calculateCapacityScore(
                    busId, routeId, stopIndex
            );

            return ResponseEntity.ok(capacityInfo);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting capacity: " + e.getMessage())
            );
        }
    }

    /**
     * Update real-time capacity (from sensors)
     */
    @PostMapping("/capacity/update")
    public ResponseEntity<?> updateCapacity(@RequestBody Map<String, Object> request) {
        try {
            String busId = (String) request.get("busId");
            Integer passengerCount = (Integer) request.get("passengerCount");

            if (busId == null || passengerCount == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing busId or passengerCount")
                );
            }

            busCapacityService.updateRealTimeCapacity(busId, passengerCount);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Capacity updated"
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error updating capacity: " + e.getMessage())
            );
        }
    }

    /**
     * Get capacity trends
     */
    @GetMapping("/capacity/{busId}/trends")
    public ResponseEntity<?> getCapacityTrends(@PathVariable String busId) {
        try {
            Map<String, Object> trends = busCapacityService.getCapacityTrends(busId);
            return ResponseEntity.ok(trends);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting trends: " + e.getMessage())
            );
        }
    }

    // ===== LOST & FOUND =====

    /**
     * Report a lost item
     */
    @PostMapping("/lost-found/report")
    public ResponseEntity<?> reportLostItem(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String busId = (String) request.get("busId");
            String routeId = (String) request.get("routeId");
            String description = (String) request.get("description");
            String exitStop = (String) request.get("exitStop");

            if (userId == null || busId == null || description == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required fields")
                );
            }

            Map<String, Object> result = communityFeaturesService.reportLostItem(
                    userId, busId, routeId, description, exitStop
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error reporting item: " + e.getMessage())
            );
        }
    }

    /**
     * Get lost items for a bus
     */
    @GetMapping("/lost-found/bus/{busId}")
    public ResponseEntity<?> getLostItemsForBus(@PathVariable String busId) {
        try {
            List<Map<String, Object>> items = communityFeaturesService.getLostItemsForBus(busId);
            return ResponseEntity.ok(items);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting lost items: " + e.getMessage())
            );
        }
    }

    /**
     * Mark item as found
     */
    @PostMapping("/lost-found/found")
    public ResponseEntity<?> markItemFound(@RequestBody Map<String, Object> request) {
        try {
            String reportId = (String) request.get("reportId");
            String foundByUserId = (String) request.get("foundByUserId");

            Map<String, Object> result = communityFeaturesService.markItemFound(
                    reportId, foundByUserId
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error marking item: " + e.getMessage())
            );
        }
    }

    // ===== BUS CONDITION REPORTS =====

    /**
     * Report bus condition
     */
    @PostMapping("/condition/report")
    public ResponseEntity<?> reportBusCondition(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String busId = (String) request.get("busId");
            String vehicleId = (String) request.get("vehicleId");

            @SuppressWarnings("unchecked")
            Map<String, Object> ratings = (Map<String, Object>) request.get("ratings");

            if (userId == null || busId == null || vehicleId == null || ratings == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required fields")
                );
            }

            Map<String, Object> result = communityFeaturesService.reportBusCondition(
                    userId, busId, vehicleId, ratings
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error reporting condition: " + e.getMessage())
            );
        }
    }

    /**
     * Get bus condition summary
     */
    @GetMapping("/condition/{vehicleId}")
    public ResponseEntity<?> getBusCondition(@PathVariable String vehicleId) {
        try {
            Map<String, Object> condition = communityFeaturesService.getBusConditionSummary(vehicleId);
            return ResponseEntity.ok(condition);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting condition: " + e.getMessage())
            );
        }
    }

    // ===== SYSTEM ISSUES =====

    /**
     * Report system issue (PA muted, etc.)
     */
    @PostMapping("/issue/report")
    public ResponseEntity<?> reportSystemIssue(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String busId = (String) request.get("busId");
            String issueType = (String) request.get("issueType");
            String description = (String) request.get("description");

            if (userId == null || busId == null || issueType == null) {
                return ResponseEntity.badRequest().body(
                        createErrorResponse("Missing required fields")
                );
            }

            Map<String, Object> result = communityFeaturesService.reportSystemIssue(
                    userId, busId, issueType, description
            );

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error reporting issue: " + e.getMessage())
            );
        }
    }

    /**
     * Get system issues for a bus
     */
    @GetMapping("/issue/bus/{busId}")
    public ResponseEntity<?> getSystemIssues(@PathVariable String busId) {
        try {
            List<Map<String, Object>> issues = communityFeaturesService.getSystemIssuesForBus(busId);
            return ResponseEntity.ok(issues);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error getting issues: " + e.getMessage())
            );
        }
    }

    /**
     * Resolve system issue
     */
    @PostMapping("/issue/resolve")
    public ResponseEntity<?> resolveIssue(@RequestBody Map<String, Object> request) {
        try {
            String reportId = (String) request.get("reportId");

            Map<String, Object> result = communityFeaturesService.resolveIssue(reportId);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    createErrorResponse("Error resolving issue: " + e.getMessage())
            );
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        error.put("success", false);
        return error;
    }
}