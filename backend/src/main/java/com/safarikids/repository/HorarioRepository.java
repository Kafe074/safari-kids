package com.safarikids.repository;
import com.safarikids.model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface HorarioRepository extends JpaRepository<Horario, Integer> {
    java.util.Optional<Horario> findByHoraInicio(java.time.LocalTime horaInicio);
}
