import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

// React Icons
import { FaGlobe, FaCheck } from 'react-icons/fa';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    {
      code: 'es',
      name: 'Español',
      flags: [
        { code: 'es', label: 'España', emoji: '🇪🇸' }
      ],
      shortName: 'ES'
    },
    {
      code: 'en',
      name: 'English',
      flags: [
        { code: 'gb', label: 'UK', emoji: '🇬🇧' }
      ],
      shortName: 'EN'
    }
  ];

  // Componente para renderizar banderas con fallback a imágenes SVG
  const FlagIcon = ({ flag }) => {
    return (
      <img 
        src={`https://flagcdn.com/24x18/${flag.code}.png`}
        srcSet={`https://flagcdn.com/48x36/${flag.code}.png 2x, https://flagcdn.com/72x54/${flag.code}.png 3x`}
        width="24"
        height="18"
        alt={flag.label}
        title={flag.label}
        className="flag-image"
        loading="lazy"
      />
    );
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
    
    // Notificación opcional de cambio de idioma
    console.log(`Idioma cambiado a: ${languageCode}`);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Cerrar el menú cuando se hace clic fuera
  const handleClickOutside = (e) => {
    if (!e.target.closest('.language-switcher')) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`language-switcher ${isOpen ? 'open' : ''}`}>
      {/* Botón Principal */}
      <button
        className="language-switcher-button"
        onClick={toggleMenu}
        aria-label={t('common:language.changeLanguage')}
        title={t('common:language.changeLanguage')}
      >
        <div className="button-content">
          <FaGlobe className="globe-icon" />
          <span className="current-language">{currentLanguage.shortName}</span>
        </div>
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="language-menu">
          <div className="language-menu-header">
            <FaGlobe className="header-icon" />
            <span>{t('common:language.selectLanguage')}</span>
          </div>
          
          <div className="language-options">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${i18n.language === language.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="language-flags">
                  {language.flags.map((flag, index) => (
                    <FlagIcon key={index} flag={flag} />
                  ))}
                </span>
                <span className="language-name">{language.name}</span>
                {i18n.language === language.code && (
                  <FaCheck className="check-icon" />
                )}
              </button>
            ))}
          </div>

          <div className="language-menu-footer">
            <small>{t('common:language.changeLanguage')}</small>
          </div>
        </div>
      )}

      {/* Indicador de idioma actual (tooltip) */}
      <div className="language-tooltip">
        {currentLanguage.name}
      </div>
    </div>
  );
};

export default LanguageSwitcher;

