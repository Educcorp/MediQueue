# MediQueue - Sistema de Gestión de Turnos Médicos

Una aplicación web moderna y elegante para la gestión de turnos médicos en clínicas de salud, construida con React y Vite.

## 🎨 Paleta de Colores

- **Azul Claro**: `#d8f0f4` - Color principal
- **Rosa Pálido**: `#d7c0c6` - Color secundario  
- **Azul Medio**: `#77b8ce` - Color de acento
- **Gris Oscuro**: `#544e52` - Color de texto
- **Rojo**: `#ea5d4b` - Color de destacado

## 🏥 Especialidades Médicas

- 👶 **Pediatría**
- ❤️ **Cardiología**
- 🦴 **Traumatología**
- 🥗 **Nutricionista**
- 🏥 **Medicina General**
- 👁️ **Oculista**

## ✨ Características

- 🎯 **Vista de Turno Actual**: Muestra información detallada del turno programado
- 🏥 **Grid de Especialidades**: Visualización atractiva de todas las especialidades
- 📱 **Diseño Responsivo**: Optimizado para todos los dispositivos
- 🎨 **UI Moderna**: Interfaz intuitiva y amigable
- ⚡ **Rendimiento Optimizado**: Construido con Vite para máxima velocidad

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd MediQueue
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   - La aplicación se abrirá automáticamente en `http://localhost:3001`
   - O navega manualmente a la URL

### Scripts Disponibles

- `npm run dev` - Ejecuta el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter para verificar el código

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx      # Encabezado de la aplicación
│   ├── Footer.jsx      # Pie de página
│   ├── AppointmentCard.jsx  # Tarjeta de turno
│   └── SpecialtyGrid.jsx    # Grid de especialidades
├── pages/              # Páginas de la aplicación
│   └── HomePage.jsx    # Página principal
├── styles/             # Archivos de estilos
│   ├── index.css       # Estilos globales
│   ├── App.css         # Estilos de la aplicación
│   ├── HomePage.css    # Estilos de la página principal
│   ├── Header.css      # Estilos del header
│   ├── Footer.css      # Estilos del footer
│   ├── AppointmentCard.css  # Estilos de la tarjeta de turno
│   └── SpecialtyGrid.css    # Estilos del grid de especialidades
├── App.jsx             # Componente principal
└── main.jsx            # Punto de entrada
```

## 🎯 Funcionalidades Principales

### Vista de Turno Actual
- Información completa del paciente
- Detalles de la especialidad y doctor
- Fecha y hora del turno
- Número de consultorio
- Estado del turno (confirmado, pendiente, completado)
- Acciones rápidas (confirmar, cambiar horario, cancelar)

### Grid de Especialidades
- Visualización atractiva de cada especialidad
- Información de disponibilidad
- Botón para agendar turnos
- Efectos hover interactivos

### Acciones Rápidas
- Agendar nuevo turno
- Ver historial
- Cambiar horario
- Cancelar turno

## 🎨 Diseño y UX

- **Paleta de colores médica**: Colores suaves y profesionales
- **Gradientes modernos**: Transiciones suaves entre colores
- **Sombras y profundidad**: Efectos visuales atractivos
- **Animaciones**: Transiciones fluidas y efectos hover
- **Tipografía**: Fuente Inter para mejor legibilidad
- **Responsive**: Adaptable a todos los tamaños de pantalla

## 🔧 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de construcción rápida
- **CSS3** - Estilos modernos con variables CSS
- **React Router** - Enrutamiento de la aplicación
- **Axios** - Cliente HTTP para futuras integraciones con API

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Computadoras de escritorio
- 🖥️ Pantallas grandes

## 🚀 Próximas Funcionalidades

- [ ] Sistema de autenticación de usuarios
- [ ] Calendario interactivo para selección de fechas
- [ ] Integración con API backend
- [ ] Sistema de notificaciones
- [ ] Historial de turnos
- [ ] Perfil de usuario
- [ ] Sistema de pagos

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, asegúrate de:
1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: info@mediqueue.com
- **Teléfono**: (123) 456-7890
- **Dirección**: Av. Principal 123, Ciudad

---

**MediQueue** - Transformando la experiencia médica, un turno a la vez. 🏥✨
