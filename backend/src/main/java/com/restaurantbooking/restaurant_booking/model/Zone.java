package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// EN: JPA entity representing a logical restaurant area used for table grouping and filtering.
// EE: JPA olem, mis kirjeldab loogilist restorani ala laudade grupeerimiseks ja filtreerimiseks.
@Entity
public class Zone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the zone (e.g., "main", "patio", "balcony", "private_room")
    private String name;

    // Default constructor required by JPA
    public Zone() {
    }

    // Constructor for seeding
    public Zone(String name) {
        this.name = name;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
