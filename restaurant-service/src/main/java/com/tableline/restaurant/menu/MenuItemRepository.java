package com.tableline.restaurant.menu;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
  List<MenuItem> findByAvailableTrueOrderByCategoryAscNameAsc();
}
