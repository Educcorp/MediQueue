import React, { useState } from 'react';
import { printThermalTicket } from '../services/ticketService';
import ThermalTicketPreview from '../components/ThermalTicketPreview';
import './TicketTestPage.css';

/**
 * Página de prueba para tickets térmicos de 58mm
 * Úsala para verificar que la impresora funciona correctamente
 */
const TicketTestPage = () => {
    const [showPreview, setShowPreview] = useState(false);
    const [testData, setTestData] = useState({
        numero_turno: 'M3',
        area_nombre: 'Medicina General',
        consultorio_numero: 1,
        fecha_creacion: new Date().toISOString()
    });

    const handlePrintTest = () => {
        printThermalTicket(testData);
    };

    const handlePreview = () => {
        setShowPreview(true);
    };

    const handleChangeNumero = (e) => {
        setTestData({
            ...testData,
            numero_turno: e.target.value
        });
    };

    const handleChangeArea = (e) => {
        setTestData({
            ...testData,
            area_nombre: e.target.value
        });
    };

    const handleChangeConsultorio = (e) => {
        setTestData({
            ...testData,
            consultorio_numero: parseInt(e.target.value) || null
        });
    };

    const ejemplos = [
        {
            numero_turno: 'M1',
            area_nombre: 'Medicina General',
            consultorio_numero: 1
        },
        {
            numero_turno: 'C5',
            area_nombre: 'Cardiología',
            consultorio_numero: 2
        },
        {
            numero_turno: 'P12',
            area_nombre: 'Pediatría',
            consultorio_numero: 3
        },
        {
            numero_turno: 'T8',
            area_nombre: 'Traumatología',
            consultorio_numero: 4
        }
    ];

    const cargarEjemplo = (ejemplo) => {
        setTestData({
            ...ejemplo,
            fecha_creacion: new Date().toISOString()
        });
    };

    return (
        <div className="ticket-test-page">
            <div className="test-container">
                <h1>🖨️ Prueba de Impresora Térmica 58mm</h1>
                <p className="subtitle">Configura y prueba tickets para tu impresora MERION</p>

                <div className="test-grid">
                    {/* Panel de configuración */}
                    <div className="config-panel">
                        <h2>⚙️ Configuración del Ticket</h2>
                        
                        <div className="form-group">
                            <label>Número de Turno:</label>
                            <input
                                type="text"
                                value={testData.numero_turno}
                                onChange={handleChangeNumero}
                                placeholder="Ej: M3, C1, P5"
                                maxLength="5"
                            />
                        </div>

                        <div className="form-group">
                            <label>Área/Especialidad:</label>
                            <select value={testData.area_nombre} onChange={handleChangeArea}>
                                <option value="Medicina General">Medicina General</option>
                                <option value="Cardiología">Cardiología</option>
                                <option value="Pediatría">Pediatría</option>
                                <option value="Traumatología">Traumatología</option>
                                <option value="Oftalmología">Oftalmología</option>
                                <option value="Nutrición">Nutrición</option>
                                <option value="Dermatología">Dermatología</option>
                                <option value="Ginecología">Ginecología</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Número de Consultorio:</label>
                            <input
                                type="number"
                                value={testData.consultorio_numero || ''}
                                onChange={handleChangeConsultorio}
                                placeholder="1-10"
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className="action-buttons">
                            <button 
                                className="btn btn-preview" 
                                onClick={handlePreview}
                            >
                                👁️ Vista Previa
                            </button>
                            <button 
                                className="btn btn-print" 
                                onClick={handlePrintTest}
                            >
                                🖨️ Imprimir Prueba
                            </button>
                        </div>
                    </div>

                    {/* Panel de ejemplos */}
                    <div className="examples-panel">
                        <h2>📋 Ejemplos Rápidos</h2>
                        <p className="examples-subtitle">Haz clic para cargar y probar</p>
                        
                        <div className="examples-grid">
                            {ejemplos.map((ejemplo, index) => (
                                <div 
                                    key={index}
                                    className="example-card"
                                    onClick={() => cargarEjemplo(ejemplo)}
                                >
                                    <div className="example-number">{ejemplo.numero_turno}</div>
                                    <div className="example-area">{ejemplo.area_nombre}</div>
                                    <div className="example-consultorio">
                                        Consultorio {ejemplo.consultorio_numero}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Información de la impresora */}
                <div className="printer-info">
                    <h2>📄 Especificaciones de la Impresora</h2>
                    <div className="specs-grid">
                        <div className="spec-item">
                            <strong>Modelo:</strong>
                            <span>MERION Thermal Printer</span>
                        </div>
                        <div className="spec-item">
                            <strong>Ancho de Papel:</strong>
                            <span>58mm (57mm x 30mm diámetro)</span>
                        </div>
                        <div className="spec-item">
                            <strong>Resolución:</strong>
                            <span>203dpi</span>
                        </div>
                        <div className="spec-item">
                            <strong>Velocidad:</strong>
                            <span>50 mm/s</span>
                        </div>
                        <div className="spec-item">
                            <strong>Tipo de Impresión:</strong>
                            <span>Térmica (sin tinta)</span>
                        </div>
                        <div className="spec-item">
                            <strong>Interfaz:</strong>
                            <span>USB / Bluetooth</span>
                        </div>
                    </div>
                </div>

                {/* Instrucciones de configuración */}
                <div className="setup-instructions">
                    <h2>🔧 Configuración Rápida</h2>
                    <ol>
                        <li>Conecta la impresora vía USB a tu computadora</li>
                        <li>Instala los drivers desde el CD o descarga de internet</li>
                        <li>Configura el tamaño de papel en 58mm x Auto</li>
                        <li>Establece los márgenes en 0</li>
                        <li>Haz clic en "Imprimir Prueba" para verificar</li>
                    </ol>
                    <p className="help-text">
                        ℹ️ Para más detalles, consulta <a href="/docs/thermal-printer">la documentación completa</a>
                    </p>
                </div>

                {/* Solución de problemas */}
                <div className="troubleshooting">
                    <h2>❓ Solución de Problemas</h2>
                    <div className="problem-solution">
                        <div className="problem">
                            <strong>Problema:</strong> El ticket no se imprime
                        </div>
                        <div className="solution">
                            <strong>Solución:</strong> Verifica que la impresora esté encendida, 
                            conectada y configurada como predeterminada en tu sistema
                        </div>
                    </div>
                    <div className="problem-solution">
                        <div className="problem">
                            <strong>Problema:</strong> El formato se ve cortado
                        </div>
                        <div className="solution">
                            <strong>Solución:</strong> Asegúrate de que el tamaño de papel 
                            esté configurado en 58mm y los márgenes en 0
                        </div>
                    </div>
                    <div className="problem-solution">
                        <div className="problem">
                            <strong>Problema:</strong> El texto sale borroso
                        </div>
                        <div className="solution">
                            <strong>Solución:</strong> Limpia el cabezal térmico y 
                            verifica que estés usando papel térmico de calidad
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <ThermalTicketPreview 
                    turnData={testData}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
};

export default TicketTestPage;
