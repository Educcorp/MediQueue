/**
 * Genera e imprime ticket térmico de 58mm directamente en la impresora
 * Optimizado para impresoras térmicas MERION y similares (58mm, B/N, 203dpi)
 * Usa iframe oculto para impresión completamente invisible
 */
export const printThermalTicket = (turnData) => {
    try {
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

        // HTML optimizado para impresión térmica 58mm - Diseño minimalista compacto
        const ticketHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Ticket ${turnData.numero_turno}</title>
    <style>
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
            font-family: 'Courier New', Courier, monospace;
            font-size: 9pt;
            font-weight: bold;
            color: #000;
            background: #fff;
            padding: 1mm 4mm;
        }
        
        /* Decoración superior */
        .deco-top {
            text-align: center;
            font-size: 6pt;
            margin-bottom: 0.5mm;
        }
        
        /* Título principal compacto */
        .title {
            text-align: center;
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: 0px;
            margin-bottom: 0mm;
        }
        
        .subtitle {
            text-align: center;
            font-size: 6pt;
            margin-bottom: 1mm;
        }
        
        .divider {
            text-align: center;
            font-size: 5pt;
            margin: 0;
        }
        
        /* Número de turno - Grande y destacado con fondo NEGRO para impresión */
        .turn-box {
            text-align: center;
            border: 3px solid #000;
            padding: 2mm 4mm;
            margin: 0;
            background-color: #000 !important;
            color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        .turn-label {
            font-size: 7pt;
            margin-bottom: 0.5mm;
            color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        .turn-number {
            font-size: 22pt;
            font-weight: bold;
            line-height: 1;
            letter-spacing: 0px;
            color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* Información compacta */
        .info {
            font-size: 7pt;
            margin: 0;
        }
        
        .info-row {
            text-align: center;
            margin: 0.5mm 0;
            padding: 0.3mm 0;
            border-bottom: 1px solid #000;
        }
        
        .label {
            font-weight: bold;
            font-size: 7pt;
        }
        
        .value {
            font-size: 7pt;
        }
        
        /* Instrucciones minimalistas */
        .instructions {
            border: 1px solid #000;
            padding: 1mm;
            margin: 0;
            font-size: 5.5pt;
            line-height: 1.3;
        }
        
        .inst-title {
            text-align: center;
            font-size: 6pt;
            font-weight: bold;
            margin-bottom: 0.5mm;
            padding-bottom: 0.5mm;
            border-bottom: 1px solid #000;
        }
        
        .inst-list {
            list-style: none;
            text-align: left;
        }
        
        .inst-list li {
            margin: 0.5mm 0;
            display: block;
        }
        
        .inst-list li:before {
            content: "◆ ";
        }
        
        /* Footer minimalista */
        .footer {
            text-align: center;
            font-size: 5pt;
            margin: 0;
            padding-top: 0.5mm;
        }
        
        .deco-bottom {
            text-align: center;
            font-size: 6pt;
            margin: 0;
        }
    </style>
</head>
<body>
    <!-- Decoración superior -->
    <div class="deco-top">╔═══════════════════╗</div>
    
    <!-- Título -->
    <div class="title">MEDIQUEUE</div>
    <div class="subtitle">Sistema de Turnos Médicos</div>
    
    <div class="divider">─────────────────────</div>
    
    <!-- Número de turno -->
    <div class="turn-box">
        <div class="turn-label">TURNO N°</div>
        <div class="turn-number">${turnData.numero_turno || 'N/A'}</div>
    </div>
    
    <div class="divider">─────────────────────</div>
    
    <!-- Información del turno -->
    <div class="info">
        <div class="info-row">
            <span class="label">ÁREA:</span> ${turnData.area_nombre || 'General'}
        </div>
        
        ${turnData.consultorio_numero ? `
        <div class="info-row">
            <span class="label">CONSULTORIO:</span> ${turnData.consultorio_numero}
        </div>
        ` : ''}
        
        <div class="info-row">
            <span class="label">FECHA:</span> ${fecha}
        </div>
        
        <div class="info-row">
            <span class="label">HORA:</span> ${hora}
        </div>
    </div>
    
    <div class="divider">─────────────────────</div>
    
    <!-- Instrucciones -->
    <div class="instructions">
        <div class="inst-title">INSTRUCCIONES</div>
        <ul class="inst-list">
            <li>Conserve ticket hasta ser atendido</li>
            <li>Esté atento al llamado</li>
            <li>Presente ticket al ser llamado</li>
            <li>Turno reasignado si ausente</li>
        </ul>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        Gracias por utilizar MediQueue<br>
        www.mediqueue.app
    </div>
    
    <!-- Decoración inferior -->
    <div class="deco-bottom">╚═══════════════════╝</div>
    
    <script>
        // Con --kiosk-printing, la impresión se activa automáticamente
        // al cargar el documento, sin necesidad de window.print()
        window.onload = function() {
            // El navegador en modo kiosk-printing detecta automáticamente
            // el contenido y lo envía a la impresora predeterminada
            setTimeout(function() {
                if (window.print) {
                    window.print();
                }
            }, 50);
        };
        
        // Cerrar después de imprimir
        window.onafterprint = function() {
            setTimeout(function() {
                if (window.close) {
                    window.close();
                }
            }, 50);
        };
    </script>
</body>
</html>`;

        // Crear iframe completamente oculto para impresión silenciosa
        let printFrame = document.getElementById('thermal-print-frame');
        
        // Si no existe, crear el iframe
        if (!printFrame) {
            printFrame = document.createElement('iframe');
            printFrame.id = 'thermal-print-frame';
            printFrame.name = 'thermal-print-frame';
            
            // Estilos para hacer el iframe completamente invisible
            printFrame.style.cssText = `
                position: fixed !important;
                top: -99999px !important;
                left: -99999px !important;
                width: 0 !important;
                height: 0 !important;
                opacity: 0 !important;
                visibility: hidden !important;
                display: none !important;
                border: none !important;
                z-index: -9999 !important;
                pointer-events: none !important;
            `;
            
            // Atributos adicionales para seguridad
            printFrame.setAttribute('aria-hidden', 'true');
            printFrame.setAttribute('tabindex', '-1');
            
            document.body.appendChild(printFrame);
        }

        // Escribir contenido en el iframe
        const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
        const doc = frameDoc.document || frameDoc;
        
        doc.open();
        doc.write(ticketHTML);
        doc.close();

        console.log('✅ Ticket térmico enviado a impresora (iframe oculto)');
        return true;

    } catch (error) {
        console.error('❌ Error al imprimir ticket térmico:', error);
        throw error;
    }
};
