package com.safarikids.repository;
import com.safarikids.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {}
