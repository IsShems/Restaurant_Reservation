package com.restaurantbooking.restaurant_booking.controller;

import com.restaurantbooking.restaurant_booking.service.LayoutStateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/layout")
public class LayoutStateController {

    private final LayoutStateService layoutStateService;

    public LayoutStateController(LayoutStateService layoutStateService) {
        this.layoutStateService = layoutStateService;
    }

    @GetMapping("/state")
    public Map<String, Object> getLayoutState() {
        return Map.of("adminLayoutActive", layoutStateService.isAdminLayoutActive());
    }
}
