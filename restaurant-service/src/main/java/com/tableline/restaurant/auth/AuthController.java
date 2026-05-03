package com.tableline.restaurant.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AppUserRepository users;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final PasswordEncoder passwordEncoder;

  public AuthController(
      AppUserRepository users,
      AuthenticationManager authenticationManager,
      JwtService jwtService,
      PasswordEncoder passwordEncoder) {
    this.users = users;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.passwordEncoder = passwordEncoder;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  AuthResponse register(@Valid @RequestBody AuthRequest request) {
    String email = request.email().trim().toLowerCase();
    if (users.existsByEmailIgnoreCase(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }

    AppUser user = new AppUser();
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setRole(Role.USER);
    users.save(user);
    return toResponse(user);
  }

  @PostMapping("/login")
  AuthResponse login(@Valid @RequestBody AuthRequest request) {
    String email = request.email().trim().toLowerCase();
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(email, request.password()));
    AppUser user = users
        .findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
    return toResponse(user);
  }

  private AuthResponse toResponse(AppUser user) {
    return new AuthResponse(jwtService.createToken(user), user.getEmail(), user.getRole());
  }
}
