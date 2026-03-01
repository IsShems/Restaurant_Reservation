package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Feature;
import com.restaurantbooking.restaurant_booking.model.Preference;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RecommendationServiceTest {

    @Test
    void calculateScore_appliesPenaltyPreferenceAndZoneBonuses() {
        Table table = buildTable(1L, 8, "PATIO", Set.of(Feature.WINDOW, Feature.KIDS_ZONE));

        int score = RecommendationService.calculateScore(
            table,
            4,
            "PATIO",
            Set.of(Preference.NEAR_WINDOW, Preference.NEAR_KIDS_ZONE)
        );

        assertEquals(105, score);
    }

    @Test
    void findRecommendedTableId_prefersCapacityCloserToGuestCount() {
        Table smallMatch = buildTable(10L, 2, "MAIN_HALL", Set.of());
        Table oversized = buildTable(20L, 10, "MAIN_HALL", Set.of());

        Long recommended = RecommendationService.findRecommendedTableId(
            List.of(smallMatch, oversized),
            2,
            null,
            Set.of()
        );

        assertEquals(10L, recommended);
    }

    private Table buildTable(Long id, int capacity, String zoneName, Set<Feature> features) {
        Zone zone = new Zone(zoneName);
        zone.setId(99L);

        Table table = new Table();
        table.setId(id);
        table.setName("Table " + id);
        table.setCapacity(capacity);
        table.setZone(zone);
        table.setFeatures(features);
        table.setOccupied(false);
        return table;
    }
}
