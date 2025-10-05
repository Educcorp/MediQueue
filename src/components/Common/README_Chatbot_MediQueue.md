# 🏥 Chatbot Médico MediQueue - Asistente Virtual

## 📋 Descripción
Asistente virtual inteligente integrado en MediQueue que proporciona soporte médico 24/7 a pacientes y profesionales de la salud, con la misma API y funcionalidad que EducStation pero adaptado completamente a la temática médica.

## 🎯 Características Principales

### ✅ **Funcionalidades Médicas**
- **Consultas médicas generales** - Orientación sobre síntomas básicos
- **Información de turnos** - Ayuda con reserva y gestión de citas
- **Especialidades médicas** - Información sobre pediatría, cardiología, traumatología, etc.
- **Emergencias** - Orientación para situaciones urgentes
- **Recordatorios** - Información sobre medicamentos y tratamientos

### ✅ **Interfaz Médica Moderna**
- **Diseño glassmorphism** con colores médicos (#77b8ce - azul médico)
- **Iconografía médica** - Estetoscopio, cruz médica, doctor, corazón
- **Animaciones suaves** - Efectos de latido del corazón y pulso médico
- **Tema responsive** - Perfecto en móviles y tablets
- **Mensaje promocional** - Aparece automáticamente ofreciendo ayuda médica

### ✅ **API y Configuración**
- **Misma API** que EducStation: `https://educstation-backend-production.up.railway.app/api/chatbot/message`
- **Contexto médico** - Los mensajes se procesan con contexto de MediQueue
- **Respuestas especializadas** - Orientadas a salud y medicina
- **Fallback médico** - Mensajes de error redirigen a profesionales

## 🏗️ Arquitectura del Sistema

### **Estructura de Archivos:**
```
src/components/Common/
├── Chatbot.jsx                    # Componente principal del chatbot
├── Chatbot.css                    # Estilos médicos especializados
└── README_Chatbot_MediQueue.md    # Esta documentación
```

### **Integración Global:**
- **App.jsx** - Integrado globalmente como componente fijo
- **Disponible en todas las páginas** - Tanto públicas como administrativas
- **Position fixed** - Botón flotante en esquina inferior derecha
- **Z-index alto** - Siempre visible sobre otros elementos

## 🎨 Paleta de Colores Médica

```css
/* Colores principales de MediQueue */
--primary: #77b8ce;           /* Azul médico principal */
--primary-light: #a8d1e0;     /* Azul claro suave */
--primary-dark: #5a9bb0;      /* Azul oscuro profesional */
--accent: #28a745;            /* Verde salud */
--white: #ffffff;             /* Blanco limpio */
--text-primary: #2c3e50;      /* Texto principal */
--text-secondary: #6c757d;    /* Texto secundario */
```

## 🚀 Uso y Funcionalidades

### **Mensaje Promocional Automático**
```jsx
// Aparece después de 3 segundos si no se ha usado antes
// Se guarda en sessionStorage para no molestar
// Temática médica: "¿Necesitas ayuda médica?"
sessionStorage.getItem('mediqueueChatbotHelpDismissed')
```

### **Estados Interactivos**
- **Normal**: Botón flotante con ícono de estetoscopio
- **Hover**: Escala y sombra médica azul
- **Abierto**: Ventana completa con header médico
- **Minimizado**: Solo header visible, contenido colapsado
- **Escribiendo**: Indicador con puntos animados azules

### **Iconografía Médica**
- **Botón principal**: `<FaStethoscope />` (Estetoscopio)
- **Header**: `<MdLocalHospital />` (Hospital/Cruz médica)
- **Usuario**: `<FaUser />` (Usuario estándar)
- **Bot**: `<FaUserDoctor />` (Doctor/Médico)
- **Promocional**: `<FaHeartbeat />` (Latido del corazón)

## 💻 Integración Técnica

### **React Hooks Utilizados**
```jsx
const [open, setOpen] = useState(false);           // Estado de ventana abierta/cerrada
const [messages, setMessages] = useState([...]);   // Historial de conversación
const [loading, setLoading] = useState(false);     // Estado de carga de respuesta
const [typing, setTyping] = useState(false);       // Indicador de escritura
const [minimized, setMinimized] = useState(false); // Estado minimizado
const [showPromo, setShowPromo] = useState(false); // Mensaje promocional
```

### **API Call Configuration**
```jsx
const API_URL = 'https://educstation-backend-production.up.railway.app/api/chatbot/message';

// Contexto médico agregado automáticamente
const contextMessage = `Contexto médico de MediQueue: ${input}. Responde con información médica general y orientación sobre turnos médicos.`;
```

### **Animaciones CSS Médicas**
```css
/* Latido del corazón para iconos médicos */
@keyframes mediqueueHeartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
  75% { transform: scale(1.05); }
}

/* Pulso médico para botón principal */
@keyframes mediqueuePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

## 🔧 Configuración Avanzada

### **Personalización de Mensajes**
```jsx
// Mensaje inicial del bot (personalizable)
const initialMessage = "¡Hola! Soy el asistente virtual de MediQueue. ¿En qué puedo ayudarte con tus consultas médicas o turnos hoy?";

// Placeholder del input (contextual)
placeholder="Pregúntame sobre turnos, especialidades médicas o salud..."

// Mensaje de error médico (responsable)
errorMessage = "Para consultas médicas urgentes, contacta directamente con tu centro de salud."
```

### **Configuración de Tiempo**
```jsx
const PROMO_DELAY = 3000;    // 3 segundos para mostrar mensaje promocional
const PROMO_TIMEOUT = 15000; // 15 segundos antes de ocultar automáticamente
const TYPING_DELAY = 500;    // 0.5 segundos de simulación de escritura
```

## 📱 Responsive Design

### **Breakpoints Médicos**
```css
/* Desktop - Experiencia completa */
@media (min-width: 769px) {
  .mediqueue-chatbot-window { width: 360px; height: 500px; }
}

/* Tablet - Optimizado */
@media (max-width: 768px) {
  .mediqueue-chatbot-window { width: calc(100vw - 40px); max-width: 340px; }
}

/* Mobile - Compacto pero funcional */
@media (max-width: 480px) {
  .mediqueue-chatbot-window { width: calc(100vw - 20px); height: 400px; }
}
```

## 🛡️ Consideraciones de Privacidad Médica

### **Datos Sensibles**
- **No almacena información médica** personal
- **SessionStorage** solo para preferencias de UI
- **No historial persistente** - se borra al cerrar pestaña
- **Conexión segura** - API via HTTPS

### **Disclaimers Médicos**
- Información **solo orientativa**, no reemplaza consulta médica
- En emergencias, recomienda contactar profesionales
- No proporciona diagnósticos específicos
- Redirige a especialistas cuando es necesario

## 🎯 Mensajes Contextuales por Página

### **HomePage** - Información general de turnos
### **TakeTurn** - Ayuda con el proceso de reserva
### **Admin Dashboard** - Soporte para administradores
### **Patient Management** - Asistencia con gestión de pacientes

## 🚀 Futuras Mejoras

### **Funcionalidades Planificadas**
- [ ] Integración con calendario de turnos
- [ ] Notificaciones push médicas
- [ ] Chat de voz médico
- [ ] Traducción a múltiples idiomas
- [ ] Integración con historiales médicos
- [ ] Chatbot especializado por área médica

---

## 📞 Soporte Técnico

**Desarrollado para MediQueue** - Sistema de gestión de turnos médicos
**Basado en EducStation Chatbot** - Misma API, temática médica
**Compatible con React 18+** - Hooks modernos y mejores prácticas

**¿Problemas?** Contacta al equipo de desarrollo de MediQueue.
