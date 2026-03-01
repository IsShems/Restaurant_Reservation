package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.LayoutState;
import com.restaurantbooking.restaurant_booking.repository.LayoutStateRepository;
import org.springframework.stereotype.Service;

@Service
public class LayoutStateService {

    private static final Long LAYOUT_STATE_ID = 1L;

    private final LayoutStateRepository layoutStateRepository;

    public LayoutStateService(LayoutStateRepository layoutStateRepository) {
        this.layoutStateRepository = layoutStateRepository;
    }

    public boolean isAdminLayoutActive() {
        return getOrCreateState().isAdminLayoutActive();
    }

    public void setAdminLayoutActive(boolean active) {
        LayoutState state = getOrCreateState();
        state.setAdminLayoutActive(active);
        layoutStateRepository.save(state);
    }

    private LayoutState getOrCreateState() {
        return layoutStateRepository.findById(LAYOUT_STATE_ID)
            .orElseGet(() -> layoutStateRepository.save(new LayoutState(LAYOUT_STATE_ID, false)));
    }
}
