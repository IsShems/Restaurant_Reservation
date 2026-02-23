package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;

/**
 * Reservation entity representing a table reservation by guests.
 */
@Entity
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The table being reserved
    @ManyToOne
    @JoinColumn(name = "table_id", nullable = false)
    private Table table;

    // Start date and time of the reservation
    private LocalDateTime datetimeStart;

    // End date and time of the reservation
    private LocalDateTime datetimeEnd;

    // Number of guests for this reservation
    private Integer guestCount;

    // Guest preferences for this reservation (ElementCollection with enum values)
    @ElementCollection
    @CollectionTable(name = "reservation_preferences", joinColumns = @JoinColumn(name = "reservation_id"))
    @Enumerated(EnumType.STRING)
    private Set<Preference> preferences = new HashSet<>();

    // Default constructor required by JPA
    public Reservation() {
    }

    // Constructor for creating a reservation
    public Reservation(Table table, LocalDateTime datetimeStart, LocalDateTime datetimeEnd, Integer guestCount) {
        this.table = table;
        this.datetimeStart = datetimeStart;
        this.datetimeEnd = datetimeEnd;
        this.guestCount = guestCount;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Table getTable() {
        return table;
    }

    public void setTable(Table table) {
        this.table = table;
    }

    public LocalDateTime getDatetimeStart() {
        return datetimeStart;
    }

    public void setDatetimeStart(LocalDateTime datetimeStart) {
        this.datetimeStart = datetimeStart;
    }

    public LocalDateTime getDatetimeEnd() {
        return datetimeEnd;
    }

    public void setDatetimeEnd(LocalDateTime datetimeEnd) {
        this.datetimeEnd = datetimeEnd;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public Set<Preference> getPreferences() {
        return preferences;
    }

    public void setPreferences(Set<Preference> preferences) {
        this.preferences = preferences;
    }
}
