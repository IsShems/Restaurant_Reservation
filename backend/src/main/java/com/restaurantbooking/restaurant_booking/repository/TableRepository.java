package com.restaurantbooking.restaurant_booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Table;

// EN: Data-access repository for table entities and availability-related lookups.
// EE: Andmepääsu repositoorium laua olemite ja saadavusega seotud päringute jaoks.
@Repository
public interface TableRepository extends JpaRepository<Table, Long> {

    // EN: Returns all tables currently marked as not occupied.
    // EE: Tagastab kõik lauad, mis on märgitud hõivamata.
    List<Table> findByOccupiedFalse();

    // EN: Returns not-occupied tables for a specific zone ID.
    // EE: Tagastab konkreetse tsooni hõivamata lauad.
    List<Table> findByZoneIdAndOccupiedFalse(Long zoneId);

    // EN: Returns all tables in a specific zone.
    // EE: Tagastab kõik kindla tsooni lauad.
    List<Table> findByZoneId(Long zoneId);

    // EN: Returns tables by zone name.
    // EE: Tagastab lauad tsooninime alusel.
    List<Table> findByZoneName(String zoneName);
}
