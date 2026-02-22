package com.restaurantbooking.restaurant_booking.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;

/**
 * Service layer that encapsulates business logic around restaurant tables.
 */
@Service
public class TableService {

    private final TableRepository tableRepository;

    public TableService(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    /**
     * Returns all available (not occupied) tables. If zone is provided,
     * it filters available tables by the given zone.
     */
    public List<Table> getAvailableTables(String zone) {
        if (zone == null || zone.isBlank()) {
            return tableRepository.findByOccupiedFalse();
        }
        return tableRepository.findByZoneAndOccupiedFalse(zone);
    }
}
