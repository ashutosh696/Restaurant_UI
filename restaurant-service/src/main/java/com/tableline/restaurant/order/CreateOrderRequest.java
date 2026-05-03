package com.tableline.restaurant.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String customerName,
    @NotBlank String phone,
    @Valid @NotEmpty List<OrderLine> items) {
}
