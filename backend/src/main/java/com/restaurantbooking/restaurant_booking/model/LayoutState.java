package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class LayoutState {

    @Id
    private Long id;

    private boolean adminLayoutActive;

    public LayoutState() {
    }

    public LayoutState(Long id, boolean adminLayoutActive) {
        this.id = id;
        this.adminLayoutActive = adminLayoutActive;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isAdminLayoutActive() {
        return adminLayoutActive;
    }

    public void setAdminLayoutActive(boolean adminLayoutActive) {
        this.adminLayoutActive = adminLayoutActive;
    }
}
