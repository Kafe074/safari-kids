import api from './axios'
const BASE = '/inventarios'
export const inventarioApi = {
  getAll:       ()         => api.get(BASE),
  getById:      (id)       => api.get(BASE + '/' + id),
  create:       (data)     => api.post(BASE, data),
  patchStock:   (id, stock) => api.patch(BASE + '/' + id + '/stock', { stockActual: stock }),
  remove:       (id)       => api.delete(BASE + '/' + id),
}
