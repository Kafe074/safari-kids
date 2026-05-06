package com.safarikids.repository;
import com.safarikids.model.Insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface InsumoRepository extends JpaRepository<Insumo, Integer> {}
