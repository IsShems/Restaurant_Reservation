package com.restaurantbooking.restaurant_booking.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import com.restaurantbooking.restaurant_booking.model.Preference;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.repository.ZoneRepository;

// EN: Encapsulates table availability and zone-based retrieval rules.
// EE: Koondab laudade saadavuse ja tsoonipõhise päringu reeglid.
@Service
public class TableService {

    private final TableRepository tableRepository;
    private final ZoneRepository zoneRepository;
    
    @Autowired
    private ReservationService reservationService;

    public TableService(TableRepository tableRepository, ZoneRepository zoneRepository) {
        this.tableRepository = tableRepository;
        this.zoneRepository = zoneRepository;
    }

    // EN: Returns currently unoccupied tables, optionally filtered by zone name.
    // EE: Tagastab hetkel hõivamata lauad, vajadusel tsooninime järgi filtreeritult.
    public List<Table> getAvailableTables(String zoneName) {
        if (zoneName == null || zoneName.isBlank()) {
            return tableRepository.findByOccupiedFalse();
        }

        // EN: Resolve the zone first to avoid querying with an invalid zone key.
        // EE: Lahenda tsoon esmalt, et vältida päringut vigase tsoonivõtmega.
        Zone zone = zoneRepository.findByName(zoneName);
        if (zone == null) {
            return List.of(); // No such zone
        }

        return tableRepository.findByZoneIdAndOccupiedFalse(zone.getId());
    }

    // EN: Returns tables available for a time slot with optional zone filtering.
    // EE: Tagastab ajavahemikus saadaval olevad lauad koos valikulise tsoonifiltriga.
    // EN: guestCount/preferences are accepted for API consistency but not applied here.
    // EE: guestCount/preferences võetakse vastu API ühtsuse nimel, kuid siin neid ei rakendata.
    public List<Table> getAvailableTables(LocalDateTime startTime, LocalDateTime endTime,
                                         Integer guestCount, String zoneName, 
                                         Set<Preference> preferences) {
        List<Table> allTables = tableRepository.findAll();

        return allTables.stream()
            // EN: Keep predicate order deterministic: zone check first, then expensive reservation check.
            // EE: Hoia tingimuste järjekord kindel: esmalt tsoon, seejärel kulukam broneeringu kontroll.
            .filter(table -> zoneName == null || zoneName.isBlank() || 
                           (table.getZone() != null && 
                            table.getZone().getName().equalsIgnoreCase(zoneName))) // Match zone
            .filter(table -> reservationService.isTableAvailable(table, startTime, endTime)) // Check availability
            .collect(Collectors.toList());
    }

    // EN: Returns all tables in a zone, regardless of occupancy.
    // EE: Tagastab kõik tsooni lauad sõltumata hõivatusest.
    public List<Table> getTablesByZone(Long zoneId) {
        return tableRepository.findByZoneId(zoneId);
    }

    // EN: Returns all tables by zone name.
    // EE: Tagastab kõik lauad tsooninime alusel.
    public List<Table> getTablesByZoneName(String zoneName) {
        return tableRepository.findByZoneName(zoneName);
    }
}

