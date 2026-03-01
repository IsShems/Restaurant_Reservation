package com.restaurantbooking.restaurant_booking;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.restaurantbooking.restaurant_booking.model.Table;
import com.restaurantbooking.restaurant_booking.model.Zone;
import com.restaurantbooking.restaurant_booking.model.LayoutState;
import com.restaurantbooking.restaurant_booking.model.Feature;
import com.restaurantbooking.restaurant_booking.repository.TableRepository;
import com.restaurantbooking.restaurant_booking.repository.ZoneRepository;
import com.restaurantbooking.restaurant_booking.repository.LayoutStateRepository;
import java.util.HashSet;
import java.util.Set;

// EN: Spring Boot application entry point and initial data seeding configuration.
// EE: Spring Booti rakenduse käivituspunkt ja algandmete seemendamise konfiguratsioon.
@SpringBootApplication
public class RestaurantBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestaurantBookingApplication.class, args);
	}

	// EN: Seeds baseline zones, tables, and layout state for local/test environments.
	// EE: Seemendab kohaliku/testkeskkonna jaoks baastsoonid, lauad ja paigutuse oleku.
	@Bean
	public CommandLineRunner seedData(ZoneRepository zoneRepository, TableRepository tableRepository, LayoutStateRepository layoutStateRepository) {
		return args -> {
			if (tableRepository.count() > 0 || zoneRepository.count() > 0) {
				if (layoutStateRepository.findById(1L).isEmpty()) {
					layoutStateRepository.save(new LayoutState(1L, false));
				}
				return;
			}

			// EN: Create canonical zones used by filtering and recommendation logic.
			// EE: Loo standardsed tsoonid, mida kasutavad filtreerimis- ja soovitusloogika.
			Zone mainZone = zoneRepository.save(new Zone("MAIN_HALL"));
			Zone patioZone = zoneRepository.save(new Zone("PATIO"));
			Zone balconyZone = zoneRepository.save(new Zone("TERRACE"));
			Zone privateZone = zoneRepository.save(new Zone("PRIVATE_ROOM"));

			// EN: Seed deterministic table IDs/positions to keep frontend floor plan behavior predictable.
			// EE: Seemenda deterministlikud laua-ID-d/asukohad, et frontendi põhiplaan käituks etteaimatavalt.
			// EN: Main Hall: tables 1,2,3.
			// EE: Põhisaal: lauad 1,2,3.
			Table table1 = new Table("Table 1", 2, mainZone, 100, 50, false);
			Set<Feature> features1 = new HashSet<>();
			features1.add(Feature.WINDOW);
			table1.setFeatures(features1);
			table1.setNearWindow(true);
			table1.setNearKidsZone(false);
			table1.setQuietCorner(false);
			tableRepository.save(table1);

			Table table2 = new Table("Table 2", 4, mainZone, 150, 100, false);
			Set<Feature> features2 = new HashSet<>();
			features2.add(Feature.WINDOW);
			table2.setFeatures(features2);
			table2.setNearWindow(true);
			table2.setNearKidsZone(false);
			table2.setQuietCorner(false);
			tableRepository.save(table2);

			Table table3 = new Table("Table 3", 8, mainZone, 200, 50, false);
			table3.setNearWindow(false);
			table3.setNearKidsZone(false);
			table3.setQuietCorner(false);
			tableRepository.save(table3);

			// EN: Private room: table 4.
			// EE: Privaatruum: laud 4.
			Table table4 = new Table("Table 4", 10, privateZone, 250, 100, false);
			Set<Feature> features4 = new HashSet<>();
			features4.add(Feature.WINDOW);
			features4.add(Feature.PRIVATE_AREA);
			table4.setFeatures(features4);
			table4.setNearWindow(true);
			table4.setNearKidsZone(false);
			table4.setQuietCorner(true);
			tableRepository.save(table4);

			// EN: Patio: tables 5,6,7 (includes kids-zone mapping).
			// EE: Terrassiala: lauad 5,6,7 (sisaldab lasteala vastendust).
			Table table5 = new Table("Table 5", 4, patioZone, 200, 250, false);
			Set<Feature> features5 = new HashSet<>();
			features5.add(Feature.WINDOW);
			features5.add(Feature.KIDS_ZONE);
			table5.setFeatures(features5);
			table5.setNearWindow(true);
			table5.setNearKidsZone(true);
			table5.setQuietCorner(false);
			tableRepository.save(table5);

			Table table6 = new Table("Table 6", 4, patioZone, 300, 200, false);
			Set<Feature> features6 = new HashSet<>();
			features6.add(Feature.WINDOW);
			features6.add(Feature.KIDS_ZONE);
			table6.setFeatures(features6);
			table6.setNearWindow(true);
			table6.setNearKidsZone(true);
			table6.setQuietCorner(true);
			tableRepository.save(table6);

			Table table7 = new Table("Table 7", 4, patioZone, 250, 200, false);
			Set<Feature> features7 = new HashSet<>();
			features7.add(Feature.KIDS_ZONE);
			table7.setFeatures(features7);
			table7.setNearWindow(false);
			table7.setNearKidsZone(true);
			table7.setQuietCorner(true);
			tableRepository.save(table7);

			// EN: Terrace: tables 8,9,10.
			// EE: Rõdu/terrass: lauad 8,9,10.
			Table table8 = new Table("Table 8", 2, balconyZone, 100, 300, false);
			table8.setNearWindow(false);
			table8.setNearKidsZone(false);
			table8.setQuietCorner(false);
			tableRepository.save(table8);

			Table table9 = new Table("Table 9", 2, balconyZone, 150, 350, false);
			table9.setNearWindow(false);
			table9.setNearKidsZone(false);
			table9.setQuietCorner(false);
			tableRepository.save(table9);

			Table table10 = new Table("Table 10", 2, balconyZone, 200, 300, false);
			Set<Feature> features10 = new HashSet<>();
			features10.add(Feature.WINDOW);
			table10.setFeatures(features10);
			table10.setNearWindow(true);
			table10.setNearKidsZone(false);
			table10.setQuietCorner(false);
			tableRepository.save(table10);

			layoutStateRepository.save(new LayoutState(1L, false));
		};
	}

}
