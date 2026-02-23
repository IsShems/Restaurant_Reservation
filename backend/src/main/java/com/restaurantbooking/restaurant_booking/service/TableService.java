package com.restaurantbooking.restaurant_booking.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.repository.ZoneRepository;

/**
 * Service layer that encapsulates business logic around restaurant tables and zones.
 */
@Service
public class TableService {

    private final TableRepository tableRepository;
    private final ZoneRepository zoneRepository;

    public TableService(TableRepository tableRepository, ZoneRepository zoneRepository) {
        this.tableRepository = tableRepository;
        this.zoneRepository = zoneRepository;
    }

    /**
     * Returns all available (not occupied) tables.
     * Optionally filters by zone name if provided.
     */
    public List<Table> getAvailableTables(String zoneName) {
        if (zoneName == null || zoneName.isBlank()) {
            return tableRepository.findByOccupiedFalse();
        }

        // Look up zone by name
        Zone zone = zoneRepository.findByName(zoneName);
        if (zone == null) {
            return List.of(); // No such zone
        }

        return tableRepository.findByZoneIdAndOccupiedFalse(zone.getId());
    }

    /**
     * Get all tables in a specific zone (occupied or not).
     */
    public List<Table> getTablesByZone(Long zoneId) {
        return tableRepository.findByZoneId(zoneId);
    }

    /**
     * Get all tables in a zone by zone name.
     */
    public List<Table> getTablesByZoneName(String zoneName) {
        return tableRepository.findByZoneName(zoneName);
    }
}

