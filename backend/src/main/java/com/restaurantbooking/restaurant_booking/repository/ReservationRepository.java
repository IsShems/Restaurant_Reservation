package com.restaurantbooking.restaurant_booking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Reservation;

/**
 * Repository for performing CRUD and query operations on Reservation entities.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Find all reservations for a specific table.
     */
    List<Reservation> findByTableId(Long tableId);

    /**
     * Find reservations that overlap with a given time range for a specific table.
     * This helps detect table availability conflicts.
     */
    List<Reservation> findByTableIdAndDatetimeStartLessThanAndDatetimeEndGreaterThan(
        Long tableId, LocalDateTime endTime, LocalDateTime startTime);

    /**
     * Find all reservations that overlap with a given time range.
     */
    List<Reservation> findByDatetimeStartLessThanAndDatetimeEndGreaterThan(
        LocalDateTime endTime, LocalDateTime startTime);
}
