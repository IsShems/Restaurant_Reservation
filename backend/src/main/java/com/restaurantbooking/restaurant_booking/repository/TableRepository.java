package com.restaurantbooking.restaurant_booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurantbooking.restaurant_booking.model.Table;

/**
 * Repository for performing CRUD and query operations on Table entities.
 */
@Repository
public interface TableRepository extends JpaRepository<Table, Long> {

    /**
     * Find all tables that are not occupied (available).
     */
    List<Table> findByOccupiedFalse();

    /**
     * Find available tables filtered by zone.
     */
    List<Table> findByZoneAndOccupiedFalse(String zone);
}
