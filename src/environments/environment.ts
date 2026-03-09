export const environment = {
  production: false,
  // Detectar automáticamente la URL del backend
  apiUrl: getBackendUrl()
};

function getBackendUrl(): string {
  // Si es localhost, usar localhost
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }
  
  // Si es una IP de red local, asumir que el backend está en la misma IP
  return `http://${window.location.hostname}:8080/api`;
}
