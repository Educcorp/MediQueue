/**
 * Utilidad para generar y gestionar un identificador único de dispositivo
 * Este ID se usa para prevenir spam en la generación de turnos
 */

/**
 * Genera un hash simple a partir de una cadena
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  return Math.abs(hash).toString(36);
};

/**
 * Genera un fingerprint del navegador basado en sus características
 */
const generateBrowserFingerprint = () => {
  const components = [];
  
  // User Agent
  components.push(navigator.userAgent || '');
  
  // Idioma
  components.push(navigator.language || '');
  
  // Zona horaria
  components.push(new Date().getTimezoneOffset().toString());
  
  // Resolución de pantalla
  components.push(`${screen.width}x${screen.height}`);
  
  // Profundidad de color
  components.push(screen.colorDepth?.toString() || '');
  
  // Plataforma
  components.push(navigator.platform || '');
  
  // Soporte de cookies
  components.push(navigator.cookieEnabled ? '1' : '0');
  
  // Memoria del dispositivo (si está disponible)
  if (navigator.deviceMemory) {
    components.push(navigator.deviceMemory.toString());
  }
  
  // Número de procesadores lógicos (si está disponible)
  if (navigator.hardwareConcurrency) {
    components.push(navigator.hardwareConcurrency.toString());
  }
  
  // Canvas fingerprinting (más preciso pero opcional)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('MediQueue Device ID', 2, 2);
      components.push(canvas.toDataURL().slice(-50)); // Solo últimos 50 caracteres
    }
  } catch (e) {
    // Si falla canvas, continuar sin él
  }
  
  // Combinar todos los componentes y generar hash
  const fingerprint = components.join('|');
  return simpleHash(fingerprint);
};

/**
 * Obtiene o genera el ID del dispositivo
 * Se almacena en localStorage para persistencia
 */
export const getDeviceId = () => {
  const DEVICE_ID_KEY = 'mediqueue_device_id';
  
  try {
    // Intentar obtener ID existente
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generar nuevo ID combinando fingerprint con timestamp
      const fingerprint = generateBrowserFingerprint();
      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 9);
      
      deviceId = `${fingerprint}-${timestamp}-${random}`;
      
      // Almacenar en localStorage
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
      
      console.log('🔑 Nuevo Device ID generado:', deviceId.substring(0, 20) + '...');
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error gestionando Device ID:', error);
    // Fallback: generar ID temporal basado en timestamp
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
};

/**
 * Limpia el Device ID almacenado (útil para testing)
 */
export const clearDeviceId = () => {
  const DEVICE_ID_KEY = 'mediqueue_device_id';
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    console.log('🧹 Device ID limpiado');
    return true;
  } catch (error) {
    console.error('Error limpiando Device ID:', error);
    return false;
  }
};

/**
 * Obtiene información del dispositivo para debugging
 */
export const getDeviceInfo = () => {
  return {
    deviceId: getDeviceId(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: new Date().getTimezoneOffset(),
    cookiesEnabled: navigator.cookieEnabled
  };
};

export default {
  getDeviceId,
  clearDeviceId,
  getDeviceInfo
};

