package com.safarikids.repository;
import com.safarikids.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Integer> {
    List<Empleado> findByEstado(Empleado.EstadoEmpleado estado);
    List<Empleado> findBySucursalAndEstado(String sucursal, Empleado.EstadoEmpleado estado);
    java.util.Optional<Empleado> findByUsuarioIdUsuario(Integer idUsuario);
}
