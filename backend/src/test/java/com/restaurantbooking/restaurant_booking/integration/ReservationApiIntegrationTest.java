package com.restaurantbooking.restaurant_booking.integration;

import com.restaurantbooking.restaurant_booking.model.Reservation;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.ReservationRepository;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ReservationApiIntegrationTest {

    @Value("${local.server.port}")
    private int port;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Test
    void createReservation_viaRest_persistsReservation() throws Exception {
        Table table = tableRepository.findAll().stream()
            .filter(t -> t.getCapacity() >= 2)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No table found for test"));

        long beforeCount = reservationRepository.count();

        int guestCount = Math.min(4, table.getCapacity());

        String payload = """
            {
              "table": {
                "id": %d,
                "name": "%s",
                "capacity": %d,
                                "nearWindow": %s,
                                "nearKidsZone": %s,
                                "quietCorner": %s,
                                "occupied": %s,
                "zone": { "id": %d, "name": "%s" },
                "features": []
              },
              "date": "2030-01-01",
              "startTime": "18:00",
              "endTime": "20:00",
              "guestCount": %d
            }
            """.formatted(
            table.getId(),
            table.getName().replace("\"", ""),
            table.getCapacity(),
            table.isNearWindow(),
            table.isNearKidsZone(),
            table.isQuietCorner(),
            table.isOccupied(),
            table.getZone().getId(),
            table.getZone().getName().replace("\"", ""),
            guestCount
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:" + port + "/api/reservations"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(payload))
            .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("\"success\":true"));

        long afterCount = reservationRepository.count();
        assertEquals(beforeCount + 1, afterCount);

        List<Reservation> allReservations = reservationRepository.findAll();
        Reservation created = allReservations.stream()
            .max(java.util.Comparator.comparing(Reservation::getId))
            .orElseThrow(() -> new IllegalStateException("No reservation saved"));

        assertNotNull(created.getTable());
        assertEquals(table.getId(), created.getTable().getId());
        assertEquals(guestCount, created.getGuestCount());
    }
}
