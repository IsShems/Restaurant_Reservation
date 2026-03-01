package com.restaurantbooking.restaurant_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Zone;

// EN: Data-access repository for zone entities.
// EE: Andmepääsu repositoorium tsooni olemite jaoks.
@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    // EN: Finds one zone by its unique name.
    // EE: Leiab ühe tsooni selle unikaalse nime järgi.
    Zone findByName(String name);
}
