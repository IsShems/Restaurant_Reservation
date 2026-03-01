package com.restaurantbooking.restaurant_booking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Reservation;

// EN: Data-access repository for reservation entities and overlap queries.
// EE: Andmepääsu repositoorium broneeringu olemite ja kattuvuspäringute jaoks.
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // EN: Returns all reservations for one table.
    // EE: Tagastab kõik ühe laua broneeringud.
    List<Reservation> findByTableId(Long tableId);

    // EN: Returns reservations overlapping a time window for a specific table.
    // EE: Tagastab kindla laua broneeringud, mis kattuvad ajavahemikuga.
    List<Reservation> findByTableIdAndDatetimeStartLessThanAndDatetimeEndGreaterThan(
        Long tableId, LocalDateTime endTime, LocalDateTime startTime);

    // EN: Returns all reservations overlapping a time window.
    // EE: Tagastab kõik broneeringud, mis kattuvad ajavahemikuga.
    List<Reservation> findByDatetimeStartLessThanAndDatetimeEndGreaterThan(
        LocalDateTime endTime, LocalDateTime startTime);
}
