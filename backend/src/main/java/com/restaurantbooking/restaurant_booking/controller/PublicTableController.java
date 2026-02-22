package com.restaurantbooking.restaurant_booking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;

/**
 * Public-facing controller to expose a simple `/tables` endpoint
 * so non-API clients (like the frontend) can fetch tables without
 * using the `/api` prefix. This endpoint returns all tables (including
 * occupied) by calling the repository directly.
 */
@RestController
public class PublicTableController {

    private final TableRepository tableRepository;

    public PublicTableController(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    /**
     * GET /tables
     * Returns all tables, including occupied ones.
     */
    @GetMapping("/tables")
    public List<Table> getTables() {
        return tableRepository.findAll();
    }
}
