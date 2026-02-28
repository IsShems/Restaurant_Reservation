package com.restaurantbooking.restaurant_booking.controller;

import com.restaurantbooking.restaurant_booking.model.Reservation;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Preference;
import com.restaurantbooking.restaurant_booking.service.TableService;
import com.restaurantbooking.restaurant_booking.service.ReservationService;
import com.restaurantbooking.restaurant_booking.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller for advanced table search with recommendations.
 */
@RestController
@RequestMapping("/api")
public class SearchController {

    @Autowired
    private TableService tableService;

    @Autowired
    private ReservationService reservationService;

    /**
     * Search for available tables with smart recommendation.
     * Query parameters:
     * - date: YYYY-MM-DD
     * - startTime: HH:mm
     * - endTime: HH:mm
     * - guestCount: integer
     * - zone: string (optional)
     * - preferences: comma-separated (NEAR_WINDOW, PRIVATE_CORNER, NEAR_KIDS_ZONE)
     */
    @GetMapping("/search")
    public Map<String, Object> searchTables(
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam Integer guestCount,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String preferences) {

        try {
            // Parse date and time
            LocalDate localDate = LocalDate.parse(date);
            LocalTime start = LocalTime.parse(startTime);
            
            LocalDateTime startDateTime = LocalDateTime.of(localDate, start);
            LocalDateTime endDateTime = startDateTime.plusHours(2);

            // Parse preferences
            Set<Preference> preferenceSet = parsePreferences(preferences);

            // Get available tables
            List<Table> availableTables = tableService.getAvailableTables(
                startDateTime, endDateTime, guestCount, zone, preferenceSet);

                Set<Long> unavailableIds = reservationService.getUnavailableTableIdsForSlot(startDateTime, endDateTime);
                availableTables = availableTables.stream()
                    .filter(table -> !unavailableIds.contains(table.getId()))
                    .collect(Collectors.toList());

            // Find recommended table
            Long recommendedTableId = RecommendationService.findRecommendedTableId(
                availableTables, guestCount, zone, preferenceSet);

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("availableTables", availableTables);
            response.put("occupiedTableIds", unavailableIds);
            response.put("recommendedTableId", recommendedTableId);
            response.put("totalAvailable", availableTables.size());

            return response;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid search parameters: " + e.getMessage());
            return error;
        }
    }

    /**
     * Create a new reservation.
     */
    @PostMapping("/reservations")
    public Map<String, Object> createReservation(@RequestBody ReservationRequest request) {
        try {
            LocalDate localDate = LocalDate.parse(request.getDate());
            LocalTime start = LocalTime.parse(request.getStartTime());
            
            LocalDateTime startDateTime = LocalDateTime.of(localDate, start);

            Reservation reservation = reservationService.createReservation(
                request.getTable(),
                startDateTime,
                startDateTime.plusHours(2),
                request.getGuestCount());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reservation", reservation);
            response.put("message", "Reservation created successfully");
            return response;
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return error;
        }
    }

    /**
     * Parse preference string into Set of Preference enums.
     */
    private Set<Preference> parsePreferences(String preferencesStr) {
        Set<Preference> preferences = new HashSet<>();
        if (preferencesStr != null && !preferencesStr.isBlank()) {
            String[] parts = preferencesStr.split(",");
            for (String part : parts) {
                try {
                    preferences.add(Preference.valueOf(part.trim()));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid preference
                }
            }
        }
        return preferences;
    }

    /**
     * DTO for reservation creation request.
     */
    public static class ReservationRequest {
        private Table table;
        private String date;
        private String startTime;
        private String endTime;
        private Integer guestCount;

        // Getters and Setters
        public Table getTable() { return table; }
        public void setTable(Table table) { this.table = table; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }

        public Integer getGuestCount() { return guestCount; }
        public void setGuestCount(Integer guestCount) { this.guestCount = guestCount; }
    }
}
