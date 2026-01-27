package com.aseo360.aseo360.repositorio;

import com.aseo360.aseo360.modelo.Aroma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAromaRepositorio extends JpaRepository<Aroma, Long> {
}
