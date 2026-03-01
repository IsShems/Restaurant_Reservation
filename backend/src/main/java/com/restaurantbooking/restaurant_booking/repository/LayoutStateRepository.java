package com.restaurantbooking.restaurant_booking.repository;

import com.restaurantbooking.restaurant_booking.model.LayoutState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// EN: Data-access repository for singleton-like layout-state persistence.
// EE: Andmepääsu repositoorium singleton-laadse paigutuse oleku salvestamiseks.
public interface LayoutStateRepository extends JpaRepository<LayoutState, Long> {
}
