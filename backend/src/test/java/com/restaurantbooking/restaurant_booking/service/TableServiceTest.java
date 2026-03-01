package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.repository.ZoneRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TableServiceTest {

    @Mock
    private TableRepository tableRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @InjectMocks
    private TableService tableService;

    @Test
    void getAvailableTables_blankZone_returnsAllAvailable() {
        Table table = new Table();
        when(tableRepository.findByOccupiedFalse()).thenReturn(List.of(table));

        List<Table> result = tableService.getAvailableTables("   ");

        assertEquals(1, result.size());
        verify(tableRepository).findByOccupiedFalse();
    }

    @Test
    void getAvailableTables_existingZone_filtersByZone() {
        Zone zone = new Zone("PATIO");
        zone.setId(7L);
        Table table = new Table();

        when(zoneRepository.findByName("PATIO")).thenReturn(zone);
        when(tableRepository.findByZoneIdAndOccupiedFalse(7L)).thenReturn(List.of(table));

        List<Table> result = tableService.getAvailableTables("PATIO");

        assertEquals(1, result.size());
        verify(zoneRepository).findByName("PATIO");
        verify(tableRepository).findByZoneIdAndOccupiedFalse(7L);
    }

    @Test
    void getAvailableTables_unknownZone_returnsEmptyList() {
        when(zoneRepository.findByName("UNKNOWN")).thenReturn(null);

        List<Table> result = tableService.getAvailableTables("UNKNOWN");

        assertTrue(result.isEmpty());
        verify(zoneRepository).findByName("UNKNOWN");
    }
}
