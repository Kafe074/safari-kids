import api from './axios'
const BASE = '/empleados'
export const empleadosApi = {
  getAll:       ()         => api.get(BASE),
  disponibles:  (sucursal) => api.get(BASE + '/disponibles', { params: { sucursal } }),
  getById:      (id)       => api.get(BASE + '/' + id),
  me:           ()         => api.get(BASE + '/me'),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
