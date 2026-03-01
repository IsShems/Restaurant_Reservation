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

// EN: Manages reservation lifecycle and time-slot conflict validation.
// EE: Haldab broneeringute elutsüklit ja ajavahemike konfliktide kontrolli.
@Service
public class ReservationService {

    private static final int AUTO_EXPIRE_HOURS = 2;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TableRepository tableRepository;

    // EN: Checks whether a table is free for the requested time window.
    // EE: Kontrollib, kas laud on soovitud ajavahemikus vaba.
    // EN: Returns false if any existing reservation overlaps the requested interval.
    // EE: Tagastab false, kui mõni olemasolev broneering kattub küsitud vahemikuga.
    public boolean isTableAvailable(Table table, LocalDateTime startTime, LocalDateTime endTime) {
        List<Reservation> existingReservations = reservationRepository.findByTableId(table.getId());
        
        for (Reservation existing : existingReservations) {
            // EN: Overlap rule: [start, end) intersects when start < existingEnd and end > existingStart.
            // EE: Kattuvuse reegel: [algus, lõpp) lõikub, kui algus < olemasolevLõpp ja lõpp > olemasolevAlgus.
            if (startTime.isBefore(existing.getDatetimeEnd()) && 
                endTime.isAfter(existing.getDatetimeStart())) {
                return false; // Conflict found
            }
        }
        return true; // No conflicts
    }

    // EN: Creates a reservation after availability validation and end-time normalization.
    // EE: Loob broneeringu pärast saadavuse kontrolli ja lõppaja normaliseerimist.
    // EN: Input endTime is ignored in favor of a fixed auto-expire duration.
    // EE: Sisend-lõppaega ei kasutata; rakendatakse fikseeritud automaatne kehtivusaeg.
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

    // EN: Returns table IDs unavailable for the requested slot.
    // EE: Tagastab soovitud ajavahemikus hõivatud laudade ID-d.
    // EN: Uses real overlaps first; when none exist, returns a temporary random subset for testing UX.
    // EE: Kasutab esmalt päris kattuvaid broneeringuid; nende puudumisel tagastab UX testimiseks ajutise juhuvalimi.
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

    // EN: Fetches all reservations linked to one table.
    // EE: Toob kõik ühe lauaga seotud broneeringud.
    public List<Reservation> getReservationsByTable(Long tableId) {
        return reservationRepository.findByTableId(tableId);
    }

    // EN: Deletes a reservation by identifier.
    // EE: Kustutab broneeringu identifikaatori alusel.
    public void cancelReservation(Long reservationId) {
        reservationRepository.deleteById(reservationId);
    }
}
