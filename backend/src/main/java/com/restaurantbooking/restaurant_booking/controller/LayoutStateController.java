package com.restaurantbooking.restaurant_booking.controller;

import com.restaurantbooking.restaurant_booking.service.LayoutStateService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/layout")
// EN: Exposes read access to current layout-state flags for frontend synchronization.
// EE: Pakub frontendi sünkroonimiseks ligipääsu paigutuse olekulippudele.
public class LayoutStateController {

    private final LayoutStateService layoutStateService;

    public LayoutStateController(LayoutStateService layoutStateService) {
        this.layoutStateService = layoutStateService;
    }

    // EN: Returns whether admin-defined layout is currently active.
    // EE: Tagastab, kas admini määratud paigutus on hetkel aktiivne.
    @GetMapping("/state")
    public Map<String, Object> getLayoutState() {
        return Map.of("adminLayoutActive", layoutStateService.isAdminLayoutActive());
    }
}
