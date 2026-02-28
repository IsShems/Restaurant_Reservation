package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Reservation;
import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.ReservationRepository;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing reservations with conflict detection.
 */
@Service
public class ReservationService {

    private static final int AUTO_EXPIRE_HOURS = 2;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

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
        LocalDateTime normalizedEndTime = startTime.plusHours(AUTO_EXPIRE_HOURS);

        if (!isTableAvailable(table, startTime, normalizedEndTime)) {
            throw new IllegalArgumentException("Table is not available for the requested time slot");
        }

        Reservation reservation = new Reservation();
        reservation.setTable(table);
        reservation.setDatetimeStart(startTime);
        reservation.setDatetimeEnd(normalizedEndTime);
        reservation.setGuestCount(guestCount);
        
        return reservationRepository.save(reservation);
    }

    /**
     * Returns unavailable table IDs for a slot.
     * If real reservations exist, returns only real occupied table IDs.
     * If no real reservations exist, returns 1-2 random table IDs for request-scoped testing.
     * Random test occupancy is never persisted to the database.
     */
    public Set<Long> getUnavailableTableIdsForSlot(LocalDateTime startTime, LocalDateTime endTime) {
        Set<Long> realOccupied = reservationRepository
            .findByDatetimeStartLessThanAndDatetimeEndGreaterThan(endTime, startTime)
            .stream()
            .map(reservation -> reservation.getTable().getId())
            .collect(Collectors.toSet());

        if (!realOccupied.isEmpty()) {
            return realOccupied;
        }

        List<Long> allTableIds = tableRepository.findAll().stream()
            .map(Table::getId)
            .collect(Collectors.toList());

        if (allTableIds.isEmpty()) {
            return realOccupied;
        }

        Random random = new Random();
        List<Long> shuffled = new ArrayList<>(allTableIds);
        Collections.shuffle(shuffled, random);

        int randomCount = Math.min(shuffled.size(), 1 + random.nextInt(2));
        return shuffled.subList(0, randomCount).stream().collect(Collectors.toSet());
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
