import api from './axios'
const BASE = '/pagos'
export const pagosApi = {
  getAll:           ()             => api.get(BASE),
  getById:          (id)           => api.get(BASE + '/' + id),
  getByReserva:     (idReserva)    => api.get(BASE + '/reserva/' + idReserva),
  getBoleta:        (idPago)       => api.get(BASE + '/boleta/' + idPago),
  procesar:         (data)         => api.post(BASE + '/procesar', data),
  validarEfectivo:  (codigo)       => api.patch(BASE + '/validar-efectivo/' + codigo),
}
