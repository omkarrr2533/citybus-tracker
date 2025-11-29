package com.citybus.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BusCapacityService {

    // Store real-time capacity data
    private Map<String, Integer> realTimeCapacity = new ConcurrentHashMap<>();

    // Store historical capacity data for patterns
    private Map<String, List<CapacityRecord>> capacityHistory = new ConcurrentHashMap<>();

    // Bus capacity configurations
    private static final int STANDARD_BUS_CAPACITY = 50;
    private static final int STANDING_CAPACITY = 30;
    private static final int TOTAL_CAPACITY = STANDARD_BUS_CAPACITY + STANDING_CAPACITY;

    /**
     * Calculate capacity confidence score for a bus
     */
    public Map<String, Object> calculateCapacityScore(String busId, String routeId, int stopIndex) {
        Map<String, Object> capacityInfo = new HashMap<>();

        // Get current capacity (from sensors or estimation)
        int currentPassengers = getCurrentCapacity(busId, routeId, stopIndex);

        // Calculate percentage
        int capacityPercentage = (int) Math.round((currentPassengers / (double) TOTAL_CAPACITY) * 100);

        // Determine comfort level
        String comfortLevel = getComfortLevel(capacityPercentage);
        String color = getCapacityColor(capacityPercentage);
        String icon = getCapacityIcon(capacityPercentage);
        String recommendation = getRecommendation(capacityPercentage);

        capacityInfo.put("busId", busId);
        capacityInfo.put("routeId", routeId);
        capacityInfo.put("stopIndex", stopIndex);
        capacityInfo.put("currentPassengers", currentPassengers);
        capacityInfo.put("totalCapacity", TOTAL_CAPACITY);
        capacityInfo.put("capacityPercentage", capacityPercentage);
        capacityInfo.put("comfortLevel", comfortLevel);
        capacityInfo.put("color", color);
        capacityInfo.put("icon", icon);
        capacityInfo.put("recommendation", recommendation);
        capacityInfo.put("confidenceScore", calculateConfidenceScore(busId));
        capacityInfo.put("timestamp", System.currentTimeMillis());

        return capacityInfo;
    }

    /**
     * Get current capacity (with estimation if sensors unavailable)
     */
    private int getCurrentCapacity(String busId, String routeId, int stopIndex) {
        // Check if we have real-time data
        if (realTimeCapacity.containsKey(busId)) {
            return realTimeCapacity.get(busId);
        }

        // Otherwise, estimate based on patterns
        return estimateCapacity(busId, routeId, stopIndex);
    }

    /**
     * Estimate capacity based on time of day and route patterns
     */
    private int estimateCapacity(String busId, String routeId, int stopIndex) {
        LocalTime now = LocalTime.now();

        // Peak hours: 7-9 AM and 5-7 PM
        boolean isPeakHour = (now.isAfter(LocalTime.of(7, 0)) && now.isBefore(LocalTime.of(9, 0))) ||
                (now.isAfter(LocalTime.of(17, 0)) && now.isBefore(LocalTime.of(19, 0)));

        // Weekend check
        boolean isWeekend = LocalDateTime.now().getDayOfWeek().getValue() >= 6;

        // Base estimation
        int baseCapacity;
        if (isPeakHour && !isWeekend) {
            baseCapacity = (int) (TOTAL_CAPACITY * 0.75); // 75% during peak
        } else if (isWeekend) {
            baseCapacity = (int) (TOTAL_CAPACITY * 0.4); // 40% on weekends
        } else {
            baseCapacity = (int) (TOTAL_CAPACITY * 0.5); // 50% off-peak
        }

        // Adjust based on stop index (buses fill up along route)
        double stopFactor = 1.0 + (stopIndex * 0.05); // 5% increase per stop
        int estimatedCapacity = (int) (baseCapacity * stopFactor);

        // Cap at total capacity
        return Math.min(estimatedCapacity, TOTAL_CAPACITY);
    }

    /**
     * Update real-time capacity from sensors
     */
    public void updateRealTimeCapacity(String busId, int passengerCount) {
        realTimeCapacity.put(busId, passengerCount);

        // Store in history
        List<CapacityRecord> history = capacityHistory.computeIfAbsent(busId, k -> new ArrayList<>());
        history.add(new CapacityRecord(passengerCount, LocalDateTime.now()));

        // Keep only last 100 records
        if (history.size() > 100) {
            history.remove(0);
        }
    }

    /**
     * Calculate confidence score based on data availability
     */
    private double calculateConfidenceScore(String busId) {
        if (realTimeCapacity.containsKey(busId)) {
            return 0.95; // High confidence with real-time data
        }

        List<CapacityRecord> history = capacityHistory.get(busId);
        if (history != null && !history.isEmpty()) {
            // Medium confidence with historical data
            long recentRecords = history.stream()
                    .filter(r -> r.timestamp.isAfter(LocalDateTime.now().minusHours(1)))
                    .count();
            return 0.6 + (recentRecords * 0.05);
        }

        return 0.5; // Low confidence with estimation only
    }

    /**
     * Get comfort level description
     */
    private String getComfortLevel(int percentage) {
        if (percentage < 40) return "Plenty of Space";
        if (percentage < 60) return "Comfortable";
        if (percentage < 75) return "Moderately Full";
        if (percentage < 90) return "Crowded";
        return "Very Crowded";
    }

    /**
     * Get color code for capacity
     */
    private String getCapacityColor(int percentage) {
        if (percentage < 40) return "#10b981"; // Green
        if (percentage < 60) return "#06d6a0"; // Teal
        if (percentage < 75) return "#fbbf24"; // Yellow
        if (percentage < 90) return "#f59e0b"; // Orange
        return "#ef4444"; // Red
    }

    /**
     * Get icon for capacity
     */
    private String getCapacityIcon(int percentage) {
        if (percentage < 40) return "✅";
        if (percentage < 60) return "👍";
        if (percentage < 75) return "⚠️";
        if (percentage < 90) return "⚡";
        return "🚫";
    }

    /**
     * Get recommendation based on capacity
     */
    private String getRecommendation(int percentage) {
        if (percentage < 40) {
            return "Great time to board! Plenty of seats available.";
        } else if (percentage < 60) {
            return "Good time to board. Comfortable seating available.";
        } else if (percentage < 75) {
            return "Bus is moderately full. Some standing may be required.";
        } else if (percentage < 90) {
            return "Bus is crowded. Consider waiting for next bus if possible.";
        } else {
            return "Bus is very crowded. Next bus recommended for comfort.";
        }
    }

    /**
     * Get capacity trends for a bus
     */
    public Map<String, Object> getCapacityTrends(String busId) {
        Map<String, Object> trends = new HashMap<>();

        List<CapacityRecord> history = capacityHistory.get(busId);
        if (history == null || history.isEmpty()) {
            trends.put("available", false);
            trends.put("message", "No historical data available");
            return trends;
        }

        // Calculate average capacity
        double avgCapacity = history.stream()
                .mapToInt(r -> r.passengerCount)
                .average()
                .orElse(0);

        // Calculate peak times
        Map<Integer, List<Integer>> hourlyCapacity = new HashMap<>();
        for (CapacityRecord record : history) {
            int hour = record.timestamp.getHour();
            hourlyCapacity.computeIfAbsent(hour, k -> new ArrayList<>()).add(record.passengerCount);
        }

        // Find busiest hours
        int busiestHour = hourlyCapacity.entrySet().stream()
                .max(Comparator.comparingDouble(e -> e.getValue().stream()
                        .mapToInt(Integer::intValue)
                        .average()
                        .orElse(0)))
                .map(Map.Entry::getKey)
                .orElse(0);

        trends.put("available", true);
        trends.put("averageCapacity", Math.round(avgCapacity));
        trends.put("averagePercentage", Math.round((avgCapacity / TOTAL_CAPACITY) * 100));
        trends.put("busiestHour", busiestHour + ":00");
        trends.put("totalRecords", history.size());
        trends.put("lastUpdated", history.get(history.size() - 1).timestamp);

        return trends;
    }

    /**
     * Get capacity forecast for next stops
     */
    public List<Map<String, Object>> getCapacityForecast(String busId, String routeId, int currentStopIndex, int numStops) {
        List<Map<String, Object>> forecast = new ArrayList<>();

        for (int i = 1; i <= numStops; i++) {
            int stopIndex = currentStopIndex + i;
            Map<String, Object> stopForecast = calculateCapacityScore(busId, routeId, stopIndex);
            stopForecast.put("stopNumber", stopIndex);
            forecast.add(stopForecast);
        }

        return forecast;
    }

    /**
     * Inner class for capacity records
     */
    private static class CapacityRecord {
        int passengerCount;
        LocalDateTime timestamp;

        CapacityRecord(int passengerCount, LocalDateTime timestamp) {
            this.passengerCount = passengerCount;
            this.timestamp = timestamp;
        }
    }
}