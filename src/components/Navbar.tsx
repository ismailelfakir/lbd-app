import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/context';

type NavbarProps = {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  currentPath?: string;
  onNavigateToCourses?: () => void;
};

export default function Navbar({ theme, onThemeToggle, currentPath, onNavigateToCourses }: NavbarProps) {
  const { language, setLanguage, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { id: 'courses', label: t('courses'), path: '/activity1', icon: 'book' },
    { id: 'discuss', label: language === 'en' ? 'Discuss' : 'Discuter', path: '/discuss', icon: 'message' },
    { id: 'blog', label: language === 'en' ? 'Blog' : 'Blog', path: '/blog', icon: 'file' },
    { id: 'about', label: language === 'en' ? 'About' : 'À propos', path: '/about', icon: 'info' },
  ];

  function handleNavClick(path: string) {
    if (path.startsWith('/activity')) {
      if (window.location.pathname !== path) {
        history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
      }
      // Navigate to courses view when clicking on Courses
      if (path === '/activity1' && onNavigateToCourses) {
        onNavigateToCourses();
      }
    }
    // Close mobile menu after navigation
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    // For other paths, you can add routing logic later
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  function handleLogoClick() {
    if (window.location.pathname !== '/activity1') {
      history.pushState({}, '', '/activity1');
      window.dispatchEvent(new Event('popstate'));
    }
    // Navigate to courses view when clicking on logo
    if (onNavigateToCourses) {
      onNavigateToCourses();
    }
  }

  const isActive = (path: string) => {
    if (currentPath) return currentPath === path;
    return window.location.pathname === path || window.location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img 
              src={theme === 'dark' ? '/logo-learnbd-white.svg' : '/logo-learnbd.svg'} 
              alt="LearnBD" 
              className="navbar-logo" 
            />
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              <div className="navbar-links">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="navbar-actions">
                <div className="navbar-language">
                  <button
                    className={`navbar-action-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                    aria-label="English"
                  >
                    EN
                  </button>
                  <button
                    className={`navbar-action-btn ${language === 'fr' ? 'active' : ''}`}
                    onClick={() => setLanguage('fr')}
                    aria-label="Français"
                  >
                    FR
                  </button>
                </div>
                <button
                  className="navbar-action-btn"
                  onClick={onThemeToggle}
                  aria-label={theme === 'light' ? t('switchToDarkMode') : t('switchToLightMode')}
                >
                  {theme === 'light' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="navbar-actions-mobile">
              <button
                className="navbar-mobile-menu-btn"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div className="navbar-mobile-backdrop" onClick={toggleMobileMenu}></div>
          <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="navbar-mobile-header">
              <h3>Menu</h3>
              <button
                className="navbar-mobile-close"
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="navbar-mobile-links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`navbar-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="navbar-mobile-actions">
              <div className="navbar-mobile-language">
                <span className="navbar-mobile-label">Language:</span>
                <div className="navbar-language">
                  <button
                    className={`navbar-action-btn ${language === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                    aria-label="English"
                  >
                    EN
                  </button>
                  <button
                    className={`navbar-action-btn ${language === 'fr' ? 'active' : ''}`}
                    onClick={() => setLanguage('fr')}
                    aria-label="Français"
                  >
                    FR
                  </button>
                </div>
              </div>
              <div className="navbar-mobile-theme">
                <span className="navbar-mobile-label">Theme:</span>
                <button
                  className="navbar-action-btn"
                  onClick={onThemeToggle}
                  aria-label={theme === 'light' ? t('switchToDarkMode') : t('switchToLightMode')}
                >
                  {theme === 'light' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

