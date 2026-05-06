import api from './axios'
const BASE = '/categoria-productos'
export const categoriasApi = {
  getAll:  ()         => api.get(BASE),
  create:  (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
