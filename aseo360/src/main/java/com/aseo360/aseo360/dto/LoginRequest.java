package com.aseo360.aseo360.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String correo;
    private String password;
}
