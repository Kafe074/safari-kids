import api from './axios'
const BASE = '/reservas'
export const reservasApi = {
  getAll:        ()         => api.get(BASE),
  getById:       (id)       => api.get(BASE + '/' + id),
  crear:         (data)     => api.post(BASE + '/crear', data),
  porCodigo:     (codigo)   => api.get(BASE + '/codigo/' + codigo),
  misReservas:   ()         => api.get(BASE + '/mis-reservas'),
  misAsignadas:  ()         => api.get(BASE + '/mis-asignadas'),
  cancelar:      (id)       => api.patch(BASE + '/' + id + '/cancelar'),
  confirmar:     (id)       => api.patch(BASE + '/' + id + '/confirmar'),
  create:        (data)     => api.post(BASE, data),
  update:        (id, data) => api.put(BASE + '/' + id, data),
  remove:        (id)       => api.delete(BASE + '/' + id),
}
