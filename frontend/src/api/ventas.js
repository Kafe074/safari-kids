import api from './axios'
const BASE = '/ventas'
export const ventasApi = {
  getAll:               ()            => api.get(BASE),
  getById:              (id)          => api.get(`${BASE}/${id}`),
  getDetalles:          (id)          => api.get(`${BASE}/${id}/detalles`),
  misCompras:           ()            => api.get(`${BASE}/mis-compras`),
  checkout:             (data)        => api.post(`${BASE}/checkout`, data),
  cambiarEstadoEntrega: (id, estado)  => api.patch(`${BASE}/${id}/estado-entrega`, { estadoEntrega: estado }),
  create:               (data)        => api.post(BASE, data),
  update:               (id, data)    => api.put(`${BASE}/${id}`, data),
  remove:               (id)          => api.delete(`${BASE}/${id}`),
}
