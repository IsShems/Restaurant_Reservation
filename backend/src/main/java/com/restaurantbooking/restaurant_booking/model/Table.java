package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * JPA entity representing a restaurant table.
 * Uses Jakarta Persistence annotations so it works with Spring Boot 4.
 */
@Entity
@jakarta.persistence.Table(name = "restaurant_table")
public class Table {

    // Primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Number of seats at the table
    private int capacity;

    // Zone of the restaurant (e.g., "patio", "main", "balcony")
    private String zone;

    // Whether the table is next to a window
    private boolean hasWindow;

    // Whether the table is currently occupied / reserved
    private boolean occupied;

    // Default constructor required by JPA
    public Table() {
    }

    // Convenience constructor for seeding and tests (id is omitted)
    public Table(int capacity, String zone, boolean window, boolean occupied) {
        this.capacity = capacity;
        this.zone = zone;
        this.hasWindow = window;
        this.occupied = occupied;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public boolean isWindow() {
        return hasWindow;
    }

    public void setWindow(boolean window) {
        this.hasWindow = window;
    }

    public boolean isOccupied() {
        return occupied;
    }

    public void setOccupied(boolean occupied) {
        this.occupied = occupied;
    }
}
