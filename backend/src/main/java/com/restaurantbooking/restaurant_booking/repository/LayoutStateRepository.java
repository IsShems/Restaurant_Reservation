package com.restaurantbooking.restaurant_booking.repository;

import com.restaurantbooking.restaurant_booking.model.LayoutState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LayoutStateRepository extends JpaRepository<LayoutState, Long> {
}
