import api from './axios'
const BASE = '/promociones'
export const promocionesApi = {
  getAll:          ()          => api.get(BASE),
  getActivas:      ()          => api.get(BASE + '/activas'),
  getById:         (id)        => api.get(BASE + '/' + id),
  create:          (data)      => api.post(BASE, data),
  update:          (id, data)  => api.put(BASE + '/' + id, data),
  remove:          (id)        => api.delete(BASE + '/' + id),
  validarCodigo:   (codigo)    => api.post(BASE + '/validar-codigo', { codigo }),
}
