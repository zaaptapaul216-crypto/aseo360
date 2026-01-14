package com.aseo.backend.controller;

import com.aseo.backend.model.User;
import com.aseo.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User loginRequest) {
        return userService.findByUsername(loginRequest.getUsername())
                .filter(u -> u.getPassword().equals(loginRequest.getPassword()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }
    
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        // In real app, hash password here
        return userService.save(user);
    }
}
