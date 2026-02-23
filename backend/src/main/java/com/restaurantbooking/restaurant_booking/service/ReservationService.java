package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Reservation;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing reservations with conflict detection.
 */
@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    /**
     * Check if a table is available for the given time slot.
     * A table is NOT available if:
     * requestedStart < existingReservationEnd AND requestedEnd > existingReservationStart
     */
    public boolean isTableAvailable(Table table, LocalDateTime startTime, LocalDateTime endTime) {
        List<Reservation> existingReservations = reservationRepository.findByTableId(table.getId());
        
        for (Reservation existing : existingReservations) {
            // Check for time conflict
            if (startTime.isBefore(existing.getDatetimeEnd()) && 
                endTime.isAfter(existing.getDatetimeStart())) {
                return false; // Conflict found
            }
        }
        return true; // No conflicts
    }

    /**
     * Create a new reservation for a table.
     */
    public Reservation createReservation(Table table, LocalDateTime startTime, 
                                        LocalDateTime endTime, Integer guestCount) {
        if (!isTableAvailable(table, startTime, endTime)) {
            throw new IllegalArgumentException("Table is not available for the requested time slot");
        }

        Reservation reservation = new Reservation();
        reservation.setTable(table);
        reservation.setDatetimeStart(startTime);
        reservation.setDatetimeEnd(endTime);
        reservation.setGuestCount(guestCount);
        
        return reservationRepository.save(reservation);
    }

    /**
     * Get all reservations for a specific table.
     */
    public List<Reservation> getReservationsByTable(Long tableId) {
        return reservationRepository.findByTableId(tableId);
    }

    /**
     * Delete a reservation.
     */
    public void cancelReservation(Long reservationId) {
        reservationRepository.deleteById(reservationId);
    }
}
