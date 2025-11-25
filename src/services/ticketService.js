import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera e imprime ticket térmico de 58mm directamente en la impresora
 * Optimizado para impresoras térmicas MERION y similares (58mm, B/N, 203dpi)
 */
export const printThermalTicket = (turnData) => {
    try {
        // Crear ventana de impresión con HTML optimizado para impresora térmica 58mm
        const printWindow = window.open('', '', 'width=400,height=600');
        
        if (!printWindow) {
            console.error('No se pudo abrir ventana de impresión');
            return false;
        }

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

        // HTML optimizado para impresión térmica 58mm
        const ticketHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket Turno ${turnData.numero_turno}</title>
    <style>
        /* Reset y configuración para impresora térmica de 58mm */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        @page {
            size: 58mm auto;
            margin: 0;
        }
        
        @media print {
            body {
                width: 58mm;
                margin: 0;
                padding: 0;
            }
        }
        
        body {
            width: 58mm;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            font-weight: bold;
            line-height: 1.2;
            color: #000;
            background: #fff;
            padding: 3mm;
        }
        
        /* Encabezado */
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 3mm;
            margin-bottom: 3mm;
        }
        
        .logo-text {
            font-size: 12pt;
            font-weight: bold;
            letter-spacing: 0.5px;
            margin-bottom: 1mm;
        }
        
        .subtitle {
            font-size: 7pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        /* Número de turno destacado */
        .turn-number-box {
            text-align: center;
            border: 3px solid #000;
            padding: 3mm 2mm;
            margin: 3mm 0;
            background: #f0f0f0;
        }
        
        .turn-label {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }
        
        .turn-number {
            font-size: 22pt;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        /* Información del turno */
        .info-section {
            margin: 3mm 0;
            font-size: 7pt;
            font-weight: bold;
        }
        
        .info-line {
            display: flex;
            justify-content: space-between;
            margin: 1.5mm 0;
            border-bottom: 1px dashed #000;
            padding-bottom: 1mm;
        }
        
        .info-label {
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .info-value {
            text-align: right;
            font-weight: bold;
        }
        
        /* Instrucciones */
        .instructions {
            margin-top: 3mm;
            padding: 2mm;
            border: 2px solid #000;
            background: #f5f5f5;
        }
        
        .instructions-title {
            font-size: 7pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 2mm;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
        }
        
        .instructions ul {
            list-style: none;
            font-size: 6pt;
            font-weight: bold;
            line-height: 1.3;
        }
        
        .instructions li {
            margin: 1mm 0;
            padding-left: 2mm;
        }
        
        .instructions li:before {
            content: "• ";
            font-weight: bold;
        }
        
        /* Pie de página */
        .footer {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 2px dashed #000;
            text-align: center;
            font-size: 6pt;
            font-weight: bold;
        }
        
        .footer-line {
            margin: 1mm 0;
        }
        
        /* Línea de corte */
        .cut-line {
            margin-top: 4mm;
            text-align: center;
            font-size: 7pt;
            border-top: 1px dashed #000;
            padding-top: 2mm;
        }
    </style>
</head>
<body>
    <!-- ENCABEZADO -->
    <div class="header">
        <div class="logo-text">MEDIQUEUE</div>
        <div class="subtitle">Sistema de Turnos Médicos</div>
    </div>
    
    <!-- NÚMERO DE TURNO -->
    <div class="turn-number-box">
        <div class="turn-label">TURNO N°</div>
        <div class="turn-number">${turnData.numero_turno || 'N/A'}</div>
    </div>
    
    <!-- INFORMACIÓN DEL TURNO -->
    <div class="info-section">
        <div class="info-line">
            <span class="info-label">Área:</span>
            <span class="info-value">${turnData.area_nombre || 'General'}</span>
        </div>
        
        ${turnData.consultorio_numero ? `
        <div class="info-line">
            <span class="info-label">Consultorio:</span>
            <span class="info-value">Consultorio ${turnData.consultorio_numero}</span>
        </div>
        ` : ''}
        
        <div class="info-line">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${fecha}</span>
        </div>
        
        <div class="info-line">
            <span class="info-label">Hora:</span>
            <span class="info-value">${hora}</span>
        </div>
    </div>
    
    <!-- INSTRUCCIONES -->
    <div class="instructions">
        <div class="instructions-title">Instrucciones:</div>
        <ul>
            <li>Conserve este ticket hasta ser atendido</li>
            <li>Esté atento al llamado de su turno</li>
            <li>Presente este ticket al ser llamado</li>
            <li>En caso de ausencia, el turno será reasignado automáticamente</li>
        </ul>
    </div>
    
    <!-- PIE DE PÁGINA -->
    <div class="footer">
        <div class="footer-line">Gracias por utilizar MediQueue</div>
        <div class="footer-line">www.mediqueue.com</div>
    </div>
    
    <!-- LÍNEA DE CORTE -->
    <div class="cut-line">✂ ----------------------- ✂</div>
    
    <script>
        // Imprimir automáticamente al cargar
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Cerrar ventana después de imprimir
                setTimeout(function() {
                    window.close();
                }, 500);
            }, 250);
        };
    </script>
</body>
</html>`;

        printWindow.document.write(ticketHTML);
        printWindow.document.close();

        console.log('✅ Ticket térmico enviado a impresora');
        return true;

    } catch (error) {
        console.error('❌ Error al imprimir ticket térmico:', error);
        throw error;
    }
};

/**
 * Genera y descarga automáticamente un ticket PDF para un turno
 * Formato similar a los tickets bancarios con diseño profesional
 * (Mantiene compatibilidad con versión anterior para descargas)
 */
export const generateTurnTicket = (turnData) => {
    try {
        // Crear nuevo documento PDF - tamaño ticket (80mm x variable)
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 200] // Ancho de ticket térmico estándar
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 10;

        // ==================== ENCABEZADO CON LOGO ====================
        doc.setFillColor(41, 128, 185); // Azul corporativo
        doc.rect(0, 0, pageWidth, 30, 'F');

        // Intentar cargar el logo de MediQueue
        try {
            const logoImg = new Image();
            logoImg.src = '/images/mediqueue_logo.png';
            // Logo centrado en el encabezado (tamaño reducido para ticket)
            doc.addImage(logoImg, 'PNG', pageWidth / 2 - 10, 5, 20, 8);
        } catch (e) {
            console.log('Logo no disponible, usando texto');
        }

        // Título principal debajo del logo
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('MEDIQUEUE', pageWidth / 2, 18, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Sistema de Turnos Médicos', pageWidth / 2, 24, { align: 'center' });

        yPosition = 35;

        // ==================== NÚMERO DE TURNO (DESTACADO) ====================
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(5, yPosition, pageWidth - 10, 20, 2, 2, 'F');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TURNO N°', pageWidth / 2, yPosition + 7, { align: 'center' });

        doc.setFontSize(24);
        doc.setTextColor(41, 128, 185);
        doc.text(String(turnData.numero_turno || 'N/A'), pageWidth / 2, yPosition + 16, { align: 'center' });

        yPosition += 25;

        // ==================== LÍNEA SEPARADORA ====================
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 5;

        // ==================== INFORMACIÓN DEL TURNO ====================
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');

        // Función helper para añadir líneas de información
        const addInfoLine = (label, value, bold = false) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, 10, yPosition);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            const lines = doc.splitTextToSize(String(value), pageWidth - 20);
            doc.text(lines, 10, yPosition + 4);
            yPosition += 4 + (lines.length * 4);
        };

        // Área/Especialidad
        addInfoLine('ÁREA:', turnData.area_nombre || 'General');
        yPosition += 2;

        // Consultorio - Mostrar número del consultorio
        if (turnData.consultorio_numero) {
            addInfoLine('CONSULTORIO:', `Consultorio ${turnData.consultorio_numero}`);
            yPosition += 2;
        }

        // Fecha
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
        addInfoLine('FECHA:', fecha);
        yPosition += 2;

        // Hora
        const hora = turnData.fecha_creacion ?
            new Date(turnData.fecha_creacion).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
            }) :
            new Date().toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        addInfoLine('HORA:', hora);

        yPosition += 5;

        // ==================== INSTRUCCIONES ====================
        doc.setFillColor(255, 243, 205);
        doc.roundedRect(5, yPosition, pageWidth - 10, 25, 2, 2, 'F');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 80, 0);
        doc.text('INSTRUCCIONES:', pageWidth / 2, yPosition + 4, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        const instrucciones = [
            '• Conserve este ticket hasta ser atendido',
            '• Esté atento al llamado de su turno',
            '• Presente este ticket al ser llamado',
            '• En caso de ausencia, el turno será',
            '  reasignado automáticamente'
        ];

        let instructY = yPosition + 8;
        instrucciones.forEach(inst => {
            doc.text(inst, pageWidth / 2, instructY, { align: 'center' });
            instructY += 3;
        });

        yPosition += 30;

        // ==================== PIE DE PÁGINA ====================
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'italic');
        doc.text('Gracias por utilizar MediQueue', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 3;
        doc.text('www.mediqueue.com', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;

        // Línea decorativa final
        doc.setDrawColor(200, 200, 200);
        doc.setLineDash([2, 2]);
        doc.line(10, yPosition, pageWidth - 10, yPosition);

        // ==================== GENERAR Y DESCARGAR ====================
        const fileName = `Turno_${turnData.numero_turno || 'N-A'}_${fecha.replace(/\//g, '-')}.pdf`;
        doc.save(fileName);

        console.log('✅ Ticket generado y descargado:', fileName);
        return true;

    } catch (error) {
        console.error('❌ Error al generar ticket:', error);
        throw error;
    }
};

/**
 * Genera un ticket simplificado para impresión rápida
 */
export const generateSimpleTicket = (turnData) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 120]
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 10;

        // Encabezado simple
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('TURNO', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Número de turno grande
        doc.setFontSize(36);
        doc.text(String(turnData.numero_turno || 'N/A'), pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Información básica
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(turnData.paciente_nombre || 'Paciente', pageWidth / 2, y, { align: 'center' });
        y += 6;
        doc.text(turnData.area_nombre || 'Área General', pageWidth / 2, y, { align: 'center' });
        y += 6;

        const fecha = new Date().toLocaleDateString('es-AR');
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        doc.text(`${fecha} - ${hora}`, pageWidth / 2, y, { align: 'center' });

        const fileName = `Turno_${turnData.numero_turno}_simple.pdf`;
        doc.save(fileName);

        return true;
    } catch (error) {
        console.error('❌ Error al generar ticket simple:', error);
        throw error;
    }
};
