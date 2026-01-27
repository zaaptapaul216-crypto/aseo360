package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRolRepositorio extends JpaRepository<Rol, Long> {
}
