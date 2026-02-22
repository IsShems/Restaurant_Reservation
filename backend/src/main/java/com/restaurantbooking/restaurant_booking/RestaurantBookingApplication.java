package com.restaurantbooking.restaurant_booking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;

/**
 * Main Spring Boot application entry point.
 * Also contains a CommandLineRunner to seed sample data at startup for testing.
 */
@SpringBootApplication
public class RestaurantBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestaurantBookingApplication.class, args);
	}

	/**
	 * Seed some sample table data on startup so the /api/tables/available endpoint
	 * returns data when running with an in-memory H2 database.
	 */
	@Bean
	public CommandLineRunner seedData(TableRepository tableRepository) {
		return args -> {
			tableRepository.save(new Table(2, "main", true, false));
			tableRepository.save(new Table(4, "main", false, false));
			tableRepository.save(new Table(6, "patio", false, true));
			tableRepository.save(new Table(2, "balcony", true, false));
			tableRepository.save(new Table(8, "main", false, false));
		};
	}

}
