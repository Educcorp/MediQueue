import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaPaperPlane, FaTimes, FaRobot, FaUser, FaStethoscope, FaSpinner, FaHeart, FaUserMd } from 'react-icons/fa';
import { BsChatDots, BsArrowUp, BsQuestionCircle, BsLightbulb } from 'react-icons/bs';
import { MdSend, MdClose, MdLocalHospital } from 'react-icons/md';

const API_URL = 'https://educstation-backend-production.up.railway.app/api/chatbot/message';

const Chatbot = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: '¡Hola! Soy el asistente virtual de MediQueue. ¿En qué puedo ayudarte con tus consultas médicas o turnos hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [showPromo, setShowPromo] = useState(false);
    const [promoAnimation, setPromoAnimation] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const promoTimeoutRef = useRef(null);
    const chatWindowRef = useRef(null);
    const promoRef = useRef(null);

    // Función para obtener contexto de la página actual
    const getPageContext = () => {
        const path = location.pathname;
        const pageContexts = {
            '/': 'Página principal - Información general sobre MediQueue y servicios médicos',
            '/tomar-turno': 'Página de reserva de turnos - Ayuda con el proceso de tomar turnos médicos',
            '/admin': 'Panel de administración - Gestión de usuarios y configuración del sistema',
            '/admin/dashboard': 'Dashboard administrativo - Estadísticas y gestión de turnos',
            '/admin/users': 'Gestión de usuarios - Administración de cuentas de administradores',
            '/admin/turns': 'Gestión de turnos - Administración de citas médicas',
            '/admin/consultorios': 'Gestión de consultorios - Configuración de espacios médicos',
            '/admin/patients': 'Gestión de pacientes - Administración de información de pacientes',
            '/admin/statistics': 'Estadísticas - Reportes y métricas del sistema',
            '/admin/settings': 'Configuración - Ajustes del sistema MediQueue',
            '/privacy': 'Política de privacidad - Información sobre protección de datos médicos'
        };

        return pageContexts[path] || 'Página general de MediQueue';
    };

    // Función para generar respuestas locales inteligentes
    const getLocalResponse = (question, pageContext, isAuth) => {
        const lowerQuestion = question.toLowerCase();

        // Respuestas sobre MediQueue
        if (lowerQuestion.includes('mediqueue') || lowerQuestion.includes('que es') || lowerQuestion.includes('qué es')) {
            return `MediQueue es un sistema moderno de gestión de turnos médicos que te permite:

🏥 **Especialidades disponibles:**
• Medicina General
• Cardiología
• Traumatología  
• Pediatría
• Oftalmología
• Nutrición

📅 **Funcionalidades principales:**
• Reserva de turnos online 24/7
• Gestión inteligente de colas
• Notificaciones automáticas
• Panel administrativo completo
• Estadísticas en tiempo real

${isAuth ? 'Como administrador, puedes gestionar turnos, pacientes y consultorios desde el dashboard.' : 'Para tomar un turno, ve a la sección "Tomar Turno" y selecciona tu especialidad.'}`;
        }

        // Respuestas sobre turnos
        if (lowerQuestion.includes('turno') || lowerQuestion.includes('cita') || lowerQuestion.includes('reservar')) {
            return `Para tomar un turno en MediQueue:

1️⃣ **Selecciona tu especialidad** (Medicina General, Cardiología, etc.)
2️⃣ **Elige fecha y horario** disponible
3️⃣ **Completa tus datos** personales
4️⃣ **Confirma tu turno** y recibe notificación

${isAuth ? 'Como administrador, puedes gestionar todos los turnos desde el panel de administración.' : 'Ve a la página "Tomar Turno" para comenzar el proceso de reserva.'}`;
        }

        // Respuestas sobre especialidades
        if (lowerQuestion.includes('especialidad') || lowerQuestion.includes('doctor') || lowerQuestion.includes('médico')) {
            return `En MediQueue tenemos las siguientes especialidades médicas:

🩺 **Medicina General** - Consultas de atención primaria
❤️ **Cardiología** - Especialista en enfermedades del corazón
🦴 **Traumatología** - Tratamiento de lesiones y fracturas
👶 **Pediatría** - Atención médica infantil
👁️ **Oftalmología** - Cuidado de la salud visual
🥗 **Nutrición** - Asesoramiento nutricional

Cada especialidad tiene horarios específicos y profesionales especializados.`;
        }

        // Respuestas sobre administración
        if (lowerQuestion.includes('admin') || lowerQuestion.includes('administrar') || lowerQuestion.includes('dashboard')) {
            if (isAuth) {
                return `Como administrador de MediQueue, tienes acceso a:

📊 **Dashboard** - Estadísticas y métricas en tiempo real
👥 **Gestión de usuarios** - Administrar cuentas de administradores
📅 **Gestión de turnos** - Administrar citas médicas
🏥 **Consultorios** - Configurar espacios médicos
👤 **Pacientes** - Administrar información de pacientes
📈 **Estadísticas** - Reportes y métricas del sistema
⚙️ **Configuración** - Ajustes del sistema

Navega por el menú lateral para acceder a cada sección.`;
            } else {
                return `El panel de administración de MediQueue permite gestionar:

• Turnos y citas médicas
• Información de pacientes
• Configuración de consultorios
• Estadísticas del sistema
• Usuarios administradores

Para acceder, necesitas iniciar sesión como administrador.`;
            }
        }

        // Respuestas sobre salud general
        if (lowerQuestion.includes('salud') || lowerQuestion.includes('síntoma') || lowerQuestion.includes('enfermedad')) {
            return `Para consultas de salud específicas, te recomiendo:

🏥 **Consulta médica presencial** - Para diagnóstico y tratamiento
📞 **Emergencias** - Llama al 911 en caso de urgencia
💊 **Medicamentos** - Consulta con tu médico sobre medicación
📋 **Historial médico** - Mantén un registro de tus consultas

MediQueue te ayuda a gestionar tus turnos médicos, pero para diagnósticos específicos siempre consulta con un profesional médico.`;
        }

        // Respuestas sobre ayuda general
        if (lowerQuestion.includes('ayuda') || lowerQuestion.includes('help') || lowerQuestion.includes('como usar')) {
            return `¡Estoy aquí para ayudarte! Puedo asistirte con:

🔍 **Información sobre MediQueue** - Funcionalidades y características
📅 **Proceso de turnos** - Cómo reservar y gestionar citas
🏥 **Especialidades médicas** - Información sobre cada área
⚙️ **Panel administrativo** - ${isAuth ? 'Gestión completa del sistema' : 'Acceso para administradores'}
📞 **Soporte técnico** - Resolución de problemas

¿Hay algo específico en lo que pueda ayudarte?`;
        }

        // Respuesta por defecto
        return `Gracias por tu consulta. Como asistente virtual de MediQueue, puedo ayudarte con:

• Información sobre el sistema de turnos médicos
• Especialidades disponibles
• Proceso de reserva de citas
• ${isAuth ? 'Gestión administrativa' : 'Orientación para pacientes'}

¿Podrías ser más específico sobre lo que necesitas? Estoy aquí para ayudarte.`;
    };

    // Paleta de colores médica de MediQueue
    const colors = {
        primary: '#77b8ce',      // Azul médico principal
        primaryLight: '#a8d1e0', // Azul claro
        primaryDark: '#5a9bb0',  // Azul oscuro
        secondary: '#6c757d',    // Gris médico
        accent: '#28a745',       // Verde médico (salud)
        white: '#ffffff',
        background: '#f8f9fa',
        textPrimary: '#2c3e50',
        textSecondary: '#6c757d',
        gray100: '#f8f9fa',
        gray200: '#e9ecef',
        gray300: '#dee2e6',
        gray400: '#ced4da',
        gray600: '#6c757d',
        gray700: '#495057',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    // Mostrar mensaje promocional después de unos segundos si el chat está cerrado
    useEffect(() => {
        if (!open && !sessionStorage.getItem('mediqueueChatbotHelpDismissed')) {
            // Mostrar mensaje promocional después de un tiempo
            promoTimeoutRef.current = setTimeout(() => {
                setShowPromo(true);
                setPromoAnimation('slideIn');
            }, 3000); // Mostrar después de 3 segundos

            // Ocultar mensaje promocional después de un tiempo si el usuario no interactúa
            const hideTimeout = setTimeout(() => {
                if (showPromo) {
                    handleClosePromo();
                }
            }, 15000); // Ocultar después de 15 segundos si no hay interacción

            return () => {
                clearTimeout(promoTimeoutRef.current);
                clearTimeout(hideTimeout);
            };
        } else {
            // Si el chat se abre, ocultar el mensaje promocional
            if (showPromo) {
                handleClosePromo();
            }
        }
    }, [open, showPromo]);

    // Cerrar el mensaje promocional con animación
    const handleClosePromo = () => {
        sessionStorage.setItem('mediqueueChatbotHelpDismissed', 'true');
        setPromoAnimation('slideOut');
        setTimeout(() => {
            setShowPromo(false);
            setPromoAnimation('');
        }, 300); // Duración de la animación
    };

    // Abrir el chat desde el mensaje promocional
    const handleOpenChatFromPromo = () => {
        sessionStorage.setItem('mediqueueChatbotHelpDismissed', 'true');
        handleClosePromo();
        setOpen(true);
    };

    // Detectar click fuera del chat para cerrarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (open && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Detectar click fuera del mensaje promocional para cerrarlo
    useEffect(() => {
        const handleClickOutsidePromo = (event) => {
            if (showPromo && promoRef.current && !promoRef.current.contains(event.target)) {
                handleClosePromo();
            }
        };

        if (showPromo) {
            document.addEventListener('mousedown', handleClickOutsidePromo);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsidePromo);
        };
    }, [showPromo]);

    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        // Enfocar el input cuando se abre el chat
        if (open && inputRef.current && !minimized) {
            inputRef.current.focus();
        }
    }, [messages, open, minimized]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { sender: 'user', text: input };
        setMessages((msgs) => [...msgs, userMessage]);
        setInput('');
        setLoading(true);
        setTyping(true);

        // Contexto detallado de MediQueue con información de página actual
        const currentPageContext = getPageContext();
        const mediQueueContext = `
CONTEXTO COMPLETO DE MEDIQUEUE:

MediQueue es un sistema de gestión de turnos médicos que incluye:

🏥 ESPECIALIDADES MÉDICAS DISPONIBLES:
- Medicina General
- Cardiología  
- Traumatología
- Pediatría
- Oftalmología
- Nutrición

📅 FUNCIONALIDADES DEL SISTEMA:
- Reserva de turnos médicos online
- Gestión de pacientes
- Panel administrativo para médicos
- Estadísticas de turnos
- Notificaciones automáticas
- Sistema de colas inteligente

👥 USUARIOS DEL SISTEMA:
- Pacientes: Pueden reservar turnos, ver su historial
- Administradores: Gestionan turnos, pacientes, consultorios
- Médicos: Acceden a su agenda y pacientes

🔧 CARACTERÍSTICAS TÉCNICAS:
- Interfaz moderna y responsive
- Sistema de autenticación seguro
- Dashboard administrativo completo
- Gestión de múltiples consultorios
- Reportes y estadísticas en tiempo real

📍 CONTEXTO DE PÁGINA ACTUAL:
El usuario está en: ${currentPageContext}

👤 ESTADO DEL USUARIO:
- Autenticado: ${isAuthenticated ? 'Sí' : 'No'}
- Tipo de usuario: ${isAuthenticated ? (user?.role || 'Administrador') : 'Visitante'}
- Nombre: ${isAuthenticated ? (user?.nombre || 'Usuario') : 'No autenticado'}

PREGUNTA DEL USUARIO: ${input}

INSTRUCCIONES: Responde como asistente virtual de MediQueue. Considera el contexto de la página actual para dar respuestas más específicas y útiles. Proporciona información útil sobre el sistema de turnos médicos, especialidades disponibles, y cómo usar la plataforma. Si la pregunta es sobre salud específica, orienta hacia consulta médica profesional.
    `;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: mediQueueContext
                })
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();

            // Simular efecto de escritura
            setTimeout(() => {
                setTyping(false);
                setMessages((msgs) => [
                    ...msgs,
                    { sender: 'bot', text: data.response || 'No he podido responderte en este momento. Te recomiendo consultar con un profesional médico para información específica.' }
                ]);
            }, 500);
        } catch (err) {
            console.log('Error de API, usando respuestas locales:', err.message);

            // Respuestas locales inteligentes basadas en la pregunta
            const localResponse = getLocalResponse(input, currentPageContext, isAuthenticated);

            setTyping(false);
            setMessages((msgs) => [
                ...msgs,
                { sender: 'bot', text: localResponse }
            ]);
        }
        setLoading(false);
    };

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    // Estilos en línea adaptados a la temática médica de MediQueue
    const styles = {
        container: {
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        toggle: {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.white,
            border: 'none',
            borderRadius: '50%',
            width: 60,
            height: 60,
            fontSize: '1.5rem',
            boxShadow: '0 4px 15px rgba(119, 184, 206, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateZ(0)',
        },
        toggleIcon: {
            fontSize: '1.5rem',
            transition: 'transform 0.3s ease',
            animation: 'pulse 2s infinite'
        },
        promoMessage: {
            position: 'absolute',
            bottom: 75,
            right: 10,
            background: colors.white,
            color: colors.textPrimary,
            padding: '12px 16px',
            borderRadius: 15,
            boxShadow: '0 4px 15px rgba(119, 184, 206, 0.15)',
            maxWidth: 220,
            fontSize: '0.9rem',
            border: `1px solid ${colors.primary}`,
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            cursor: 'pointer',
            transform: promoAnimation === 'slideOut'
                ? 'translateX(100%) scale(0.9)'
                : promoAnimation === 'slideIn'
                    ? 'translateX(0) scale(1)'
                    : 'translateX(100%) scale(0.9)',
            opacity: promoAnimation === 'slideOut' ? 0 : 1,
            transformOrigin: 'bottom right'
        },
        promoHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            color: colors.primary
        },
        promoIcon: {
            color: colors.accent,
            fontSize: '1.1rem',
            animation: 'bounce 2s infinite'
        },
        promoClose: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: colors.gray400,
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            transition: 'all 0.2s ease',
            zIndex: 10,
        },
        promoTip: {
            marginTop: '4px',
            fontSize: '0.8rem',
            color: colors.gray600,
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        window: {
            width: 360,
            height: minimized ? 60 : 500,
            background: colors.white,
            borderRadius: 20,
            boxShadow: '0 8px 30px rgba(119, 184, 206, 0.12), 0 2px 8px rgba(119, 184, 206, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            border: `1px solid ${colors.primary}`
        },
        header: {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.white,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colors.primaryLight}`,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        headerTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '1.1rem',
        },
        headerIcon: {
            fontSize: '1.2rem',
        },
        headerControls: {
            display: 'flex',
            gap: '10px',
        },
        controlButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
            color: colors.white,
        },
        messages: {
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            background: colors.background,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'all 0.2s ease',
            opacity: minimized ? 0 : 1,
            maxHeight: minimized ? 0 : '100%',
        },
        message: {
            maxWidth: '85%',
            padding: '10px 14px',
            borderRadius: 18,
            fontSize: '0.95rem',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            position: 'relative',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            animation: 'fadeIn 0.3s ease',
        },
        user: {
            alignSelf: 'flex-end',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.white,
            borderBottomRightRadius: 5,
        },
        bot: {
            alignSelf: 'flex-start',
            background: `linear-gradient(135deg, ${colors.gray100} 0%, ${colors.gray200} 100%)`,
            color: colors.textPrimary,
            borderBottomLeftRadius: 5,
        },
        messageIcon: {
            position: 'absolute',
            top: -15,
            left: -8,
            background: colors.gray100,
            borderRadius: '50%',
            padding: 5,
            fontSize: '0.8rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
        },
        userIcon: {
            left: 'auto',
            right: -5,
            background: colors.primary,
            color: colors.white,
        },
        typingIndicator: {
            alignSelf: 'flex-start',
            background: colors.gray200,
            borderRadius: 18,
            padding: '8px 16px',
            color: colors.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
        dot: {
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors.primary,
            opacity: 0.7,
        },
        dot1: {
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0s',
        },
        dot2: {
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.2s',
        },
        dot3: {
            animation: 'bounce 1.4s infinite ease-in-out',
            animationDelay: '0.4s',
        },
        inputArea: {
            display: 'flex',
            padding: '12px 16px',
            background: colors.gray100,
            borderTop: `1px solid ${colors.gray200}`,
            transition: 'all 0.2s ease',
            opacity: minimized ? 0 : 1,
            maxHeight: minimized ? 0 : 60,
            overflow: 'hidden',
        },
        inputWrapper: {
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: colors.white,
            borderRadius: 30,
            border: `1px solid ${colors.gray200}`,
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
        input: {
            flex: 1,
            border: 'none',
            borderRadius: 30,
            padding: '10px 14px',
            fontSize: '0.95rem',
            outline: 'none',
            background: 'transparent',
            color: colors.textPrimary,
        },
        sendBtn: {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            color: colors.white,
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading || !input.trim() ? 0.7 : 1,
            marginLeft: 8,
            boxShadow: '0 2px 5px rgba(119, 184, 206, 0.2)',
            transform: loading || !input.trim() ? 'scale(0.95)' : 'scale(1)',
        },
        sendIcon: {
            fontSize: '1rem',
        },
        spinner: {
            animation: 'spin 1s linear infinite',
        }
    };

    // Aplicar estilos CSS para animaciones
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes floatUpDown {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      .mediqueue-chatbot-toggle-icon {
        animation: pulse 2s infinite;
      }
      .mediqueue-chatbot-message {
        animation: fadeIn 0.3s ease;
      }
      .mediqueue-chatbot-dot-1 {
        animation: bounce 1.4s infinite ease-in-out;
        animation-delay: 0s;
      }
      .mediqueue-chatbot-dot-2 {
        animation: bounce 1.4s infinite ease-in-out;
        animation-delay: 0.2s;
      }
      .mediqueue-chatbot-dot-3 {
        animation: bounce 1.4s infinite ease-in-out;
        animation-delay: 0.4s;
      }
      .mediqueue-chatbot-spinner {
        animation: spin 1s linear infinite;
      }
      .mediqueue-chatbot-promo-icon {
        animation: floatUpDown 2s infinite ease-in-out;
      }
      .mediqueue-chatbot-toggle:hover {
        transform: scale(1.05) translateZ(0);
        box-shadow: 0 6px 20px rgba(119, 184, 206, 0.4);
      }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return (
        <div style={styles.container}>
            {open ? (
                <div ref={chatWindowRef} style={styles.window}>
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>
                            <MdLocalHospital style={styles.headerIcon} />
                            <span>Asistente MediQueue</span>
                        </div>
                        <div style={styles.headerControls}>
                            <button
                                onClick={toggleMinimize}
                                style={styles.controlButton}
                                title={minimized ? "Expandir" : "Minimizar"}
                            >
                                <BsArrowUp style={{ transform: minimized ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                style={styles.controlButton}
                                title="Cerrar"
                            >
                                <MdClose />
                            </button>
                        </div>
                    </div>

                    {!minimized && (
                        <div style={styles.messages}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className="mediqueue-chatbot-message"
                                    style={{
                                        ...styles.message,
                                        ...(msg.sender === 'user' ? styles.user : styles.bot)
                                    }}
                                >
                                    <div
                                        style={{
                                            ...styles.messageIcon,
                                            ...(msg.sender === 'user' ? styles.userIcon : {})
                                        }}
                                    >
                                        {msg.sender === 'user' ? <FaUser /> : <FaUserMd />}
                                    </div>
                                    {msg.text}
                                </div>
                            ))}

                            {typing && (
                                <div style={styles.typingIndicator}>
                                    <span>Escribiendo</span>
                                    <div className="mediqueue-chatbot-dot-1" style={{ ...styles.dot, ...styles.dot1 }}></div>
                                    <div className="mediqueue-chatbot-dot-2" style={{ ...styles.dot, ...styles.dot2 }}></div>
                                    <div className="mediqueue-chatbot-dot-3" style={{ ...styles.dot, ...styles.dot3 }}></div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {!minimized && (
                        <form style={styles.inputArea} onSubmit={sendMessage}>
                            <div style={styles.inputWrapper}>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Pregúntame sobre turnos, especialidades médicas o salud..."
                                    disabled={loading}
                                    style={styles.input}
                                    ref={inputRef}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                style={styles.sendBtn}
                                title="Enviar mensaje"
                            >
                                {loading ?
                                    <FaSpinner className="mediqueue-chatbot-spinner" style={styles.sendIcon} /> :
                                    <MdSend style={styles.sendIcon} />
                                }
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <>
                    {/* Mensaje promocional médico */}
                    {showPromo && (
                        <div ref={promoRef} style={styles.promoMessage} className="mediqueue-chatbot-promo">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClosePromo();
                                }}
                                style={styles.promoClose}
                                title="Cerrar mensaje"
                            >
                                <MdClose />
                            </button>
                            <div style={styles.promoHeader}>
                                <FaHeart className="mediqueue-chatbot-promo-icon" style={styles.promoIcon} />
                                <span>¿Necesitas ayuda médica?</span>
                            </div>
                            <p>¡Hola! Soy tu asistente virtual de MediQueue. Puedo ayudarte con información médica general y gestión de turnos.</p>
                            <div style={{
                                marginTop: '8px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenChatFromPromo();
                                    }}
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                                        color: colors.white,
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(119, 184, 206, 0.2)',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <BsChatDots size={14} />
                                    Consultar ahora
                                </button>
                            </div>
                            <div style={styles.promoTip}>
                                <FaStethoscope size={12} />
                                <span>Información médica 24/7</span>
                            </div>
                        </div>
                    )}

                    <button
                        className="mediqueue-chatbot-toggle"
                        style={styles.toggle}
                        onClick={() => setOpen(true)}
                        title="Abrir asistente médico MediQueue"
                    >
                        <FaStethoscope className="mediqueue-chatbot-toggle-icon" style={styles.toggleIcon} />
                    </button>
                </>
            )}
        </div>
    );
};

export default Chatbot;
