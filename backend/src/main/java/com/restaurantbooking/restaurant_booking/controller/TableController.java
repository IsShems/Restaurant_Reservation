package com.restaurantbooking.restaurant_booking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.service.TableService;

// EN: Provides API endpoints for table availability queries.
// EE: Pakub API otspunkte laudade saadavuse päringuteks.
@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    // EN: Returns available tables, optionally narrowed by zone.
    // EE: Tagastab vabad lauad, vajadusel tsooni järgi kitsendatult.
    @GetMapping("/available")
    public List<Table> getAvailableTables(@RequestParam(name = "zone", required = false) String zone) {
        return tableService.getAvailableTables(zone);
    }
}
