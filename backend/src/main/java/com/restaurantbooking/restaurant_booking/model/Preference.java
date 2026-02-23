package com.restaurantbooking.restaurant_booking.model;

/**
 * Preference enum representing guest preferences for tables.
 * Used in Reservation.preferences ElementCollection.
 */
public enum Preference {
    PRIVATE_CORNER,   // Guest prefers a private/secluded corner
    NEAR_WINDOW,      // Guest prefers a table near a window
    NEAR_KIDS_ZONE    // Guest prefers to be near the kids zone
}
