import api from './axios'
const BASE = '/compras'
export const comprasApi = {
  getAll:  ()         => api.get(BASE),
  getById: (id)       => api.get(BASE + '/' + id),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
