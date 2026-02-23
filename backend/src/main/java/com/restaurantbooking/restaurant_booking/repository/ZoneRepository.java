package com.restaurantbooking.restaurant_booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Zone;

/**
 * Repository for performing CRUD operations on Zone entities.
 */
@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    Zone findByName(String name);
}
