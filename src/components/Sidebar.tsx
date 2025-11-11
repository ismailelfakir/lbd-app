import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/context';

type StepItem = {
  section: 'course' | 'workshop';
  title: string;
  meta?: { duration?: string; difficulty?: string; tags?: string[] };
};

type SidebarProps = {
  steps: StepItem[];
  currentIndex: number;
  onStepChange: (index: number) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onActivitySwitch: (activity: 'activity1' | 'activity2') => void;
  currentActivity: 'activity1' | 'activity2';
  activityTitle?: string;
  activitySubtitle?: string;
};

export default function Sidebar({
  steps,
  currentIndex,
  onStepChange,
  theme,
  onThemeToggle,
  onActivitySwitch,
  currentActivity,
  activityTitle = 'Workshop',
  activitySubtitle = 'Next.js Learning',
}: SidebarProps) {
  const { language, setLanguage, t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('lbd.sidebar.collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    localStorage.setItem('lbd.sidebar.collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Only show backdrop on mobile when sidebar is expanded
  const showBackdrop = !isCollapsed && isMobile;

  return (
    <>
      {/* Backdrop for mobile */}
      {showBackdrop && (
        <div
          className="sidebar-backdrop"
          onClick={toggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-title-section">
              <h2 className="sidebar-title">{activityTitle}</h2>
              <p className="sidebar-subtitle">{activitySubtitle}</p>
            </div>
          )}
          <button
            className="sidebar-toggle"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {isCollapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            )}
          </button>
        </div>

        {/* Content */}
        {!isCollapsed && (
          <div className="sidebar-content">
            {/* Language Switcher */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('language')}</div>
              <div className="language-switcher">
                <button
                  className={`language-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => setLanguage('en')}
                  aria-label="Switch to English"
                >
                  <span className="language-label">{t('english')}</span>
                </button>
                <button
                  className={`language-btn ${language === 'fr' ? 'active' : ''}`}
                  onClick={() => setLanguage('fr')}
                  aria-label="Switch to French"
                >
                  <span className="language-label">{t('french')}</span>
                </button>
              </div>
            </div>

            {/* Activity Switcher */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('activities')}</div>
              <div className="activity-switcher">
                <button
                  className={`activity-btn ${currentActivity === 'activity1' ? 'active' : ''}`}
                  onClick={() => onActivitySwitch('activity1')}
                >
                  <svg className="activity-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span className="activity-label">{t('theory')}</span>
                </button>
                <button
                  className={`activity-btn ${currentActivity === 'activity2' ? 'active' : ''}`}
                  onClick={() => onActivitySwitch('activity2')}
                >
                  <svg className="activity-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <span className="activity-label">{t('workshop')}</span>
                </button>
              </div>
            </div>

            {/* Steps Navigation */}
            <div className="sidebar-section">
              <div className="steps-header">
                <span className="steps-label">{t('steps')}</span>
                <span className="steps-badge">{steps.length}</span>
              </div>
              <nav className="steps-container" aria-label={`${t('steps')} navigation`}>
                {steps.map((step, index) => {
                  const isActive = index === currentIndex;
                  const isCompleted = index < currentIndex;
                  const isUpcoming = index > currentIndex;
                  
                  return (
                    <button
                      key={index}
                      className={`step-nav-item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''} ${isUpcoming ? 'is-upcoming' : ''}`}
                      onClick={() => { if (!isUpcoming) onStepChange(index); }}
                      disabled={isUpcoming}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`${t('step')} ${index + 1}: ${step.title}`}
                      aria-disabled={isUpcoming || undefined}
                    >
                      {isActive && (
                        <div className="step-nav-active-marker" aria-hidden="true"></div>
                      )}
                      <div className="step-nav-content">
                        <div className="step-nav-title">{step.title}</div>
                        {step.meta?.duration && (
                          <div className="step-nav-duration">{step.meta.duration}</div>
                        )}
                      </div>
                      <div className="step-nav-indicator">
                        {isCompleted ? (
                          <svg className="step-check-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <span className="step-nav-number">{index + 1}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Progress */}
            <div className="sidebar-section">
              <div className="progress-info">
                <div className="progress-label">
                  {t('progress')}
                  <span className="progress-percentage">
                    {Math.round(((currentIndex + 1) / steps.length) * 100)}%
                  </span>
                </div>
                <div className="progress-bar-mini">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
                <div className="progress-text">
                  {t('step')} {currentIndex + 1} {t('of')} {steps.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <button
              className="theme-toggle-btn"
              onClick={onThemeToggle}
              aria-label={theme === 'light' ? t('switchToDarkMode') : t('switchToLightMode')}
            >
              {theme === 'light' ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span>{t('darkMode')}</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  <span>{t('lightMode')}</span>
                </>
              )}
            </button>
          )}
          {isCollapsed && (
            <button
              className="theme-toggle-btn-icon"
              onClick={onThemeToggle}
              aria-label={theme === 'light' ? t('switchToDarkMode') : t('switchToLightMode')}
            >
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

