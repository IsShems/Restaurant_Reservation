package com.restaurantbooking.restaurant_booking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.service.TableService;

/**
 * REST controller exposing table-related endpoints.
 */
@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    /**
     * GET /api/tables/available
     * Returns all available tables. Optional query parameter `zone` filters results.
     */
    @GetMapping("/available")
    public List<Table> getAvailableTables(@RequestParam(name = "zone", required = false) String zone) {
        return tableService.getAvailableTables(zone);
    }
}
