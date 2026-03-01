package com.restaurantbooking.restaurant_booking.controller;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.service.ReservationService;
import com.restaurantbooking.restaurant_booking.service.TableService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchControllerValidationTest {

    @Mock
    private TableService tableService;

    @Mock
    private ReservationService reservationService;

    @InjectMocks
    private SearchController searchController;

    @Test
    void createReservation_returnsError_whenTwoGuestsAttemptTenSeatTable() {
        Table tenSeatTable = new Table();
        tenSeatTable.setId(10L);
        tenSeatTable.setCapacity(10);

        SearchController.ReservationRequest request = new SearchController.ReservationRequest();
        request.setTable(tenSeatTable);
        request.setDate("2030-01-01");
        request.setStartTime("18:00");
        request.setEndTime("20:00");
        request.setGuestCount(2);

        when(reservationService.createReservation(eq(tenSeatTable), any(), any(), eq(2)))
            .thenThrow(new IllegalArgumentException("2 guests cannot book 10-seat table"));

        Map<String, Object> response = searchController.createReservation(request);

        assertEquals(false, response.get("success"));
        assertTrue(String.valueOf(response.get("error")).contains("2 guests cannot book 10-seat table"));
    }
}
