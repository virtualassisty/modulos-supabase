/**
 * 🔧 DEV BYPASS - Solo para desarrollo local
 *
 * Ejecuta este script en la consola del navegador (F12) cuando estés en /admin/login
 * para simular un login exitoso sin pasar por Google OAuth.
 *
 * NUNCA uses esto en producción.
 */

console.log('🔧 Ejecutando bypass de login para desarrollo...');

// Simular sesión de desarrollo
localStorage.setItem('admin_session_dev', JSON.stringify({
  email: 'virtualassist@assistify365.com',
  name: 'Virtual Assist',
  picture: 'https://ui-avatars.com/api/?name=Virtual+Assist&background=1e2d5a&color=fff',
  timestamp: Date.now()
}));

localStorage.setItem('admin_user_info', JSON.stringify({
  name: 'Virtual Assist',
  picture: 'https://ui-avatars.com/api/?name=Virtual+Assist&background=1e2d5a&color=fff'
}));

console.log('✅ Sesión de desarrollo creada');
console.log('🔄 Redirigiendo al dashboard...');

// Redirigir al dashboard
window.location.href = '/admin';
