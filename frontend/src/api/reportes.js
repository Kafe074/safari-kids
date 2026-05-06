import api from './axios'
export const reportesApi = {
  getDashboard: () => api.get('/reportes/dashboard'),
}
