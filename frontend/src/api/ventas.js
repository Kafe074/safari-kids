import api from './axios'
const BASE = '/ventas'
export const ventasApi = {
  getAll:    ()         => api.get(BASE),
  getById:   (id)       => api.get(BASE + '/' + id),
  checkout:  (items)    => api.post(BASE + '/checkout', { items }),
  create:    (data)     => api.post(BASE, data),
  update:  (id, data) => api.put(BASE + '/' + id, data),
  remove:  (id)       => api.delete(BASE + '/' + id),
}
