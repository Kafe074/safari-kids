import api from './axios'
const BASE = '/inventarios'
export const inventarioApi = {
  getAll:       ()               => api.get(BASE),
  getBySucursal:(sucursal)       => api.get(`${BASE}/sucursal/${encodeURIComponent(sucursal)}`),
  getById:      (id)             => api.get(`${BASE}/${id}`),
  create:       (data)           => api.post(BASE, data),
  update:       (id, data)       => api.put(`${BASE}/${id}`, data),
  patchStock:   (id, stock)      => api.patch(`${BASE}/${id}/stock`, { stockActual: stock }),
  remove:               (id)    => api.delete(`${BASE}/${id}`),
  inicializarSucursales: ()     => api.post(`${BASE}/inicializar-sucursales`),
}
