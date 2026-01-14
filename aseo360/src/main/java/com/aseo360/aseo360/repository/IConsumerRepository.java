package com.aseo360.aseo360.repository;

import com.aseo360.aseo360.model.Consumer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IConsumerRepository extends JpaRepository<Consumer, Long> {
}
