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

// EN: Exposes search and reservation endpoints used by the frontend booking flow.
// EE: Pakub otsingu- ja broneerimisotspunkte, mida kasutab frontend broneerimisvoog.
@RestController
@RequestMapping("/api")
public class SearchController {

    @Autowired
    private TableService tableService;

    @Autowired
    private ReservationService reservationService;

    // EN: Searches available tables for the requested slot and returns recommendation metadata.
    // EE: Otsib soovitud ajale saadaolevaid laudu ja tagastab soovituse metaandmed.
    // EN: Inputs come from query params; output includes available tables, occupied IDs, and recommended table ID.
    // EE: Sisend tuleb päringuparameetritest; väljund sisaldab vabu laudu, hõivatud ID-sid ja soovitatud laua ID-d.
    @GetMapping("/search")
    public Map<String, Object> searchTables(
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam Integer guestCount,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String preferences) {

        try {
            // EN: Normalize request date/time into a backend time window.
            // EE: Normaliseeri päringu kuupäev/kellaaeg backendi ajavahemikuks.
            LocalDate localDate = LocalDate.parse(date);
            LocalTime start = LocalTime.parse(startTime);
            
            LocalDateTime startDateTime = LocalDateTime.of(localDate, start);
            LocalDateTime endDateTime = startDateTime.plusHours(2);

            // EN: Convert raw preference tokens to enum values and ignore unknown values.
            // EE: Teisenda eelistuse tokenid enum-väärtusteks ja ignoreeri tundmatuid väärtusi.
            Set<Preference> preferenceSet = parsePreferences(preferences);

            // EN: Fetch candidates, then remove unavailable IDs for the exact slot.
            // EE: Too kandidaadid ning eemalda täpse ajavahemiku hõivatud lauad.
            List<Table> availableTables = tableService.getAvailableTables(
                startDateTime, endDateTime, guestCount, zone, preferenceSet);

                Set<Long> unavailableIds = reservationService.getUnavailableTableIdsForSlot(startDateTime, endDateTime);
                availableTables = availableTables.stream()
                    .filter(table -> !unavailableIds.contains(table.getId()))
                    .collect(Collectors.toList());

            // EN: Score and select the best-fitting table from remaining candidates.
            // EE: Hinda ja vali järelejäänud kandidaatide seast parima sobivusega laud.
            Long recommendedTableId = RecommendationService.findRecommendedTableId(
                availableTables, guestCount, zone, preferenceSet);

            // EN: Build a UI-friendly response payload.
            // EE: Koosta kasutajaliidesele sobiv vastusepayload.
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

    // EN: Creates a reservation for the selected table and requested guest count.
    // EE: Loob broneeringu valitud lauale ja soovitud külaliste arvule.
    // EN: Returns success flag and reservation payload, or an error message.
    // EE: Tagastab edu-lipu ja broneeringu payloadi või veateate.
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

    // EN: Parses comma-separated preference values into enum set.
    // EE: Parsib komaga eraldatud eelistused enum-kogumiks.
    // EN: Invalid tokens are ignored to keep the search request tolerant.
    // EE: Vigased tokenid ignoreeritakse, et otsingupäring jääks veataluvaks.
    private Set<Preference> parsePreferences(String preferencesStr) {
        Set<Preference> preferences = new HashSet<>();
        if (preferencesStr != null && !preferencesStr.isBlank()) {
            String[] parts = preferencesStr.split(",");
            for (String part : parts) {
                try {
                    preferences.add(Preference.valueOf(part.trim()));
                } catch (IllegalArgumentException e) {
                    // EN: Skip invalid preference values instead of failing the whole request.
                    // EE: Jäta vigased eelistused vahele, mitte ära nurja kogu päringut.
                }
            }
        }
        return preferences;
    }

    // EN: DTO representing reservation creation input payload.
    // EE: DTO, mis kirjeldab broneeringu loomise sisendpayloadi.
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
