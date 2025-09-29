import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import './IconSelectorPopup.css';

// Importar iconos de FontAwesome - Base expandida masivamente
import {
  // Medicina General
  FaStethoscope, FaBaby, FaHeartbeat, FaUserMd, FaFemale, FaEye, FaBone, FaBrain, FaMale, FaFlask,
  FaProcedures, FaDoorOpen, FaHospital, FaAmbulance, FaSyringe, FaPrescriptionBottle, FaXRay, FaMicroscope,
  FaLungs, FaTooth, FaHandHoldingHeart, FaWheelchair, FaCrutch, FaThermometer, FaHeadSideCough, FaVials,
  
  // Símbolos médicos adicionales
  FaFirstAid, FaUserNurse, FaMedkit, FaHouseMedical, FaKitMedical, FaPills, FaBandAid, FaHeart,
  FaRibbon, FaVirus, FaShieldVirus, FaHandsWash, FaHandHoldingMedical, FaUserDoctor, FaUserInjured,
  
  // Anatomía y partes del cuerpo
  FaHandPaper, FaFist, FaHand, FaHandPointer, FaHandRock, FaHandSpock, FaEyeSlash,
  FaEyeDropper, FaTeeth, FaSmoking, FaSmokingBan, FaAllergies,
  
  // Embarazo y maternidad
  FaBabyCarriage, FaChild, FaChildren,
  
  // Frutas y alimentación  
  FaAppleAlt, FaCoffee, FaWineGlass, FaBeer, FaCocktail, FaGlassWater, FaUtensilSpoon,
  FaUtensils, FaCookie, FaBreadSlice, FaCarrot, FaPepperHot, FaCheese, FaEgg, FaFish,
  
  // Deportes y fitness
  FaRunning, FaWalking, FaBicycle, FaSwimmer, FaDumbbell, FaWeight, FaBaseballBall, FaFootballBall,
  FaBasketballBall, FaTennisball, FaVolleyballBall, FaTableTennis, FaGolfBall, FaHockeyPuck,
  
  // Tiempo y clima
  FaSun, FaMoon, FaCloud, FaCloudRain, FaCloudSnow, FaSnowflake, FaThunderstorm, FaTemperatureHigh,
  FaTemperatureLow, FaWind, FaUmbrella, FaCloudSun, FaCloudMoon,
  
  // Animales
  FaDog, FaCat, FaHorse, FaCow, FaPig, FaFrog, FaBird, FaSpider, FaBug,
  FaButterfly, FaDove, FaCrow, FaFeather, FaPaw,
  
  // Plantas y naturaleza
  FaTree, FaLeaf, FaSeedling, FaCactus,
  
  // Transporte
  FaCar, FaBus, FaTrain, FaPlane, FaShip, FaMotorcycle, FaTruck, FaTaxi,
  FaRocket, FaHelicopter, FaSubway,
  
  // Tecnología
  FaMobile, FaLaptop, FaDesktop, FaTablet, FaKeyboard, FaMouse, FaHeadphones, FaCamera,
  FaVideo, FaTv, FaGamepad, FaRobot, FaMicrochip, FaWifi, FaBluetooth,
  
  // Edificios y lugares
  FaHome, FaBuilding, FaIndustry, FaWarehouse, FaStore, FaShoppingCart, FaSchool,
  FaUniversity, FaChurch, FaMosque, FaSynagogue, FaCastle,
  
  // Herramientas y objetos
  FaHammer, FaWrench, FaScrewdriver, FaCut, FaPaintBrush, FaPen, FaPencil, FaBook,
  FaNewspaper, FaEnvelope, FaPhone, FaClock, FaCalendar, FaKey, FaLock, FaUnlock,
  
  // Emociones y estados
  FaSmile, FaFrown, FaSadTear, FaLaugh, FaKiss, FaDizzy, FaAngry, FaSurprise,
  FaMeh, FaTired, FaGrinBeam, FaGrimace, FaFlushed,
  
  // Iconos generales de interfaz
  FaSearch, FaCheck, FaTimes, FaPlus, FaMinus, FaEquals, FaStar,
  FaThumbsUp, FaThumbsDown, FaExclamation, FaQuestion, FaInfo, FaBan,
  
  // Iconos adicionales útiles
  FaFire, FaSnowman, FaGift, FaBell, FaFlag, FaShield, FaCrown, FaGem, FaMagic,
  FaBolt, FaAnchor, FaCompass, FaMap, FaGlobe, FaMusic, FaGuitar, FaDrum,
  FaMicrophone, FaVolumeUp, FaVolumeDown, FaVolumeMute, FaRadio, FaCompactDisc
} from 'react-icons/fa';

