package com.tableline.restaurant.menu;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MenuItemSeeder {
  @Bean
  CommandLineRunner seedMenuItems(MenuItemRepository menuItems) {
    return args -> {
      if (menuItems.count() > 0) {
        return;
      }

      menuItems.saveAll(List.of(
          menuItem("Paneer Tikka Bowl", "Charred paneer, saffron rice, mint chutney, crisp salad.", "Bowls", 250),
          menuItem("Masala Dosa", "Crisp dosa, potato masala, sambar, coconut chutney.", "South Indian", 180),
          menuItem("Mango Lassi", "Chilled mango yogurt drink with cardamom.", "Drinks", 90)));
    };
  }

  private MenuItem menuItem(String name, String description, String category, double price) {
    MenuItem item = new MenuItem();
    item.setName(name);
    item.setDescription(description);
    item.setCategory(category);
    item.setPrice(price);
    item.setAvailable(true);
    return item;
  }
}
