package com.restaurantbooking.restaurant_booking.service;

import com.restaurantbooking.restaurant_booking.model.LayoutState;
import com.restaurantbooking.restaurant_booking.repository.LayoutStateRepository;
import org.springframework.stereotype.Service;

@Service
// EN: Stores and serves a single persisted flag indicating whether admin layout is active.
// EE: Salvestab ja tagastab ühe püsiva lipu, mis näitab kas admini paigutus on aktiivne.
public class LayoutStateService {

    private static final Long LAYOUT_STATE_ID = 1L;

    private final LayoutStateRepository layoutStateRepository;

    public LayoutStateService(LayoutStateRepository layoutStateRepository) {
        this.layoutStateRepository = layoutStateRepository;
    }

    // EN: Returns current admin layout activation state.
    // EE: Tagastab admini paigutuse aktiivsuse hetkeseisu.
    public boolean isAdminLayoutActive() {
        return getOrCreateState().isAdminLayoutActive();
    }

    // EN: Updates the persisted admin layout activation state.
    // EE: Uuendab püsivat admini paigutuse aktiivsuse seisu.
    public void setAdminLayoutActive(boolean active) {
        LayoutState state = getOrCreateState();
        state.setAdminLayoutActive(active);
        layoutStateRepository.save(state);
    }

    // EN: Loads the singleton layout-state record or creates a default one when missing.
    // EE: Laeb paigutuse oleku singleton-kirje või loob puudumisel vaikimisi kirje.
    private LayoutState getOrCreateState() {
        return layoutStateRepository.findById(LAYOUT_STATE_ID)
            .orElseGet(() -> layoutStateRepository.save(new LayoutState(LAYOUT_STATE_ID, false)));
    }
}
