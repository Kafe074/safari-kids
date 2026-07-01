import api from './axios'
const BASE = '/clientes'
export const clientesApi = {
  getAll:  ()         => api.get(BASE),
  getById: (id)       => api.get(BASE + '/' + id),
  porDni:  (dni)      => api.get(BASE + '/dni/' + dni),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
