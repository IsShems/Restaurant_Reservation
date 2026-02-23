package com.restaurantbooking.restaurant_booking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import com.restaurantbooking.restaurant_booking.model.Feature;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.repository.ZoneRepository;
import java.util.HashSet;
import java.util.Set;

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
	 * Seed sample zone and table data on startup so the database is populated
	 * with realistic restaurant layout data for testing.
	 */
	@Bean
	public CommandLineRunner seedData(ZoneRepository zoneRepository, TableRepository tableRepository) {
		return args -> {
			// Create zones
			Zone mainZone = zoneRepository.save(new Zone("main"));
			Zone patioZone = zoneRepository.save(new Zone("patio"));
			Zone balconyZone = zoneRepository.save(new Zone("balcony"));
			Zone privateZone = zoneRepository.save(new Zone("private_room"));

			// Add tables to zones with positions and features
			Table table1 = new Table("Table 1", 2, mainZone, 100, 50, false);
			Set<Feature> features1 = new HashSet<>();
			features1.add(Feature.WINDOW);
			table1.setFeatures(features1);
			tableRepository.save(table1);

			Table table2 = new Table("Table 2", 4, mainZone, 150, 100, false);
			tableRepository.save(table2);

			Table table3 = new Table("Patio Table 1", 6, patioZone, 250, 200, false);
			Set<Feature> features3 = new HashSet<>();
			features3.add(Feature.WINDOW);
			features3.add(Feature.PRIVATE_AREA);
			table3.setFeatures(features3);
			tableRepository.save(table3);

			Table table4 = new Table("Balcony Corner", 2, balconyZone, 300, 150, false);
			Set<Feature> features4 = new HashSet<>();
			features4.add(Feature.PRIVATE_AREA);
			table4.setFeatures(features4);
			tableRepository.save(table4);

			Table table5 = new Table("Large Table", 8, mainZone, 200, 250, false);
			tableRepository.save(table5);

			Table table6 = new Table("Kids Zone Table", 4, patioZone, 100, 300, false);
			Set<Feature> features6 = new HashSet<>();
			features6.add(Feature.KIDS_ZONE);
			table6.setFeatures(features6);
			tableRepository.save(table6);

			Table table7 = new Table("Private Room Table", 10, privateZone, 400, 100, false);
			Set<Feature> features7 = new HashSet<>();
			features7.add(Feature.PRIVATE_AREA);
			table7.setFeatures(features7);
			tableRepository.save(table7);
		};
	}

}
