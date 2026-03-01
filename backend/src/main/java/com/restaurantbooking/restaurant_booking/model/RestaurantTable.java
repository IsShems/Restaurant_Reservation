package com.restaurantbooking.restaurant_booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_tables") 
// EN: Legacy/minimal table entity kept for compatibility with earlier schema experiments.
// EE: Pärand/minimaalne laua olem, mida hoitakse varasemate skeemikatsete ühilduvuse jaoks.
public class RestaurantTable {       
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int seats;
    private String zone;

    
}