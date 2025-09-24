import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaUserShield, FaCookie, FaEye, FaDatabase, FaInfoCircle, FaChartBar } from 'react-icons/fa';
import '../styles/PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-policy">
            <div className="privacy-container">
                {/* Header */}
                <div className="privacy-header">
                    <div className="privacy-header-content">
                        <div className="privacy-icon">
                            <FaShieldAlt />
                        </div>
                        <div className="privacy-title-section">
                            <h1>Política de Privacidad</h1>
                            <p className="privacy-subtitle">
                                Protegemos tu información personal con los más altos estándares de seguridad
                            </p>
                            <div className="privacy-meta">
                                <span className="privacy-date">Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
                                <span className="privacy-version">Versión 1.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="privacy-nav">
                    <a href="#informacion-recopilada" className="privacy-nav-link"><FaDatabase /> Información Recopilada</a>
                    <a href="#uso-informacion" className="privacy-nav-link"><FaEye /> Uso de la Información</a>
                    <a href="#cookies" className="privacy-nav-link"><FaCookie /> Cookies</a>
                    <a href="#seguridad" className="privacy-nav-link"><FaLock /> Seguridad</a>
                    <a href="#derechos" className="privacy-nav-link"><FaUserShield /> Tus Derechos</a>
                    <a href="#contacto" className="privacy-nav-link"><FaInfoCircle /> Contacto</a>
                </div>

                {/* Content */}
                <div className="privacy-content">
                    {/* Introducción */}
                    <section className="privacy-section">
                        <div className="privacy-intro">
                            <h2><FaShieldAlt /> Bienvenido a MediQueue</h2>
                            <p>
                                En MediQueue, valoramos y respetamos tu privacidad. Esta Política de Privacidad explica
                                cómo recopilamos, utilizamos, almacenamos y protegemos tu información personal cuando
                                utilizas nuestro sistema de gestión de turnos médicos.
                            </p>
                            <div className="privacy-highlight">
                                <FaShieldAlt />
                                <span>Tu privacidad es nuestra prioridad. Nos comprometemos a proteger tus datos personales.</span>
                            </div>
                        </div>
                    </section>

                    {/* Información Recopilada */}
                    <section id="informacion-recopilada" className="privacy-section">
                        <h2><FaDatabase /> Información que Recopilamos</h2>

                        <div className="privacy-card">
                            <h3><FaInfoCircle /> Información Personal</h3>
                            <p>Recopilamos la siguiente información personal cuando utilizas nuestros servicios:</p>
                            <ul className="privacy-list">
                                <li><strong>Nombre y apellidos:</strong> Para identificar tu turno y personalizar el servicio</li>
                                <li><strong>Número de teléfono:</strong> Para contactarte sobre tu turno y enviar notificaciones</li>
                                <li><strong>Correo electrónico:</strong> (Opcional) Para comunicaciones importantes y recordatorios</li>
                                <li><strong>Fecha de nacimiento:</strong> Para verificar tu identidad y proporcionar atención médica apropiada</li>
                            </ul>
                        </div>

                        <div className="privacy-card">
                            <h3><FaEye /> Información Técnica</h3>
                            <p>También recopilamos información técnica para mejorar nuestros servicios:</p>
                            <ul className="privacy-list">
                                <li><strong>Dirección IP:</strong> Para seguridad y análisis de uso</li>
                                <li><strong>Navegador y dispositivo:</strong> Para optimizar la experiencia de usuario</li>
                                <li><strong>Páginas visitadas:</strong> Para mejorar la funcionalidad del sitio</li>
                                <li><strong>Fecha y hora de acceso:</strong> Para análisis de patrones de uso</li>
                            </ul>
                        </div>
                    </section>

                    {/* Uso de la Información */}
                    <section id="uso-informacion" className="privacy-section">
                        <h2><FaEye /> Cómo Utilizamos tu Información</h2>

                        <div className="privacy-grid">
                            <div className="privacy-card">
                                <h3><FaInfoCircle /> Gestión de Turnos</h3>
                                <p>Utilizamos tu información para:</p>
                                <ul>
                                    <li>Crear y gestionar tus turnos médicos</li>
                                    <li>Asignarte al consultorio y especialista apropiado</li>
                                    <li>Enviarte recordatorios de tu cita</li>
                                    <li>Notificarte cambios en tu turno</li>
                                </ul>
                            </div>

                            <div className="privacy-card">
                                <h3><FaChartBar /> Mejora del Servicio</h3>
                                <p>Analizamos los datos para:</p>
                                <ul>
                                    <li>Mejorar la funcionalidad de la plataforma</li>
                                    <li>Optimizar los tiempos de espera</li>
                                    <li>Desarrollar nuevas características</li>
                                    <li>Proporcionar mejor atención al cliente</li>
                                </ul>
                            </div>

                            <div className="privacy-card">
                                <h3><FaLock /> Seguridad y Cumplimiento</h3>
                                <p>Protegemos tu información para:</p>
                                <ul>
                                    <li>Prevenir fraudes y actividades maliciosas</li>
                                    <li>Cumplir con regulaciones médicas</li>
                                    <li>Mantener la integridad del sistema</li>
                                    <li>Auditar el uso del servicio</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section id="cookies" className="privacy-section">
                        <h2><FaCookie /> Uso de Cookies</h2>

                        <div className="privacy-card">
                            <h3><FaCookie /> ¿Qué son las Cookies?</h3>
                            <p>
                                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
                                visitas nuestro sitio web. Nos ayudan a recordar tus preferencias y mejorar tu experiencia.
                            </p>
                        </div>

                        <div className="privacy-grid">
                            <div className="privacy-card">
                                <h3><FaLock /> Cookies Esenciales</h3>
                                <p><strong>Necesarias para el funcionamiento básico:</strong></p>
                                <ul>
                                    <li>Sesión de usuario y autenticación</li>
                                    <li>Preferencias de cookies</li>
                                    <li>Seguridad y prevención de fraudes</li>
                                </ul>
                                <div className="cookie-status required">Siempre activas</div>
                            </div>

                            <div className="privacy-card">
                                <h3><FaChartBar /> Cookies Analíticas</h3>
                                <p><strong>Para mejorar nuestros servicios:</strong></p>
                                <ul>
                                    <li>Análisis de uso del sitio web</li>
                                    <li>Estadísticas de rendimiento</li>
                                    <li>Identificación de problemas técnicos</li>
                                </ul>
                                <div className="cookie-status optional">Opcionales</div>
                            </div>

                            <div className="privacy-card">
                                <h3><FaEye /> Cookies de Funcionalidad</h3>
                                <p><strong>Para personalizar tu experiencia:</strong></p>
                                <ul>
                                    <li>Recordar tus preferencias</li>
                                    <li>Configuraciones del idioma</li>
                                    <li>Personalización de la interfaz</li>
                                </ul>
                                <div className="cookie-status optional">Opcionales</div>
                            </div>
                        </div>
                    </section>

                    {/* Seguridad */}
                    <section id="seguridad" className="privacy-section">
                        <h2><FaLock /> Seguridad de tus Datos</h2>

                        <div className="privacy-card">
                            <h3><FaShieldAlt /> Medidas de Seguridad</h3>
                            <p>Implementamos múltiples capas de seguridad para proteger tu información:</p>

                            <div className="security-grid">
                                <div className="security-item">
                                    <FaLock />
                                    <h4>Encriptación SSL/TLS</h4>
                                    <p>Toda la comunicación está encriptada con certificados SSL de alta seguridad</p>
                                </div>
                                <div className="security-item">
                                    <FaDatabase />
                                    <h4>Base de Datos Segura</h4>
                                    <p>Almacenamiento en servidores seguros con acceso restringido y monitoreo 24/7</p>
                                </div>
                                <div className="security-item">
                                    <FaUserShield />
                                    <h4>Control de Acceso</h4>
                                    <p>Solo personal autorizado puede acceder a la información personal</p>
                                </div>
                                <div className="security-item">
                                    <FaShieldAlt />
                                    <h4>Auditorías Regulares</h4>
                                    <p>Revisiones periódicas de seguridad y cumplimiento de estándares</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Derechos */}
                    <section id="derechos" className="privacy-section">
                        <h2><FaUserShield /> Tus Derechos</h2>

                        <div className="privacy-card">
                            <h3><FaUserShield /> Derechos de Protección de Datos</h3>
                            <p>Tienes los siguientes derechos sobre tu información personal:</p>

                            <div className="rights-grid">
                                <div className="right-item">
                                    <h4><FaEye /> Derecho de Acceso</h4>
                                    <p>Solicitar una copia de toda la información personal que tenemos sobre ti</p>
                                </div>
                                <div className="right-item">
                                    <h4><FaInfoCircle /> Derecho de Rectificación</h4>
                                    <p>Corregir cualquier información inexacta o incompleta</p>
                                </div>
                                <div className="right-item">
                                    <h4><FaInfoCircle /> Derecho de Eliminación</h4>
                                    <p>Solicitar la eliminación de tu información personal</p>
                                </div>
                                <div className="right-item">
                                    <h4><FaInfoCircle /> Derecho de Limitación</h4>
                                    <p>Restringir el procesamiento de tu información en ciertas circunstancias</p>
                                </div>
                                <div className="right-item">
                                    <h4><FaInfoCircle /> Derecho de Portabilidad</h4>
                                    <p>Recibir tu información en un formato estructurado y legible</p>
                                </div>
                                <div className="right-item">
                                    <h4><FaInfoCircle /> Derecho de Oposición</h4>
                                    <p>Oponerte al procesamiento de tu información para ciertos propósitos</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contacto */}
                    <section id="contacto" className="privacy-section">
                        <h2><FaInfoCircle /> Contacto y Soporte</h2>

                        <div className="privacy-card">
                            <h3><FaInfoCircle /> ¿Tienes Preguntas?</h3>
                            <p>Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tu información:</p>

                            <div className="contact-info">
                                <div className="contact-item">
                                    <h4><FaInfoCircle /> Correo Electrónico</h4>
                                    <p>privacy@mediqueue.com</p>
                                </div>
                                <div className="contact-item">
                                    <h4><FaInfoCircle /> Teléfono</h4>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                                <div className="contact-item">
                                    <h4><FaInfoCircle /> Dirección</h4>
                                    <p>MediQueue Privacy Office<br />
                                        Calle de la Salud 123<br />
                                        Ciudad Médica, CM 12345</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="privacy-footer">
                        <div className="privacy-footer-content">
                            <p>
                                Esta Política de Privacidad puede actualizarse ocasionalmente. Te notificaremos
                                sobre cambios significativos a través de nuestro sitio web o por correo electrónico.
                            </p>
                            <div className="privacy-footer-actions">
                                <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
