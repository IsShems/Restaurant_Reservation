package com.restaurantbooking.restaurant_booking.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

@Service
public class AdminAuthService {

    private final AtomicReference<String> activePassword;

    public AdminAuthService(@Value("${admin.password}") String initialPassword) {
        if (initialPassword == null || initialPassword.isBlank()) {
            throw new IllegalStateException("admin.password must be configured");
        }
        this.activePassword = new AtomicReference<>(initialPassword);
    }

    public boolean verifyPassword(String password) {
        return password != null && password.equals(activePassword.get());
    }

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
