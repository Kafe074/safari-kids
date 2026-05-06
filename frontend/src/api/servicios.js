import api from './axios'
const BASE = '/servicios'
export const serviciosApi = {
  getAll:  ()         => api.get(BASE),
  getById: (id)       => api.get(BASE + '/' + id),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
