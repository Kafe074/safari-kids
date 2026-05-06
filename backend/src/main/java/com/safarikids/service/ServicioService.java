package com.safarikids.service;
import com.safarikids.model.Servicio;
import java.util.List;
public interface ServicioService {
    List<Servicio> findAll();
    List<Servicio> findDisponibles();
    Servicio findById(Integer id);
    Servicio save(Servicio s);
    void delete(Integer id);
}