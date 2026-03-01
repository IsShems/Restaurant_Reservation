package com.restaurantbooking.restaurant_booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// EN: Configures CORS rules so local frontend clients can call backend endpoints.
// EE: Seadistab CORS-i reeglid, et kohalik frontend saaks backendi otspunkte kasutada.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    // EN: Registers permissive local-development CORS mappings.
    // EE: Registreerib kohaliku arenduse jaoks lubavad CORS-i vastendused.
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
