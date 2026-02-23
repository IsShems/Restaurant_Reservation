package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.util.Set;
import java.util.HashSet;

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

    // Name/identifier for the table (e.g., "Table 1", "Corner Booth 5")
    private String name;

    // Number of seats at the table
    private int capacity;

    // Zone relationship - each table belongs to a zone
    @ManyToOne
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    // X position on the restaurant floor plan
    private Integer positionX;

    // Y position on the restaurant floor plan
    private Integer positionY;

    // Features this table has (ElementCollection with enum values)
    @ElementCollection
    @CollectionTable(name = "table_features", joinColumns = @JoinColumn(name = "table_id"))
    @Enumerated(EnumType.STRING)
    private Set<Feature> features = new HashSet<>();

    // Whether the table is currently occupied / reserved
    private boolean occupied;

    // Default constructor required by JPA
    public Table() {
    }

    // Constructor for seeding basic table data
    public Table(String name, int capacity, Zone zone, Integer positionX, Integer positionY, boolean occupied) {
        this.name = name;
        this.capacity = capacity;
        this.zone = zone;
        this.positionX = positionX;
        this.positionY = positionY;
        this.occupied = occupied;
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

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public Zone getZone() {
        return zone;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }

    public Integer getPositionX() {
        return positionX;
    }

    public void setPositionX(Integer positionX) {
        this.positionX = positionX;
    }

    public Integer getPositionY() {
        return positionY;
    }

    public void setPositionY(Integer positionY) {
        this.positionY = positionY;
    }

    public Set<Feature> getFeatures() {
        return features;
    }

    public void setFeatures(Set<Feature> features) {
        this.features = features;
    }

    public boolean isOccupied() {
        return occupied;
    }

    public void setOccupied(boolean occupied) {
        this.occupied = occupied;
    }
}
