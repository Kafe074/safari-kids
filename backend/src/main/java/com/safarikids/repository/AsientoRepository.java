package com.safarikids.repository;
import com.safarikids.model.Asiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface AsientoRepository extends JpaRepository<Asiento, Integer> {}
