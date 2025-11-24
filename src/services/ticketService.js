import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera y descarga automáticamente un ticket PDF para un turno
 * Formato similar a los tickets bancarios con diseño profesional
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
