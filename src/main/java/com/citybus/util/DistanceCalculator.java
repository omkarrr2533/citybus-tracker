package com.citybus.util;

public class DistanceCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double AVERAGE_BUS_SPEED_KMH = 20.0; // Average city bus speed

    public static double getDistanceFromLatLonInKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = deg2rad(lat2 - lat1);
        double dLon = deg2rad(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculate ETA in minutes based on distance
     * @param distanceKm Distance in kilometers
     * @return ETA in minutes
     */
    public static int calculateETAMinutes(double distanceKm) {
        return (int) Math.ceil((distanceKm / AVERAGE_BUS_SPEED_KMH) * 60);
    }

    /**
     * Calculate ETA with custom speed
     * @param distanceKm Distance in kilometers
     * @param speedKmh Speed in km/h
     * @return ETA in minutes
     */
    public static int calculateETAMinutes(double distanceKm, double speedKmh) {
        if (speedKmh <= 0) {
            speedKmh = AVERAGE_BUS_SPEED_KMH;
        }
        return (int) Math.ceil((distanceKm / speedKmh) * 60);
    }

    /**
     * Get formatted ETA string
     * @param distanceKm Distance in kilometers
     * @return Formatted ETA string (e.g., "5 min", "1 hour 15 min")
     */
    public static String getFormattedETA(double distanceKm) {
        int totalMinutes = calculateETAMinutes(distanceKm);

        if (totalMinutes < 1) {
            return "< 1 min";
        } else if (totalMinutes < 60) {
            return totalMinutes + " min";
        } else {
            int hours = totalMinutes / 60;
            int minutes = totalMinutes % 60;
            return hours + " hour" + (hours > 1 ? "s" : "") +
                    (minutes > 0 ? " " + minutes + " min" : "");
        }
    }

    private static double deg2rad(double deg) {
        return deg * (Math.PI / 180);
    }
}