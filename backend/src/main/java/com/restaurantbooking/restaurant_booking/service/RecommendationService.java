package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Feature;
import com.restaurantbooking.restaurant_booking.model.Preference;
import java.util.*;

// EN: Provides scoring and selection logic for table recommendations.
// EE: Pakub laudade soovituste punktiarvutuse ja valiku loogikat.
public class RecommendationService {

    // EN: Calculates a weighted recommendation score for one table.
    // EE: Arvutab ühe laua kaalutud soovitusskoori.
    // EN: Inputs are table metadata, requested guest count, optional zone, and preferences.
    // EE: Sisenditeks on laua andmed, külaliste arv, valikuline tsoon ja eelistused.
    // EN: Returns a higher score for better fit.
    // EE: Tagastab parema sobivuse korral kõrgema skoori.
    public static int calculateScore(Table table, int guestCount, String zoneName, Set<Preference> preferences) {
        int score = 100;

        // EN: Penalize oversizing to prefer capacity-efficient matches.
        // EE: Karista liiga suuri laudu, et eelistada mahutavuselt sobivaid vasteid.
        int capacityDifference = table.getCapacity() - guestCount;
        score -= capacityDifference * 5;

        // EN: Add preference bonuses when table features match requested preferences.
        // EE: Lisa eelistusboonused, kui laua omadused vastavad soovidele.
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

        // EN: Apply a small bonus when the requested zone matches the table zone.
        // EE: Lisa väike boonus, kui soovitud tsoon kattub laua tsooniga.
        if (zoneName != null && table.getZone() != null && 
            table.getZone().getName().equalsIgnoreCase(zoneName)) {
            score += 5;
        }

        return score;
    }

    // EN: Selects the highest-scoring table from the available list.
    // EE: Valib saadaolevast nimekirjast kõrgeima skooriga laua.
    // EN: Returns the recommended table ID, or null when no candidates are available.
    // EE: Tagastab soovitatud laua ID või nulli, kui kandidaate pole.
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
