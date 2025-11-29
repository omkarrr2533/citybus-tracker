package com.citybus.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class CommunityFeaturesService {

    // Lost & Found tracking
    private Map<String, LostItemReport> lostItems = new ConcurrentHashMap<>();

    // Bus condition reports
    private Map<String, List<BusConditionReport>> busConditionReports = new ConcurrentHashMap<>();

    // System issue flags
    private Map<String, List<SystemIssueReport>> systemIssues = new ConcurrentHashMap<>();

    /**
     * Report a lost item
     */
    public Map<String, Object> reportLostItem(String userId, String busId, String routeId,
                                              String description, String exitStop) {
        String reportId = "LOST-" + UUID.randomUUID().toString().substring(0, 8);

        LostItemReport report = new LostItemReport(
                reportId,
                userId,
                busId,
                routeId,
                description,
                exitStop,
                LocalDateTime.now()
        );

        lostItems.put(reportId, report);

        Map<String, Object> response = new HashMap<>();
        response.put("reportId", reportId);
        response.put("status", "success");
        response.put("message", "Lost item report created. Users on this bus will be notified.");
        response.put("timestamp", report.timestamp);

        return response;
    }

    /**
     * Get lost items for a specific bus
     */
    public List<Map<String, Object>> getLostItemsForBus(String busId) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24); // Last 24 hours

        return lostItems.values().stream()
                .filter(item -> item.busId.equals(busId) && item.timestamp.isAfter(cutoff))
                .filter(item -> !item.found)
                .map(this::convertLostItemToMap)
                .collect(Collectors.toList());
    }

    /**
     * Get lost items for a route
     */
    public List<Map<String, Object>> getLostItemsForRoute(String routeId) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        return lostItems.values().stream()
                .filter(item -> item.routeId.equals(routeId) && item.timestamp.isAfter(cutoff))
                .filter(item -> !item.found)
                .map(this::convertLostItemToMap)
                .collect(Collectors.toList());
    }

    /**
     * Mark item as found
     */
    public Map<String, Object> markItemFound(String reportId, String foundByUserId) {
        LostItemReport item = lostItems.get(reportId);
        Map<String, Object> response = new HashMap<>();

        if (item != null) {
            item.found = true;
            item.foundByUserId = foundByUserId;
            item.foundTimestamp = LocalDateTime.now();

            response.put("status", "success");
            response.put("message", "Item marked as found!");
            response.put("reportId", reportId);
        } else {
            response.put("status", "error");
            response.put("message", "Report not found");
        }

        return response;
    }

    /**
     * Report bus condition
     */
    public Map<String, Object> reportBusCondition(String userId, String busId,
                                                  String vehicleId, Map<String, Object> ratings) {
        String reportId = "COND-" + UUID.randomUUID().toString().substring(0, 8);

        BusConditionReport report = new BusConditionReport(
                reportId,
                userId,
                busId,
                vehicleId,
                ratings,
                LocalDateTime.now()
        );

        List<BusConditionReport> reports = busConditionReports.computeIfAbsent(
                vehicleId,
                k -> new ArrayList<>()
        );
        reports.add(report);

        Map<String, Object> response = new HashMap<>();
        response.put("reportId", reportId);
        response.put("status", "success");
        response.put("message", "Thank you for your feedback!");

        return response;
    }

    /**
     * Get bus condition summary
     */
    public Map<String, Object> getBusConditionSummary(String vehicleId) {
        List<BusConditionReport> reports = busConditionReports.get(vehicleId);

        if (reports == null || reports.isEmpty()) {
            return createDefaultConditionSummary();
        }

        // Only consider reports from last 7 days
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<BusConditionReport> recentReports = reports.stream()
                .filter(r -> r.timestamp.isAfter(cutoff))
                .collect(Collectors.toList());

        if (recentReports.isEmpty()) {
            return createDefaultConditionSummary();
        }

        Map<String, Object> summary = new HashMap<>();

        // Calculate averages
        Map<String, Double> averages = new HashMap<>();
        Map<String, Integer> counts = new HashMap<>();

        for (BusConditionReport report : recentReports) {
            report.ratings.forEach((category, value) -> {
                double rating = ((Number) value).doubleValue();
                averages.merge(category, rating, Double::sum);
                counts.merge(category, 1, Integer::sum);
            });
        }

        averages.replaceAll((k, v) -> v / counts.get(k));

        summary.put("vehicleId", vehicleId);
        summary.put("averageRatings", averages);
        summary.put("totalReports", recentReports.size());
        summary.put("overallScore", calculateOverallScore(averages));
        summary.put("lastReported", recentReports.get(recentReports.size() - 1).timestamp);
        summary.put("conditionLevel", getConditionLevel(calculateOverallScore(averages)));

        // Identify issues
        List<String> issues = identifyIssues(averages);
        summary.put("identifiedIssues", issues);

        return summary;
    }

    private Map<String, Object> createDefaultConditionSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("averageRatings", new HashMap<>());
        summary.put("totalReports", 0);
        summary.put("overallScore", 0.0);
        summary.put("conditionLevel", "NO_DATA");
        return summary;
    }

    private double calculateOverallScore(Map<String, Double> averages) {
        if (averages.isEmpty()) return 0.0;
        return averages.values().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
    }

    private String getConditionLevel(double score) {
        if (score >= 4.5) return "EXCELLENT";
        if (score >= 4.0) return "GOOD";
        if (score >= 3.0) return "FAIR";
        if (score >= 2.0) return "POOR";
        return "CRITICAL";
    }

    private List<String> identifyIssues(Map<String, Double> averages) {
        List<String> issues = new ArrayList<>();

        averages.forEach((category, rating) -> {
            if (rating < 3.0) {
                issues.add(category);
            }
        });

        return issues;
    }

    /**
     * Report system issue (PA muted, etc.)
     */
    public Map<String, Object> reportSystemIssue(String userId, String busId,
                                                 String issueType, String description) {
        String reportId = "ISSUE-" + UUID.randomUUID().toString().substring(0, 8);

        SystemIssueReport report = new SystemIssueReport(
                reportId,
                userId,
                busId,
                issueType,
                description,
                LocalDateTime.now()
        );

        List<SystemIssueReport> reports = systemIssues.computeIfAbsent(
                busId,
                k -> new ArrayList<>()
        );
        reports.add(report);

        Map<String, Object> response = new HashMap<>();
        response.put("reportId", reportId);
        response.put("status", "success");
        response.put("severity", determineSeverity(issueType));
        response.put("message", "Issue reported. Other passengers will be notified.");

        return response;
    }

    /**
     * Get active system issues for a bus
     */
    public List<Map<String, Object>> getSystemIssuesForBus(String busId) {
        List<SystemIssueReport> reports = systemIssues.get(busId);

        if (reports == null || reports.isEmpty()) {
            return Collections.emptyList();
        }

        // Only show issues from last 2 hours
        LocalDateTime cutoff = LocalDateTime.now().minusHours(2);

        return reports.stream()
                .filter(r -> r.timestamp.isAfter(cutoff) && !r.resolved)
                .map(this::convertIssueToMap)
                .collect(Collectors.toList());
    }

    /**
     * Resolve system issue
     */
    public Map<String, Object> resolveIssue(String reportId) {
        for (List<SystemIssueReport> reports : systemIssues.values()) {
            for (SystemIssueReport report : reports) {
                if (report.reportId.equals(reportId)) {
                    report.resolved = true;
                    report.resolvedTimestamp = LocalDateTime.now();

                    Map<String, Object> response = new HashMap<>();
                    response.put("status", "success");
                    response.put("message", "Issue marked as resolved");
                    return response;
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Issue not found");
        return response;
    }

    private String determineSeverity(String issueType) {
        switch (issueType.toUpperCase()) {
            case "PA_MUTED":
            case "NO_ANNOUNCEMENTS":
                return "HIGH"; // Critical for sight-impaired
            case "AC_NOT_WORKING":
            case "HEATING_ISSUE":
                return "MEDIUM";
            case "BROKEN_SEAT":
            case "LIGHT_OUT":
                return "LOW";
            default:
                return "MEDIUM";
        }
    }

    private Map<String, Object> convertLostItemToMap(LostItemReport item) {
        Map<String, Object> map = new HashMap<>();
        map.put("reportId", item.reportId);
        map.put("busId", item.busId);
        map.put("routeId", item.routeId);
        map.put("description", item.description);
        map.put("exitStop", item.exitStop);
        map.put("timestamp", item.timestamp);
        map.put("timeAgo", getTimeAgo(item.timestamp));
        return map;
    }

    private Map<String, Object> convertIssueToMap(SystemIssueReport issue) {
        Map<String, Object> map = new HashMap<>();
        map.put("reportId", issue.reportId);
        map.put("busId", issue.busId);
        map.put("issueType", issue.issueType);
        map.put("description", issue.description);
        map.put("severity", determineSeverity(issue.issueType));
        map.put("timestamp", issue.timestamp);
        map.put("timeAgo", getTimeAgo(issue.timestamp));
        return map;
    }

    private String getTimeAgo(LocalDateTime timestamp) {
        long minutes = java.time.Duration.between(timestamp, LocalDateTime.now()).toMinutes();

        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " min ago";

        long hours = minutes / 60;
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

        long days = hours / 24;
        return days + " day" + (days > 1 ? "s" : "") + " ago";
    }

    /**
     * Inner classes for data models
     */
    private static class LostItemReport {
        String reportId;
        String userId;
        String busId;
        String routeId;
        String description;
        String exitStop;
        LocalDateTime timestamp;
        boolean found = false;
        String foundByUserId;
        LocalDateTime foundTimestamp;

        LostItemReport(String reportId, String userId, String busId, String routeId,
                       String description, String exitStop, LocalDateTime timestamp) {
            this.reportId = reportId;
            this.userId = userId;
            this.busId = busId;
            this.routeId = routeId;
            this.description = description;
            this.exitStop = exitStop;
            this.timestamp = timestamp;
        }
    }

    private static class BusConditionReport {
        String reportId;
        String userId;
        String busId;
        String vehicleId;
        Map<String, Object> ratings;
        LocalDateTime timestamp;

        BusConditionReport(String reportId, String userId, String busId, String vehicleId,
                           Map<String, Object> ratings, LocalDateTime timestamp) {
            this.reportId = reportId;
            this.userId = userId;
            this.busId = busId;
            this.vehicleId = vehicleId;
            this.ratings = ratings;
            this.timestamp = timestamp;
        }
    }

    private static class SystemIssueReport {
        String reportId;
        String userId;
        String busId;
        String issueType;
        String description;
        LocalDateTime timestamp;
        boolean resolved = false;
        LocalDateTime resolvedTimestamp;

        SystemIssueReport(String reportId, String userId, String busId, String issueType,
                          String description, LocalDateTime timestamp) {
            this.reportId = reportId;
            this.userId = userId;
            this.busId = busId;
            this.issueType = issueType;
            this.description = description;
            this.timestamp = timestamp;
        }
    }
}