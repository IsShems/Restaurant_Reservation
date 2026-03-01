package com.restaurantbooking.restaurant_booking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

@Service
// EN: Handles in-memory admin password verification and rotation.
// EE: Haldab mälus olevat admini parooli kontrolli ja vahetust.
public class AdminAuthService {

    private final AtomicReference<String> activePassword;

    // EN: Initializes the active admin password from configuration.
    // EE: Initsialiseerib aktiivse admini parooli konfiguratsioonist.
    public AdminAuthService(@Value("${admin.password}") String initialPassword) {
        if (initialPassword == null || initialPassword.isBlank()) {
            throw new IllegalStateException("admin.password must be configured");
        }
        this.activePassword = new AtomicReference<>(initialPassword);
    }

    // EN: Validates the provided password against the current active password.
    // EE: Kontrollib antud parooli aktiivse parooli vastu.
    public boolean verifyPassword(String password) {
        return password != null && password.equals(activePassword.get());
    }

    // EN: Changes the password atomically when current password matches and new password is valid.
    // EE: Vahetab parooli atomaarset, kui praegune parool klapib ja uus parool on korrektne.
    public boolean changePassword(String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.isBlank() || newPassword.length() < 8) {
            return false;
        }

        while (true) {
            String existing = activePassword.get();
            if (!existing.equals(currentPassword)) {
                return false;
            }
            if (activePassword.compareAndSet(existing, newPassword)) {
                return true;
            }
        }
    }
}
