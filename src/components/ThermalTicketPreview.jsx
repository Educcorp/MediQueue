import React from 'react';
import './ThermalTicketPreview.css';

/**
 * Componente para previsualizar el ticket térmico de 58mm
 * Muestra exactamente cómo se verá en la impresora térmica
 */
const ThermalTicketPreview = ({ turnData, onClose }) => {
    if (!turnData) return null;

    const fecha = turnData.fecha_creacion ?
        new Date(turnData.fecha_creacion).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) :
        new Date().toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

    const hora = turnData.fecha_creacion ?
        new Date(turnData.fecha_creacion).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        }) :
        new Date().toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        });

    return (
        <div className="thermal-preview-overlay" onClick={onClose}>
            <div className="thermal-preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="thermal-preview-header">
                    <h3>Vista Previa del Ticket</h3>
                    <button onClick={onClose} className="close-preview-btn">✕</button>
                </div>

                {/* Ticket Preview - Simulación exacta de 58mm */}
                <div className="thermal-ticket-preview">
                    {/* ENCABEZADO */}
                    <div className="header">
                        <div className="logo-text">MEDIQUEUE</div>
                        <div className="subtitle">Sistema de Turnos Médicos</div>
                    </div>

                    {/* NÚMERO DE TURNO */}
                    <div className="turn-number-box">
                        <div className="turn-label">TURNO N°</div>
                        <div className="turn-number">{turnData.numero_turno || 'N/A'}</div>
                    </div>

                    {/* INFORMACIÓN DEL TURNO */}
                    <div className="info-section">
                        <div className="info-line">
                            <span className="info-label">Área:</span>
                            <span className="info-value">{turnData.area_nombre || 'General'}</span>
                        </div>

                        {turnData.consultorio_numero && (
                            <div className="info-line">
                                <span className="info-label">Consultorio:</span>
                                <span className="info-value">Consultorio {turnData.consultorio_numero}</span>
                            </div>
                        )}

                        <div className="info-line">
                            <span className="info-label">Fecha:</span>
                            <span className="info-value">{fecha}</span>
                        </div>

                        <div className="info-line">
                            <span className="info-label">Hora:</span>
                            <span className="info-value">{hora}</span>
                        </div>
                    </div>

                    {/* INSTRUCCIONES */}
                    <div className="instructions">
                        <div className="instructions-title">Instrucciones:</div>
                        <ul>
                            <li>Conserve este ticket hasta ser atendido</li>
                            <li>Esté atento al llamado de su turno</li>
                            <li>Presente este ticket al ser llamado</li>
                            <li>En caso de ausencia, el turno será reasignado automáticamente</li>
                        </ul>
                    </div>

                    {/* PIE DE PÁGINA */}
                    <div className="footer">
                        <div className="footer-line">Gracias por utilizar MediQueue</div>
                        <div className="footer-line">www.mediqueue.com</div>
                    </div>

                    {/* LÍNEA DE CORTE */}
                    <div className="cut-line">✂ ----------------------- ✂</div>
                </div>

                <div className="thermal-preview-info">
                    <p>✓ Optimizado para impresoras térmicas de 58mm</p>
                    <p>✓ Formato en blanco y negro</p>
                    <p>✓ Resolución 203dpi</p>
                </div>
            </div>
        </div>
    );
};

export default ThermalTicketPreview;
