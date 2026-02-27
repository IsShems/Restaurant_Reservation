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
			// Main Hall tables
			Table table1 = new Table("Table 1", 2, mainZone, 100, 50, false);
			Set<Feature> features1 = new HashSet<>();
			features1.add(Feature.WINDOW);
			table1.setFeatures(features1);
			tableRepository.save(table1);

			Table table2 = new Table("Table 2", 4, mainZone, 150, 100, false);
			tableRepository.save(table2);

			Table table3 = new Table("Table 3", 4, mainZone, 200, 50, false);
			tableRepository.save(table3);

			Table table4 = new Table("Table 4", 2, mainZone, 250, 100, false);
			Set<Feature> features4 = new HashSet<>();
			features4.add(Feature.WINDOW);
			table4.setFeatures(features4);
			tableRepository.save(table4);

			Table table5 = new Table("Large Table", 8, mainZone, 200, 250, false);
			tableRepository.save(table5);

			Table table6 = new Table("Corner Table", 6, mainZone, 300, 200, false);
			tableRepository.save(table6);

			// Patio tables
			Table table7 = new Table("Patio Table 1", 6, patioZone, 250, 200, false);
			Set<Feature> features7 = new HashSet<>();
			features7.add(Feature.WINDOW);
			table7.setFeatures(features7);
			tableRepository.save(table7);

			Table table8 = new Table("Patio Table 2", 4, patioZone, 100, 300, false);
			tableRepository.save(table8);

			Table table9 = new Table("Kids Zone Table", 4, patioZone, 150, 350, false);
			Set<Feature> features9 = new HashSet<>();
			features9.add(Feature.KIDS_ZONE);
			table9.setFeatures(features9);
			tableRepository.save(table9);

			Table table10 = new Table("Outdoor Table", 2, patioZone, 200, 300, false);
			tableRepository.save(table10);

			// Balcony tables
			Table table11 = new Table("Balcony Corner", 2, balconyZone, 300, 150, false);
			Set<Feature> features11 = new HashSet<>();
			features11.add(Feature.WINDOW);
			table11.setFeatures(features11);
			tableRepository.save(table11);

			Table table12 = new Table("Balcony View", 4, balconyZone, 350, 100, false);
			Set<Feature> features12 = new HashSet<>();
			features12.add(Feature.WINDOW);
			table12.setFeatures(features12);
			tableRepository.save(table12);

			Table table13 = new Table("Balcony Duo", 2, balconyZone, 400, 150, false);
			tableRepository.save(table13);

			// Private Room tables
			Table table14 = new Table("Private Table 1", 6, privateZone, 400, 100, false);
			Set<Feature> features14 = new HashSet<>();
			features14.add(Feature.PRIVATE_AREA);
			table14.setFeatures(features14);
			tableRepository.save(table14);

			Table table15 = new Table("Private Table 2", 8, privateZone, 450, 150, false);
			Set<Feature> features15 = new HashSet<>();
			features15.add(Feature.PRIVATE_AREA);
			table15.setFeatures(features15);
			tableRepository.save(table15);

			Table table16 = new Table("Private Cozy", 4, privateZone, 430, 80, false);
			Set<Feature> features16 = new HashSet<>();
			features16.add(Feature.PRIVATE_AREA);
			table16.setFeatures(features16);
			tableRepository.save(table16);
		};
	}

}
