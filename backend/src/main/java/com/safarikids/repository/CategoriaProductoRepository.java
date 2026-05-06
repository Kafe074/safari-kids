package com.safarikids.repository;
import com.safarikids.model.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, Integer> {}
