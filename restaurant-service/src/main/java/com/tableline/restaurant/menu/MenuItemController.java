package com.tableline.restaurant.menu;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/menu")
public class MenuItemController {
  private final MenuItemRepository menuItems;

  public MenuItemController(MenuItemRepository menuItems) {
    this.menuItems = menuItems;
  }

  @GetMapping
  List<MenuItem> listMenuItems() {
    return menuItems.findAll();
  }

  @GetMapping("/available")
  List<MenuItem> listAvailableMenuItems() {
    return menuItems.findByAvailableTrueOrderByCategoryAscNameAsc();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  MenuItem createMenuItem(@Valid @RequestBody MenuItem menuItem) {
    menuItem.setId(null);
    return menuItems.save(menuItem);
  }

  @PutMapping("/{id}")
  MenuItem updateMenuItem(@PathVariable String id, @Valid @RequestBody MenuItem menuItem) {
    if (!menuItems.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
    }
    menuItem.setId(id);
    return menuItems.save(menuItem);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void deleteMenuItem(@PathVariable String id) {
    menuItems.deleteById(id);
  }
}
