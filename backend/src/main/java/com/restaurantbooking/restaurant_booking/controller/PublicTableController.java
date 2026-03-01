package com.restaurantbooking.restaurant_booking.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;

// EN: Exposes a public `/tables` endpoint for simple frontend table loading.
// EE: Pakub avaliku `/tables` otspunkti, et frontend saaks lauad lihtsalt laadida.
@RestController
public class PublicTableController {

    private final TableRepository tableRepository;

    public PublicTableController(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    // EN: Returns all tables, including occupied ones, without API-prefix authentication flow.
    // EE: Tagastab kõik lauad (sh hõivatud) ilma API-prefiksi autentimisvoota.
    @GetMapping("/tables")
    public List<Table> getTables() {
        return tableRepository.findAll();
    }
}