const IconSelector = ({ value, onChange, disabled = false, label = "Seleccionar Icono" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef(null);

  // Base de datos expandida de iconos con búsqueda inteligente
  const availableIcons = useMemo(() => [
    // MEDICINA GENERAL
    { name: 'FaStethoscope', component: FaStethoscope, label: 'Estetoscopio', category: 'medicina', keywords: ['estetoscopio', 'doctor', 'medico', 'medicina', 'consulta', 'diagnostico', 'examinar', 'salud'] },
    { name: 'FaUserMd', component: FaUserMd, label: 'Doctor', category: 'medicina', keywords: ['doctor', 'medico', 'profesional', 'sanitario', 'medicina', 'consulta', 'bata', 'especialista'] },
    { name: 'FaUserNurse', component: FaUserNurse, label: 'Enfermera', category: 'medicina', keywords: ['enfermera', 'enfermero', 'auxiliar', 'cuidados', 'inyeccion', 'medicina', 'hospital'] },
    { name: 'FaHospital', component: FaHospital, label: 'Hospital', category: 'medicina', keywords: ['hospital', 'clinica', 'centro', 'medico', 'sanitario', 'emergencias', 'urgencias', 'salud'] },
    { name: 'FaAmbulance', component: FaAmbulance, label: 'Ambulancia', category: 'emergencias', keywords: ['ambulancia', 'emergencia', 'urgencia', 'rescate', 'transporte', 'medico', 'hospital', 'accidente'] },
    { name: 'FaFirstAid', component: FaFirstAid, label: 'Primeros Auxilios', category: 'emergencias', keywords: ['primeros', 'auxilios', 'emergencia', 'cruz', 'roja', 'botiquin', 'rescate', 'ayuda'] },
    { name: 'FaMedkit', component: FaMedkit, label: 'Botiquín', category: 'medicina', keywords: ['botiquin', 'medicinas', 'primeros', 'auxilios', 'emergencia', 'cura', 'vendas', 'medicamentos'] },
    
    // PEDIATRÍA Y MATERNIDAD
    { name: 'FaBaby', component: FaBaby, label: 'Bebé/Pediatría', category: 'pediatria', keywords: ['bebe', 'pediatria', 'nino', 'nina', 'infantil', 'recien', 'nacido', 'parto', 'lactancia', 'neonato'] },
    { name: 'FaChild', component: FaChild, label: 'Niño', category: 'pediatria', keywords: ['nino', 'nina', 'infantil', 'pediatria', 'menor', 'hijo', 'hija', 'infancia'] },
    { name: 'FaChildren', component: FaChildren, label: 'Niños', category: 'pediatria', keywords: ['ninos', 'ninas', 'infantil', 'pediatria', 'menores', 'hijos', 'hijas', 'familia'] },
    { name: 'FaBabyCarriage', component: FaBabyCarriage, label: 'Cochecito de Bebé', category: 'pediatria', keywords: ['cochecito', 'carrito', 'bebe', 'paseo', 'maternidad', 'infancia', 'puericultura'] },
    { name: 'FaFemale', component: FaFemale, label: 'Mujer/Ginecología', category: 'ginecologia', keywords: ['mujer', 'femenino', 'ginecologia', 'embarazo', 'maternidad', 'reproduccion', 'gestacion'] },
    
    // EMBARAZO Y REPRODUCCIÓN
    { name: 'FaHeart', component: FaHeart, label: 'Embarazo/Maternidad', category: 'ginecologia', keywords: ['embarazo', 'gestacion', 'maternidad', 'prenatal', 'obstetricia', 'parto', 'gestante', 'madre', 'manzana', 'amor', 'corazon'] },
    
    // CARDIOLOGÍA
    { name: 'FaHeartbeat', component: FaHeartbeat, label: 'Cardiología', category: 'cardiologia', keywords: ['corazon', 'cardiologia', 'latidos', 'pulso', 'cardio', 'cardiovascular', 'arritmia', 'infarto'] },
    { name: 'FaHandHoldingHeart', component: FaHandHoldingHeart, label: 'Cuidado Cardíaco', category: 'cardiologia', keywords: ['cuidado', 'cardiaco', 'corazon', 'proteccion', 'cardiologo', 'prevencion'] },
    
    // NEUROLOGÍA
    { name: 'FaBrain', component: FaBrain, label: 'Neurología', category: 'neurologia', keywords: ['cerebro', 'neurologia', 'neurologo', 'mental', 'mente', 'psiquiatria', 'psicologia', 'demencia', 'alzheimer'] },
    
    // OFTALMOLOGÍA
    { name: 'FaEye', component: FaEye, label: 'Oftalmología', category: 'oftalmologia', keywords: ['ojo', 'ojos', 'oftalmologia', 'vista', 'vision', 'optica', 'gafas', 'lentes', 'ceguera'] },
    { name: 'FaEyeSlash', component: FaEyeSlash, label: 'Problemas de Visión', category: 'oftalmologia', keywords: ['ceguera', 'vision', 'problemas', 'vista', 'ojo', 'discapacidad', 'visual'] },
    { name: 'FaEyeDropper', component: FaEyeDropper, label: 'Gotas Oculares', category: 'oftalmologia', keywords: ['gotas', 'oculares', 'medicamento', 'ojo', 'tratamiento', 'conjuntivitis'] },
    
    // ODONTOLOGÍA
    { name: 'FaTooth', component: FaTooth, label: 'Odontología', category: 'odontologia', keywords: ['diente', 'dientes', 'odontologia', 'dental', 'dentista', 'muela', 'caries', 'ortodencia', 'brackets'] },
    { name: 'FaTeeth', component: FaTeeth, label: 'Dentadura', category: 'odontologia', keywords: ['dentadura', 'dientes', 'sonrisa', 'dental', 'ortodencia', 'protesis'] },
    
    // ORTOPEDIA Y TRAUMATOLOGÍA  
    { name: 'FaBone', component: FaBone, label: 'Ortopedia', category: 'ortopedia', keywords: ['hueso', 'huesos', 'ortopedia', 'traumatologia', 'fracturas', 'esqueleto', 'articulaciones'] },
    { name: 'FaCrutch', component: FaCrutch, label: 'Muletas', category: 'ortopedia', keywords: ['muletas', 'bastones', 'apoyo', 'caminar', 'lesion', 'rehabilitacion', 'fractura'] },
    { name: 'FaWheelchair', component: FaWheelchair, label: 'Silla de Ruedas', category: 'rehabilitacion', keywords: ['silla', 'ruedas', 'discapacidad', 'movilidad', 'rehabilitacion', 'paralisis', 'lesion'] },
    
    // UROLOGÍA
    { name: 'FaMale', component: FaMale, label: 'Urología', category: 'urologia', keywords: ['hombre', 'masculino', 'urologia', 'prostata', 'riñones', 'vejiga', 'andrologo'] },
    
    // NEUMOLOGÍA
    { name: 'FaLungs', component: FaLungs, label: 'Neumología', category: 'neumologia', keywords: ['pulmones', 'respiracion', 'neumonia', 'asma', 'bronquios', 'respiratorio', 'oxigeno'] },
    { name: 'FaHeadSideCough', component: FaHeadSideCough, label: 'Tos/Respiratorio', category: 'neumologia', keywords: ['tos', 'respiratorio', 'resfriado', 'gripe', 'covid', 'pulmones', 'bronquitis'] },
    { name: 'FaSmokingBan', component: FaSmokingBan, label: 'No Fumar', category: 'neumologia', keywords: ['no', 'fumar', 'tabaco', 'cigarrillo', 'pulmones', 'prohibido', 'salud'] },
    { name: 'FSmoking', component: FaSmoking, label: 'Tabaquismo', category: 'neumologia', keywords: ['fumar', 'tabaco', 'cigarrillo', 'adiccion', 'pulmones', 'cancer'] },
    
    // LABORATORIO Y ANÁLISIS
    { name: 'FaFlask', component: FaFlask, label: 'Laboratorio', category: 'laboratorio', keywords: ['laboratorio', 'analisis', 'sangre', 'orina', 'examenes', 'pruebas', 'bioquimica'] },
    { name: 'FaMicroscope', component: FaMicroscope, label: 'Microscopio', category: 'laboratorio', keywords: ['microscopio', 'laboratorio', 'celulas', 'bacteria', 'virus', 'analisis', 'patologia'] },
    { name: 'FaVials', component: FaVials, label: 'Análisis Clínicos', category: 'laboratorio', keywords: ['viales', 'tubos', 'sangre', 'analisis', 'laboratorio', 'muestras', 'bioquimica'] },
    
    // RADIOLOGÍA
    { name: 'FaXRay', component: FaXRay, label: 'Radiología', category: 'radiologia', keywords: ['rayos', 'radiografia', 'radiologia', 'huesos', 'fracturas', 'tomografia', 'resonancia'] },
    
    // MEDICAMENTOS Y FARMACIA
    { name: 'FaPills', component: FaPills, label: 'Medicamentos', category: 'farmacia', keywords: ['pastillas', 'medicamentos', 'medicina', 'farmacia', 'tratamiento', 'capsulas', 'tabletas'] },
    { name: 'FaPrescriptionBottle', component: FaPrescriptionBottle, label: 'Receta Médica', category: 'farmacia', keywords: ['receta', 'medicamentos', 'farmacia', 'prescripcion', 'botella', 'jarabe'] },
    { name: 'FaSyringe', component: FaSyringe, label: 'Inyección', category: 'medicina', keywords: ['inyeccion', 'jeringa', 'vacuna', 'insulina', 'medicamento', 'aguja', 'inmunizacion'] },
    { name: 'FaBandAid', component: FaBandAid, label: 'Curita/Vendaje', category: 'medicina', keywords: ['curita', 'tirita', 'vendaje', 'herida', 'corte', 'lastimadura', 'lesion'] },
    
    // PROCEDIMIENTOS
    { name: 'FaProcedures', component: FaProcedures, label: 'Procedimientos', category: 'medicina', keywords: ['procedimientos', 'cirugia', 'operacion', 'quirofano', 'internacion', 'hospitalizacion'] },
    { name: 'FaDoorOpen', component: FaDoorOpen, label: 'Consulta', category: 'medicina', keywords: ['consulta', 'consultorio', 'puerta', 'entrada', 'cita', 'turno', 'visita'] },
    
    // TEMPERATURA Y SÍNTOMAS
    { name: 'FaThermometer', component: FaThermometer, label: 'Temperatura/Fiebre', category: 'medicina', keywords: ['termometro', 'temperatura', 'fiebre', 'calentura', 'sintoma', 'medicion'] },
    { name: 'FaTemperatureHigh', component: FaTemperatureHigh, label: 'Fiebre Alta', category: 'medicina', keywords: ['fiebre', 'alta', 'temperatura', 'calentura', 'calor', 'enfermedad'] },
    { name: 'FaTemperatureLow', component: FaTemperatureLow, label: 'Hipotermia', category: 'medicina', keywords: ['frio', 'hipotermia', 'temperatura', 'baja', 'congelacion'] },
    
    // ALERGIAS E INMUNOLOGÍA
    { name: 'FaAllergies', component: FaAllergies, label: 'Alergias', category: 'inmunologia', keywords: ['alergias', 'alergia', 'inmunologia', 'reaccion', 'polen', 'estornudos', 'rinitis'] },
    { name: 'FaVirus', component: FaVirus, label: 'Virus/Infección', category: 'infectologia', keywords: ['virus', 'infeccion', 'bacteria', 'contagio', 'epidemia', 'covid', 'gripe'] },
    { name: 'FaShieldVirus', component: FaShieldVirus, label: 'Protección Viral', category: 'infectologia', keywords: ['proteccion', 'virus', 'escudo', 'inmunidad', 'vacuna', 'prevencion'] },
    
    // HIGIENE Y PREVENCIÓN
    { name: 'FaHandsWash', component: FaHandsWash, label: 'Lavado de Manos', category: 'prevencion', keywords: ['lavado', 'manos', 'higiene', 'limpieza', 'jabon', 'desinfeccion', 'prevencion'] },
    { name: 'FaHandHoldingMedical', component: FaHandHoldingMedical, label: 'Cuidado Médico', category: 'medicina', keywords: ['cuidado', 'medico', 'atencion', 'tratamiento', 'proteccion', 'salud'] },
    
    // MANOS Y EXTREMIDADES
    { name: 'FaHand', component: FaHand, label: 'Mano', category: 'ortopedia', keywords: ['mano', 'extremidad', 'dedos', 'muñeca', 'lesion', 'fractura'] },
    { name: 'FaHandPaper', component: FaHandPaper, label: 'Palma', category: 'ortopedia', keywords: ['palma', 'mano', 'abierta', 'saludo', 'alto', 'detener'] },
    { name: 'FaFist', component: FaFist, label: 'Puño', category: 'ortopedia', keywords: ['puno', 'cerrado', 'fuerza', 'golpe', 'lesion'] },
    { name: 'FaPaw', component: FaPaw, label: 'Veterinaria', category: 'veterinaria', keywords: ['veterinaria', 'animales', 'mascotas', 'pata', 'huella', 'perro', 'gato'] },
    
    // FRUTAS Y ALIMENTACIÓN (con palabras clave avanzadas)
    { name: 'FaAppleAlt', component: FaAppleAlt, label: 'Manzana/Nutrición', category: 'nutricion', keywords: ['manzana', 'fruta', 'nutricion', 'dieta', 'vitaminas', 'salud', 'alimentacion', 'fibra', 'embarazo'] },
    { name: 'FaCarrot', component: FaCarrot, label: 'Zanahoria', category: 'nutricion', keywords: ['zanahoria', 'verdura', 'vegetal', 'vitamina', 'naranja', 'nutricion', 'dieta', 'fibra'] },
    { name: 'FaFish', component: FaFish, label: 'Pescado', category: 'nutricion', keywords: ['pescado', 'pez', 'proteina', 'omega', 'mar', 'nutricion', 'dieta', 'saludable'] },
    { name: 'FaEgg', component: FaEgg, label: 'Huevo', category: 'nutricion', keywords: ['huevo', 'proteina', 'desayuno', 'nutricion', 'vitaminas', 'colesterol'] },
    { name: 'FaCheese', component: FaCheese, label: 'Queso', category: 'nutricion', keywords: ['queso', 'lacteo', 'calcio', 'proteina', 'dairy', 'nutricion'] },
    
    // BEBIDAS
    { name: 'FaCoffee', component: FaCoffee, label: 'Café', category: 'bebidas', keywords: ['cafe', 'cafeina', 'bebida', 'estimulante', 'despertar', 'energía'] },
    { name: 'FaGlassWater', component: FaGlassWater, label: 'Agua', category: 'bebidas', keywords: ['agua', 'hidratacion', 'liquido', 'beber', 'sed', 'salud'] },
    { name: 'FaBeer', component: FaBeer, label: 'Alcohol', category: 'bebidas', keywords: ['alcohol', 'cerveza', 'bebida', 'alcoholismo', 'adiccion'] },
    { name: 'FaWineGlass', component: FaWineGlass, label: 'Vino', category: 'bebidas', keywords: ['vino', 'copa', 'alcohol', 'bebida', 'tinto'] },
    
    // EJERCICIO Y DEPORTE
    { name: 'FaRunning', component: FaRunning, label: 'Correr', category: 'ejercicio', keywords: ['correr', 'trotar', 'ejercicio', 'deporte', 'cardio', 'fitness', 'salud'] },
    { name: 'FaWalking', component: FaWalking, label: 'Caminar', category: 'ejercicio', keywords: ['caminar', 'pasear', 'ejercicio', 'rehabilitacion', 'movilidad', 'fisioterapia'] },
    { name: 'FaBicycle', component: FaBicycle, label: 'Bicicleta', category: 'ejercicio', keywords: ['bicicleta', 'ciclismo', 'ejercicio', 'deporte', 'cardio', 'transporte'] },
    { name: 'FaSwimmer', component: FaSwimmer, label: 'Natación', category: 'ejercicio', keywords: ['natacion', 'nadar', 'piscina', 'ejercicio', 'deporte', 'agua', 'rehabilitacion'] },
    { name: 'FaDumbbell', component: FaDumbbell, label: 'Pesas', category: 'ejercicio', keywords: ['pesas', 'gimnasio', 'fuerza', 'musculacion', 'ejercicio', 'fitness'] },
    
    // DEPORTES ESPECÍFICOS
    { name: 'FaFootballBall', component: FaFootballBall, label: 'Fútbol', category: 'deportes', keywords: ['futbol', 'pelota', 'soccer', 'deporte', 'equipo'] },
    { name: 'FaBasketballBall', component: FaBasketballBall, label: 'Básquet', category: 'deportes', keywords: ['basquet', 'basketball', 'pelota', 'canasta', 'deporte'] },
    { name: 'FaTennisball', component: FaTennisball, label: 'Tenis', category: 'deportes', keywords: ['tenis', 'pelota', 'raqueta', 'deporte', 'individual'] },
    { name: 'FaBaseballBall', component: FaBaseballBall, label: 'Béisbol', category: 'deportes', keywords: ['beisbol', 'baseball', 'pelota', 'bate', 'deporte'] },
    
    // CLIMA Y TIEMPO
    { name: 'FaSun', component: FaSun, label: 'Sol', category: 'clima', keywords: ['sol', 'calor', 'verano', 'vitamina', 'luz', 'bronceado', 'proteccion'] },
    { name: 'FaMoon', component: FaMoon, label: 'Luna', category: 'clima', keywords: ['luna', 'noche', 'dormir', 'sueño', 'descanso', 'ciclo'] },
    { name: 'FaCloud', component: FaCloud, label: 'Nube', category: 'clima', keywords: ['nube', 'cielo', 'gris', 'tiempo', 'meteorologia'] },
    { name: 'FaCloudRain', component: FaCloudRain, label: 'Lluvia', category: 'clima', keywords: ['lluvia', 'agua', 'mojado', 'paraguas', 'tiempo'] },
    { name: 'FaSnowflake', component: FaSnowflake, label: 'Nieve', category: 'clima', keywords: ['nieve', 'copo', 'frio', 'invierno', 'congelar'] },
    { name: 'FaUmbrella', component: FaUmbrella, label: 'Paraguas', category: 'objetos', keywords: ['paraguas', 'lluvia', 'proteccion', 'mojado', 'tiempo'] },
    
    // ANIMALES
    { name: 'FaDog', component: FaDog, label: 'Perro', category: 'animales', keywords: ['perro', 'can', 'mascota', 'animal', 'veterinaria', 'cachorro'] },
    { name: 'FaCat', component: FaCat, label: 'Gato', category: 'animales', keywords: ['gato', 'felino', 'mascota', 'animal', 'veterinaria', 'gatito'] },
    { name: 'FaHorse', component: FaHorse, label: 'Caballo', category: 'animales', keywords: ['caballo', 'equino', 'animal', 'montar', 'veterinaria'] },
    { name: 'FaCow', component: FaCow, label: 'Vaca', category: 'animales', keywords: ['vaca', 'leche', 'animal', 'granja', 'bovino', 'veterinaria'] },
    { name: 'FaPig', component: FaPig, label: 'Cerdo', category: 'animales', keywords: ['cerdo', 'cochino', 'animal', 'granja', 'porcino'] },
    { name: 'FaBird', component: FaBird, label: 'Pájaro', category: 'animales', keywords: ['pajaro', 'ave', 'volar', 'animal', 'plumas', 'veterinaria'] },
    { name: 'FaFrog', component: FaFrog, label: 'Rana', category: 'animales', keywords: ['rana', 'anfibio', 'verde', 'saltar', 'agua'] },
    { name: 'FaButterfly', component: FaButterfly, label: 'Mariposa', category: 'animales', keywords: ['mariposa', 'insecto', 'volar', 'colores', 'transformacion'] },
    { name: 'FaSpider', component: FaSpider, label: 'Araña', category: 'animales', keywords: ['arana', 'insecto', 'tela', 'patas', 'miedo', 'fobia'] },
    
    // PLANTAS Y NATURALEZA
    { name: 'FaTree', component: FaTree, label: 'Árbol', category: 'naturaleza', keywords: ['arbol', 'planta', 'bosque', 'naturaleza', 'verde', 'oxigeno'] },
    { name: 'FaLeaf', component: FaLeaf, label: 'Hoja', category: 'naturaleza', keywords: ['hoja', 'planta', 'verde', 'natural', 'organico', 'ecologia'] },
    { name: 'FaSeedling', component: FaSeedling, label: 'Brote', category: 'naturaleza', keywords: ['brote', 'planta', 'crecer', 'semilla', 'verde', 'vida'] },
    { name: 'FaCactus', component: FaCactus, label: 'Cactus', category: 'naturaleza', keywords: ['cactus', 'espinas', 'desierto', 'planta', 'verde'] },
    
    // TRANSPORTE
    { name: 'FaCar', component: FaCar, label: 'Automóvil', category: 'transporte', keywords: ['auto', 'coche', 'vehiculo', 'conducir', 'transporte', 'accidente'] },
    { name: 'FaBus', component: FaBus, label: 'Autobús', category: 'transporte', keywords: ['autobus', 'colectivo', 'transporte', 'publico', 'viaje'] },
    { name: 'FaPlane', component: FaPlane, label: 'Avión', category: 'transporte', keywords: ['avion', 'volar', 'aeropuerto', 'viaje', 'vacaciones'] },
    { name: 'FaTrain', component: FaTrain, label: 'Tren', category: 'transporte', keywords: ['tren', 'ferrocarril', 'estacion', 'transporte', 'viaje'] },
    { name: 'FaShip', component: FaShip, label: 'Barco', category: 'transporte', keywords: ['barco', 'nave', 'mar', 'agua', 'viaje', 'crucero'] },
    { name: 'FaHelicopter', component: FaHelicopter, label: 'Helicóptero', category: 'transporte', keywords: ['helicoptero', 'volar', 'rescate', 'emergencia', 'ambulancia'] },
    { name: 'FaRocket', component: FaRocket, label: 'Cohete', category: 'transporte', keywords: ['cohete', 'espacio', 'nasa', 'volar', 'velocidad'] },
    
    // TECNOLOGÍA
    { name: 'FaMobile', component: FaMobile, label: 'Teléfono Móvil', category: 'tecnologia', keywords: ['telefono', 'movil', 'celular', 'smartphone', 'llamar', 'tecnologia'] },
    { name: 'FaLaptop', component: FaLaptop, label: 'Computadora', category: 'tecnologia', keywords: ['computadora', 'laptop', 'ordenador', 'tecnologia', 'trabajo'] },
    { name: 'FaCamera', component: FaCamera, label: 'Cámara', category: 'tecnologia', keywords: ['camara', 'foto', 'fotografia', 'imagen', 'recuerdo'] },
    { name: 'FaTv', component: FaTv, label: 'Televisión', category: 'tecnologia', keywords: ['television', 'tv', 'pantalla', 'ver', 'programa'] },
    { name: 'FaHeadphones', component: FaHeadphones, label: 'Auriculares', category: 'tecnologia', keywords: ['auriculares', 'cascos', 'musica', 'sonido', 'escuchar'] },
    { name: 'FaRobot', component: FaRobot, label: 'Robot', category: 'tecnologia', keywords: ['robot', 'artificial', 'inteligencia', 'automatico', 'futuro'] },
    
    // MÚSICA
    { name: 'FaMusic', component: FaMusic, label: 'Música', category: 'musica', keywords: ['musica', 'nota', 'cancion', 'melodia', 'sonido', 'terapia'] },
    { name: 'FaGuitar', component: FaGuitar, label: 'Guitarra', category: 'musica', keywords: ['guitarra', 'instrumento', 'musica', 'tocar', 'cuerdas'] },
    { name: 'FaMicrophone', component: FaMicrophone, label: 'Micrófono', category: 'musica', keywords: ['microfono', 'cantar', 'hablar', 'sonido', 'voz'] },
    
    // EDIFICIOS Y LUGARES
    { name: 'FaHome', component: FaHome, label: 'Casa', category: 'lugares', keywords: ['casa', 'hogar', 'vivienda', 'domicilio', 'residencia'] },
    { name: 'FaSchool', component: FaSchool, label: 'Escuela', category: 'lugares', keywords: ['escuela', 'colegio', 'educacion', 'estudiar', 'aprender'] },
    { name: 'FaUniversity', component: FaUniversity, label: 'Universidad', category: 'lugares', keywords: ['universidad', 'facultad', 'educacion', 'carrera', 'titulo'] },
    { name: 'FaStore', component: FaStore, label: 'Tienda', category: 'lugares', keywords: ['tienda', 'negocio', 'comprar', 'comercio', 'venta'] },
    { name: 'FaChurch', component: FaChurch, label: 'Iglesia', category: 'lugares', keywords: ['iglesia', 'religion', 'fe', 'cristiano', 'catolico'] },
    
    // EMOCIONES
    { name: 'FaSmile', component: FaSmile, label: 'Sonrisa/Felicidad', category: 'emociones', keywords: ['sonrisa', 'feliz', 'alegria', 'contento', 'positivo', 'salud', 'mental'] },
    { name: 'FaFrown', component: FaFrown, label: 'Tristeza', category: 'emociones', keywords: ['triste', 'tristeza', 'depresion', 'melancolico', 'psicologia'] },
    { name: 'FaLaugh', component: FaLaugh, label: 'Risa', category: 'emociones', keywords: ['risa', 'carcajada', 'humor', 'feliz', 'divertido', 'terapia'] },
    { name: 'FaAngry', component: FaAngry, label: 'Enojo', category: 'emociones', keywords: ['enojo', 'ira', 'molesto', 'furioso', 'psicologia'] },
    { name: 'FaSurprise', component: FaSurprise, label: 'Sorpresa', category: 'emociones', keywords: ['sorpresa', 'asombro', 'impacto', 'emocion'] },
    
    // HERRAMIENTAS Y OBJETOS
    { name: 'FaKey', component: FaKey, label: 'Llave', category: 'objetos', keywords: ['llave', 'abrir', 'cerrar', 'acceso', 'seguridad'] },
    { name: 'FaClock', component: FaClock, label: 'Reloj', category: 'objetos', keywords: ['reloj', 'tiempo', 'hora', 'puntualidad', 'cita', 'turno'] },
    { name: 'FaCalendar', component: FaCalendar, label: 'Calendario', category: 'objetos', keywords: ['calendario', 'fecha', 'dia', 'mes', 'cita', 'turno', 'agenda'] },
    { name: 'FaPhone', component: FaPhone, label: 'Teléfono', category: 'objetos', keywords: ['telefono', 'llamar', 'comunicacion', 'contacto'] },
    { name: 'FaBook', component: FaBook, label: 'Libro', category: 'objetos', keywords: ['libro', 'leer', 'conocimiento', 'educacion', 'estudio'] },
    
    // ICONOS GENERALES ÚTILES
    { name: 'FaSearch', component: FaSearch, label: 'Buscar', category: 'general', keywords: ['buscar', 'encontrar', 'lupa', 'investigar', 'busqueda'] },
    { name: 'FaCheck', component: FaCheck, label: 'Correcto', category: 'general', keywords: ['correcto', 'bien', 'aprobado', 'si', 'positivo', 'check'] },
    { name: 'FaTimes', component: FaTimes, label: 'Incorrecto', category: 'general', keywords: ['incorrecto', 'mal', 'no', 'cerrar', 'eliminar', 'error'] },
    { name: 'FaStar', component: FaStar, label: 'Estrella', category: 'general', keywords: ['estrella', 'favorito', 'destacado', 'premium', 'calidad'] },
    { name: 'FaInfo', component: FaInfo, label: 'Información', category: 'general', keywords: ['informacion', 'datos', 'ayuda', 'detalles'] },
    { name: 'FaExclamation', component: FaExclamation, label: 'Alerta', category: 'general', keywords: ['alerta', 'atencion', 'importante', 'advertencia'] },
    { name: 'FaQuestion', component: FaQuestion, label: 'Pregunta', category: 'general', keywords: ['pregunta', 'duda', 'ayuda', 'consulta'] },
    
    // ELEMENTOS ADICIONALES CREATIVOS
    { name: 'FaFire', component: FaFire, label: 'Fuego', category: 'elementos', keywords: ['fuego', 'llama', 'quemar', 'calor', 'energia'] },
    { name: 'FaBolt', component: FaBolt, label: 'Rayo', category: 'elementos', keywords: ['rayo', 'electricidad', 'energia', 'velocidad', 'poder'] },
    { name: 'FaGem', component: FaGem, label: 'Gema', category: 'objetos', keywords: ['gema', 'diamante', 'joya', 'valioso', 'premium'] },
    { name: 'FaCrown', component: FaCrown, label: 'Corona', category: 'objetos', keywords: ['corona', 'rey', 'reina', 'lider', 'premium', 'vip'] },
    { name: 'FaMagic', component: FaMagic, label: 'Magia', category: 'fantasia', keywords: ['magia', 'varita', 'magico', 'especial', 'milagro'] },
    { name: 'FaGlobe', component: FaGlobe, label: 'Mundo', category: 'lugares', keywords: ['mundo', 'tierra', 'planeta', 'global', 'internacional'] },
    { name: 'FaCompass', component: FaCompass, label: 'Brújula', category: 'objetos', keywords: ['brujula', 'direccion', 'norte', 'orientacion', 'navegacion'] },
    { name: 'FaAnchor', component: FaAnchor, label: 'Ancla', category: 'objetos', keywords: ['ancla', 'barco', 'mar', 'estabilidad', 'seguridad'] },
    { name: 'FaMap', component: FaMap, label: 'Mapa', category: 'objetos', keywords: ['mapa', 'ubicacion', 'direccion', 'lugar', 'navegacion'] }
  ], []);

  // Sistema de búsqueda inteligente mejorado
  const filteredIcons = useMemo(() => {
    if (!searchTerm) return availableIcons;
    
    const term = searchTerm.toLowerCase().trim();
    
    return availableIcons.filter(icon => {
      // Búsqueda en label
      if (icon.label.toLowerCase().includes(term)) return true;
      
      // Búsqueda en categoría
      if (icon.category.toLowerCase().includes(term)) return true;
      
      // Búsqueda en nombre del componente
      if (icon.name.toLowerCase().includes(term)) return true;
      
      // Búsqueda en keywords (palabras clave)
      if (icon.keywords && icon.keywords.some(keyword => 
        keyword.toLowerCase().includes(term) || 
        term.includes(keyword.toLowerCase())
      )) return true;
      
      // Búsqueda difusa - permite coincidencias parciales
      const allText = [
        icon.label,
        icon.category,
        ...(icon.keywords || [])
      ].join(' ').toLowerCase();
      
      // Si el término está contenido en cualquier parte del texto combinado
      if (allText.includes(term)) return true;
      
      return false;
    });
  }, [searchTerm, availableIcons]);

  // Agrupar iconos por categoría con nombres más descriptivos
  const groupedIcons = useMemo(() => {
    const groups = {};
    filteredIcons.forEach(icon => {
      if (!groups[icon.category]) {
        groups[icon.category] = [];
      }
      groups[icon.category].push(icon);
    });
    return groups;
  }, [filteredIcons]);

  const handleIconSelect = (iconName) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const getCurrentIcon = () => {
    const currentIcon = availableIcons.find(icon => icon.name === value);
    return currentIcon || null;
  };

  const currentIcon = getCurrentIcon();
  const IconComponent = currentIcon?.component;

  // Nombres de categorías más descriptivos y organizados
  const categoryNames = {
    medicina: '🏥 Medicina General',
    pediatria: '👶 Pediatría',
    cardiologia: '❤️ Cardiología', 
    ginecologia: '👩 Ginecología y Obstetricia',
    oftalmologia: '👁️ Oftalmología',
    ortopedia: '🦴 Ortopedia y Traumatología',
    neurologia: '🧠 Neurología',
    urologia: '👨 Urología',
    neumologia: '🫁 Neumología',
    laboratorio: '🧪 Laboratorio y Análisis',
    radiologia: '📸 Radiología',
    farmacia: '💊 Farmacia y Medicamentos',
    emergencias: '🚨 Emergencias',
    rehabilitacion: '♿ Rehabilitación',
    inmunologia: '🛡️ Inmunología y Alergias',
    infectologia: '🦠 Infectología',
    prevencion: '🧴 Prevención e Higiene',
    veterinaria: '🐾 Veterinaria',
    nutricion: '🍎 Nutrición y Alimentación',
    bebidas: '☕ Bebidas',
    ejercicio: '🏃 Ejercicio y Fitness',
    deportes: '⚽ Deportes',
    clima: '☀️ Clima y Tiempo',
    animales: '🐕 Animales',
    naturaleza: '🌳 Plantas y Naturaleza',
    transporte: '🚗 Transporte',
    tecnologia: '💻 Tecnología',
    musica: '🎵 Música',
    lugares: '🏠 Edificios y Lugares',
    emociones: '😊 Emociones y Estados',
    objetos: '🔑 Herramientas y Objetos',
    general: '⭐ General',
    elementos: '🔥 Elementos',
    fantasia: '✨ Especiales'
  };

  // Componente Modal Popup (sin cambios en la estructura)
  const IconPopup = () => (
    <div className="icon-popup-overlay" onClick={handleClose}>
      <div className="icon-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del popup */}
        <div className="icon-popup-header">
          <h3>Seleccionar Icono del Área</h3>
          <button 
            className="icon-popup-close" 
            onClick={handleClose}
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Buscador */}
        <div className="icon-popup-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar: manzana, embarazo, corazón, neumología..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
          {searchTerm && (
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--text-secondary)', 
              marginTop: '8px',
              textAlign: 'center' 
            }}>
              {filteredIcons.length} iconos encontrados para "{searchTerm}"
            </div>
          )}
        </div>

        {/* Contenido de iconos */}
        <div className="icon-popup-content">
          {Object.keys(groupedIcons).length === 0 ? (
            <div className="no-icons-found">
              <FaSearch size={48} />
              <h4>No se encontraron iconos</h4>
              <p>Prueba con: doctor, corazón, embarazo, manzana, etc.</p>
            </div>
          ) : (
            Object.entries(groupedIcons).map(([category, icons]) => (
              <div key={category} className="icon-category">
                <h4 className="category-title">
                  {categoryNames[category] || category}
                </h4>
                <div className="icon-grid">
                  {icons.map((icon) => {
                    const IconComp = icon.component;
                    return (
                      <button
                        key={icon.name}
                        type="button"
                        className={`icon-option ${value === icon.name ? 'selected' : ''}`}
                        onClick={() => handleIconSelect(icon.name)}
                        title={`${icon.label} (${icon.name})`}
                      >
                        <div className="icon-wrapper">
                          <IconComp size={24} />
                        </div>
                        <span className="icon-label">{icon.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="icon-popup-footer">
          <button
            type="button"
            className="clear-selection-btn"
            onClick={() => handleIconSelect('')}
          >
            <FaTimes size={14} />
            Limpiar selección
          </button>
          <div className="popup-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
            >
              Cancelar
            </button>
            {currentIcon && (
              <button
                type="button"
                className="confirm-btn"
                onClick={handleClose}
              >
                <FaCheck size={14} />
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`icon-selector-container ${disabled ? 'disabled' : ''}`}>
      <label className="icon-selector-label">{label}</label>
      
      {/* Botón principal */}
      <div className="icon-selector-button-wrapper">
        <button
          ref={buttonRef}
          type="button"
          className={`icon-selector-button ${isOpen ? 'open' : ''}`}
          onClick={() => !disabled && setIsOpen(true)}
          disabled={disabled}
        >
          <div className="icon-preview">
            {IconComponent ? (
              <IconComponent size={20} />
            ) : (
              <div className="icon-placeholder">
                <FaSearch size={16} />
              </div>
            )}
          </div>
          
          <div className="icon-info">
            <span className="icon-name">
              {currentIcon ? currentIcon.label : 'Sin seleccionar'}
            </span>
            {value && (
              <span className="icon-code">{value}</span>
            )}
          </div>
          
          <div className="dropdown-arrow">
            <FaSearch size={14} />
          </div>
        </button>
      </div>

      {/* Popup Modal */}
      {isOpen && createPortal(<IconPopup />, document.body)}
    </div>
  );
};

IconSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

export default IconSelector;