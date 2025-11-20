# Configuración de Variables de Entorno en Vercel

## 🚀 Problema Resuelto

El frontend estaba haciendo llamadas a `/api/...` que Vercel interpretaba como rutas del frontend, devolviendo HTML en lugar de JSON del backend.

## ✅ Solución Implementada

### 1. Variable de Entorno

Se agregó soporte para `VITE_API_URL` que apunta al backend de Railway.

### 2. Configuración en Vercel

Debes agregar la siguiente variable de entorno en Vercel:

**Dashboard de Vercel** → **Tu Proyecto** → **Settings** → **Environment Variables**

| Nombre | Valor |
|--------|-------|
| `VITE_API_URL` | `https://mediqueue-backend-production.up.railway.app/api` |

**IMPORTANTE**: Agregar para TODOS los ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Redeployar

Después de agregar la variable:
1. Ve a **Deployments**
2. Click en el deployment más reciente
3. Click en el menú ⋯ (tres puntos)
4. Click en **Redeploy**

## 📁 Archivos Modificados

### Frontend

1. **`src/pages/EmailVerification.jsx`**
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 
                   'https://mediqueue-backend-production.up.railway.app/api';
   ```
   - Ahora usa URL completa del backend
   - Todas las llamadas axios usan `${API_URL}/...`

2. **`.env`** (para desarrollo local)
   ```env
   VITE_API_URL=https://mediqueue-backend-production.up.railway.app/api
   ```

3. **`.env.example`** (para referencia)
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

## 🔍 Cómo Verificar

### Desarrollo Local

```bash
cd MediQueue
npm run dev
```

Debería usar:
- ✅ `http://localhost:3000/api` (si backend está corriendo local)
- ✅ O Railway si está configurado en `.env`

### Producción (Vercel)

Después del redeploy:
1. Abre DevTools (F12)
2. Ve a la pestaña Network
3. Intenta verificar un email
4. Deberías ver llamadas a:
   - `https://mediqueue-backend-production.up.railway.app/api/administradores/verify-email/...`
   - Respuesta en **JSON** (no HTML)

## 🐛 Logs Esperados

**Antes (ERROR)**:
```
✅ Verificación manual exitosa: <!DOCTYPE html>  ← MAL!
```

**Después (CORRECTO)**:
```
✅ Verificación manual exitosa: {success: true, ...}  ← BIEN!
```

## 📝 Pasos para Aplicar

### 1. Commit y Push
```bash
cd MediQueue
git add .
git commit -m "fix: configurar URL completa del backend en verificación de email"
git push origin main
```

### 2. Configurar Vercel
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto MediQueue
3. Settings → Environment Variables
4. Agregar `VITE_API_URL` con valor de Railway
5. Aplicar a todos los ambientes

### 3. Redeploy
El push automáticamente dispara un nuevo deploy, PERO:
- Si ya hiciste push antes de agregar la variable de entorno
- Debes hacer un **Redeploy manual** después de agregar la variable

## ⚠️ Importante

### NO subir `.env` a Git
El archivo `.env` ya está en `.gitignore` y contiene configuración local.

### Usar `.env.example`
Para que otros desarrolladores sepan qué variables necesitan.

## 🎯 Resultado Final

Después de estos cambios:
- ✅ Verificación de email funcionará correctamente
- ✅ Llamadas API irán al backend de Railway
- ✅ Respuestas serán JSON válido
- ✅ El botón "Forzar Verificación" funcionará
- ✅ Login permitirá acceso solo a usuarios verificados

---

**Última actualización**: Noviembre 2025
