package com.aseo.backend.repository;

import com.aseo.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByCode(String code);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :term, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Product> search(@Param("term") String term);

    List<Product> findByCategory(String category);

    boolean existsByCode(String code);
}
