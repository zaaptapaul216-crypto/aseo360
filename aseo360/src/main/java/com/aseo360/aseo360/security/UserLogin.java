package com.aseo360.aseo360.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;

public class UserLogin implements UserDetails {
    private String correo;
    private String password;
    private String estado;
    private Collection<? extends GrantedAuthority> authorities;

    // Constructor para llenar los datos desde la DB
    public UserLogin(String correo, String password, String estado,
                     Collection<? extends GrantedAuthority> authorities) {
        this.correo = correo;
        this.password = password;
        this.estado = estado;
        this.authorities = authorities;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return correo; }

    @Override
    public boolean isEnabled() { return "ACTIVO".equals(estado);}

    // Estos los dejamos en true para simplificar por ahora
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}