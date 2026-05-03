package com.tableline.restaurant.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminUserSeeder {
  @Bean
  CommandLineRunner seedAdminUser(
      AppUserRepository users,
      PasswordEncoder passwordEncoder,
      @Value("${app.admin.email}") String adminEmail,
      @Value("${app.admin.password}") String adminPassword) {
    return args -> {
      String email = adminEmail.trim().toLowerCase();
      if (email.isBlank() || users.existsByEmailIgnoreCase(email)) {
        return;
      }

      AppUser admin = new AppUser();
      admin.setEmail(email);
      admin.setPasswordHash(passwordEncoder.encode(adminPassword));
      admin.setRole(Role.ADMIN);
      users.save(admin);
    };
  }
}
