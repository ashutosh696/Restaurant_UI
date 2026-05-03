package com.tableline.restaurant.order;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RestaurantOrderRepository extends MongoRepository<RestaurantOrder, String> {
  List<RestaurantOrder> findAllByOrderByCreatedAtDesc();
}
