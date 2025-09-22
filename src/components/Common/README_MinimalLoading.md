# 🎯 Pantalla de Carga Minimalista - MediQueue

## Descripción
Componente de carga simple y elegante que se integra perfectamente con el diseño glassmorphism de MediQueue.

## Características
- ✅ **Diseño minimalista** - Interfaz limpia y profesional
- ✅ **Glassmorphism sutil** - Efectos de cristal discretos
- ✅ **Animaciones suaves** - Transiciones fluidas y elegantes
- ✅ **Responsive** - Perfecto en cualquier dispositivo
- ✅ **Ligero** - Menos de 200 líneas de código
- ✅ **Integrado** - Colores coherentes con la paleta existente

## Uso Básico

```jsx
import LoadingScreen from '../components/Common/LoadingScreen';

// Uso simple
<LoadingScreen message="Cargando datos" />

// Con barra de progreso
<LoadingScreen 
  message="Procesando información" 
  showProgress={true} 
/>
```

## Props
- `message` (string): Texto a mostrar (default: "Cargando dashboard...")
- `showProgress` (boolean): Mostrar barra de progreso (default: false)

## Ejemplos de Integración

### En AdminLogin
```jsx
if (isLoading) {
  return (
    <LoadingScreen 
      message="Autenticando usuario"
      showProgress={false}
    />
  );
}
```

### En cualquier componente
```jsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await saveData();
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return <LoadingScreen message="Guardando información" />;
}
```

## Elementos Visuales
1. **Cruz médica simple** - Icono temático minimalista
2. **Título MediQueue** - Con gradiente sutil
3. **Spinner elegante** - Anillo giratorio suave
4. **Mensaje dinámico** - Con puntos animados
5. **Progreso opcional** - Barra con efecto shimmer

## Responsive
- **Desktop**: Diseño completo (320px width)
- **Tablet**: Optimizado (280px width)
- **Mobile**: Compacto pero funcional

## Colores
- Primario: `#77b8ce` (azul médico)
- Secundario: `#6c757d` (gris elegante)
- Texto: `#2c3e50` / `#495057`
- Fondo: Glassmorphism con blur(40px)

## Animaciones
- Entrada suave (slideUp + fadeIn)
- Spinner rotación constante
- Puntos animados en el mensaje
- Efecto shimmer en la barra de progreso
- Hover effect sutil en desktop
