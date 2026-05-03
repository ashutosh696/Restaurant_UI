package com.tableline.restaurant.auth;

public record AuthResponse(String token, String email, Role role) {
}
