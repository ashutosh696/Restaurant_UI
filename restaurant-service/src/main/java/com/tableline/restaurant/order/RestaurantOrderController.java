package com.tableline.restaurant.order;

import com.tableline.restaurant.menu.MenuItem;
import com.tableline.restaurant.menu.MenuItemRepository;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class RestaurantOrderController {
  private final RestaurantOrderRepository orders;
  private final MenuItemRepository menuItems;

  public RestaurantOrderController(RestaurantOrderRepository orders, MenuItemRepository menuItems) {
    this.orders = orders;
    this.menuItems = menuItems;
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  List<RestaurantOrder> listOrders() {
    return orders.findAllByOrderByCreatedAtDesc();
  }

  @GetMapping("/{id}")
  RestaurantOrder getOrder(@PathVariable String id) {
    return orders
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  RestaurantOrder createOrder(@Valid @RequestBody CreateOrderRequest request, Authentication authentication) {
    RestaurantOrder order = new RestaurantOrder();
    order.setCustomerName(request.customerName());
    order.setPhone(request.phone());
    order.setCustomerEmail(authentication.getName());
    order.setItems(enrichLines(request.items()));
    order.setTotal(order.getItems().stream().mapToDouble(line -> line.getPrice() * line.getQuantity()).sum());
    return orders.save(order);
  }

  @PatchMapping("/{id}/status")
  @PreAuthorize("hasRole('ADMIN')")
  RestaurantOrder updateStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusRequest request) {
    RestaurantOrder order = orders
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    order.setStatus(request.status());
    order.setUpdatedAt(Instant.now());
    return orders.save(order);
  }

  private List<OrderLine> enrichLines(List<OrderLine> lines) {
    return lines.stream().map(line -> {
      MenuItem item = menuItems
          .findById(line.getMenuItemId())
          .filter(MenuItem::isAvailable)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item unavailable"));
      OrderLine enriched = new OrderLine();
      enriched.setMenuItemId(item.getId());
      enriched.setName(item.getName());
      enriched.setPrice(item.getPrice());
      enriched.setQuantity(line.getQuantity());
      return enriched;
    }).toList();
  }
}
