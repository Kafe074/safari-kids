import api from './axios'
const BASE = '/solicitudes-insumos'
export const solicitudesInsumosApi = {
  getAll:        ()            => api.get(BASE),
  getByEmpleado: (idEmpleado)  => api.get(BASE + '/empleado/' + idEmpleado),
  crear:         (data)        => api.post(BASE, data),
  cambiarEstado: (id, estado)  => api.patch(`${BASE}/${id}/estado?estado=${estado}`),
  cancelar:      (id)          => api.delete(BASE + '/' + id),
}
