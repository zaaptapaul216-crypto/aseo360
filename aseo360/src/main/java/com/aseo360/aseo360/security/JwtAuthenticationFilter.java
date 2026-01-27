package com.aseo360.aseo360.security;

import io.jsonwebtoken.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException, java.io.IOException {

        // 1. Obtener el header "Authorization"
        String authHeader = request.getHeader("Authorization");

        // 2. Verificar si viene el token (debe empezar con "Bearer ")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // 3. Validar el token usando tu JwtUtils
            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.getEmailFromToken(token);

                // 4. Si el usuario no está autenticado aún en el contexto de Spring
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // 5. Crear la autenticación oficial de Spring
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 6. ¡Seteamos al usuario en el sistema! ✅
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        // Continuar con la petición
        filterChain.doFilter(request, response);
    }
}
