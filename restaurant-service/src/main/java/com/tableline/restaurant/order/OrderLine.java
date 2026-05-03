package com.tableline.restaurant.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class OrderLine {
  @NotBlank
  private String menuItemId;

  private String name;
  private double price;

  @Min(1)
  private int quantity;

  public String getMenuItemId() {
    return menuItemId;
  }

  public void setMenuItemId(String menuItemId) {
    this.menuItemId = menuItemId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public double getPrice() {
    return price;
  }

  public void setPrice(double price) {
    this.price = price;
  }

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int quantity) {
    this.quantity = quantity;
  }
}
