package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Feature;
import com.restaurantbooking.restaurant_booking.model.Preference;
import java.util.*;

/**
 * Service for recommending tables based on guest preferences.
 */
public class RecommendationService {

    /**
     * Calculate recommendation score for a table.
     * 
     * score = 100
     * - subtract (capacity - guestCount) * 5
     * + add +10 if matches nearWindow preference
     * + add +10 if matches privateCorner
     * + add +10 if matches nearKidsZone
     * + add +5 if zone matches
     */
    public static int calculateScore(Table table, int guestCount, String zoneName, Set<Preference> preferences) {
        int score = 100;

        // Penalize tables that are too large
        int capacityDifference = table.getCapacity() - guestCount;
        score -= capacityDifference * 5;

        // Bonus for matching preferences
        if (preferences != null) {
            if (preferences.contains(Preference.NEAR_WINDOW) && 
                table.getFeatures().contains(Feature.WINDOW)) {
                score += 10;
            }
            if (preferences.contains(Preference.PRIVATE_CORNER) && 
                table.getFeatures().contains(Feature.PRIVATE_AREA)) {
                score += 10;
            }
            if (preferences.contains(Preference.NEAR_KIDS_ZONE) && 
                table.getFeatures().contains(Feature.KIDS_ZONE)) {
                score += 10;
            }
        }

        // Bonus for matching zone
        if (zoneName != null && table.getZone() != null && 
            table.getZone().getName().equalsIgnoreCase(zoneName)) {
            score += 5;
        }

        return score;
    }

    /**
     * Find the best recommended table from available tables.
     */
    public static Long findRecommendedTableId(List<Table> availableTables, 
                                              int guestCount, 
                                              String zoneName,
                                              Set<Preference> preferences) {
        if (availableTables.isEmpty()) {
            return null;
        }

        Table recommendedTable = availableTables.get(0);
        int highestScore = calculateScore(recommendedTable, guestCount, zoneName, preferences);

        for (Table table : availableTables) {
            int score = calculateScore(table, guestCount, zoneName, preferences);
            if (score > highestScore) {
                highestScore = score;
                recommendedTable = table;
            }
        }

        return recommendedTable.getId();
    }
}
