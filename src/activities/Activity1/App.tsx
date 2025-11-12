import { useMemo, useState, useEffect } from 'react';
import Step from './components/Step';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import CourseCard from '../../components/CourseCard';
import CourseDetails from '../../components/CourseDetails';
import CourseFilters from '../../components/CourseFilters';
import { useI18n } from '../../i18n/context';
import stepsDataEn from '../../data/steps_en.json';
import stepsDataFr from '../../data/steps_fr.json';
import coursesDataEn from '../../data/courses_en.json';
import coursesDataFr from '../../data/courses_fr.json';
import './styles.css';

type StepBlock = 
  | { type: 'text'; content: string }
  | { type: 'code'; language?: string; content: string }
  | { type: 'explain'; content: string }
  | { type: 'quiz'; question: string; options: string[]; answer: string }
  | { type: 'action'; content: string };

type StepItem = {
  courseId?: string;
  section: 'course' | 'workshop';
  title: string;
  meta?: { duration?: string; difficulty?: string; tags?: string[] };
  blocks?: StepBlock[];
  // Legacy fields for backward compatibility (deprecated)
  content?: string;
  code?: string;
  explain?: string;
  quiz?: string | { question: string; options: string[]; answer: string };
  diagram?: string;
  sandbox?: { template?: string; file?: string };
  action?: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  duration: string;
  difficulty: string;
  tags: string[];
  image: string;
  totalSteps: number;
  whatYouWillLearn: string[];
  prerequisites: string[];
};

type View = 'courses' | 'course-details' | 'learning';

export default function App() {
  const { language, t } = useI18n();
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('lbd.activity1.view');
    return (saved as View) || 'courses';
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    return localStorage.getItem('lbd.activity1.selectedCourse');
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setShowFilters(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allCourses = useMemo<Course[]>(() => {
    return (language === 'fr' ? coursesDataFr : coursesDataEn) as Course[];
  }, [language]);

  const courses = useMemo<Course[]>(() => {
    if (selectedFilters.length === 0) return allCourses;
    return allCourses.filter(course => {
      return selectedFilters.some(filterId => {
        if (filterId.startsWith('difficulty-')) {
          const difficulty = filterId.replace('difficulty-', '');
          return course.difficulty === difficulty;
        }
        if (filterId.startsWith('tag-')) {
          const tag = filterId.replace('tag-', '');
          return course.tags.includes(tag);
        }
        return false;
      });
    });
  }, [allCourses, selectedFilters]);

  const filterCategories = useMemo(() => {
    const difficulties = [...new Set(allCourses.map(c => c.difficulty))];
    const tags = [...new Set(allCourses.flatMap(c => c.tags))];
    
    return [
      {
        id: 'difficulty',
        title: language === 'en' ? 'Difficulty' : 'Difficulté',
        options: difficulties.map(d => ({
          id: `difficulty-${d}`,
          label: d,
          count: allCourses.filter(c => c.difficulty === d).length
        }))
      },
      {
        id: 'tags',
        title: language === 'en' ? 'Tags' : 'Étiquettes',
        options: tags.map(t => ({
          id: `tag-${t}`,
          label: t,
          count: allCourses.filter(c => c.tags.includes(t)).length
        }))
      }
    ];
  }, [allCourses, language]);

  function handleFilterChange(filterId: string) {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  }

  const allSteps = useMemo<StepItem[]>(() => {
    return (language === 'fr' ? stepsDataFr : stepsDataEn) as StepItem[];
  }, [language]);

  const steps = useMemo<StepItem[]>(() => {
    // For learning view, show only course (theory) steps for the selected course
    const courseSteps = allSteps.filter(step => {
      if (step.section !== 'course') return false;
      // If courseId is specified, filter by it; otherwise show steps without courseId (legacy Next.js steps)
      if (selectedCourseId) {
        return step.courseId === selectedCourseId;
      }
      // Default to Next.js course if no courseId specified (backward compatibility)
      return !step.courseId || step.courseId === 'nextjs-fundamentals';
    });
    return courseSteps;
  }, [allSteps, selectedCourseId]);

  const selectedCourse = useMemo<Course | null>(() => {
    if (!selectedCourseId) return null;
    return courses.find(c => c.id === selectedCourseId) || null;
  }, [selectedCourseId, courses]);

  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem(`lbd.activity1.step.${language}`);
    return saved ? Number(saved) || 0 : 0;
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('lbd.theme') as 'light' | 'dark') || 'light');

  // Load step index for current language when language changes
  useEffect(() => {
    if (view === 'learning') {
      const saved = localStorage.getItem(`lbd.activity1.step.${language}`);
      if (saved) {
        const savedIndex = Number(saved) || 0;
        setCurrentIndex(Math.min(savedIndex, steps.length - 1));
      } else {
        setCurrentIndex(0);
      }
    }
    setShowQuiz(false);
    setQuizAnswered(false);
  }, [language, steps.length, view]);

  const total = steps.length;
  const current = steps[currentIndex];
  // Check for quiz in blocks (new structure) or legacy quiz field
  const hasQuizBlock = current?.blocks?.some(b => b.type === 'quiz');
  const hasLegacyQuiz = current?.quiz && (typeof current.quiz === 'object' ? 'question' in current.quiz : true);
  const hasQuiz = hasQuizBlock || hasLegacyQuiz;

  function handleCourseClick(courseId: string) {
    setSelectedCourseId(courseId);
    localStorage.setItem('lbd.activity1.selectedCourse', courseId);
    setView('course-details');
    localStorage.setItem('lbd.activity1.view', 'course-details');
  }

  function handleStartLearning() {
    setView('learning');
    localStorage.setItem('lbd.activity1.view', 'learning');
  }

  function handleBackToCourses() {
    setView('courses');
    localStorage.setItem('lbd.activity1.view', 'courses');
  }

  function handleNavigateToCourses() {
    setView('courses');
    localStorage.setItem('lbd.activity1.view', 'courses');
    // Clear selected course when navigating to courses list
    setSelectedCourseId(null);
    localStorage.removeItem('lbd.activity1.selectedCourse');
  }

  function goPrev() {
    if (showQuiz) {
      setShowQuiz(false);
      setQuizAnswered(false);
      return;
    }
    if (currentIndex === 0) return;
    triggerFade(() => {
      setCurrentIndex((i) => Math.max(0, i - 1));
      setShowQuiz(false);
      setQuizAnswered(false);
    });
  }
  function goNext() {
    if (showQuiz) {
      if (!quizAnswered) return;
      triggerFade(() => {
        if (currentIndex < total - 1) {
          setCurrentIndex((i) => Math.min(total - 1, i + 1));
          setShowQuiz(false);
          setQuizAnswered(false);
        }
      });
      return;
    }
    if (hasQuiz) {
      setShowQuiz(true);
      setQuizAnswered(false);
      return;
    }
    if (currentIndex === total - 1) return;
    triggerFade(() => setCurrentIndex((i) => Math.min(total - 1, i + 1)));
  }
  function handleStepChange(index: number) {
    if (index === currentIndex || index > currentIndex) return;
    triggerFade(() => {
      setCurrentIndex(index);
      setShowQuiz(false);
      setQuizAnswered(false);
    });
  }
  function triggerFade(change: () => void) {
    setIsFading(true);
    setTimeout(() => { change(); setIsFading(false); }, 200);
  }

  function handleActivitySwitch(activity: 'activity1' | 'activity2') {
    if (window.location.pathname !== `/${activity}`) {
      history.pushState({}, '', `/${activity}`);
      window.dispatchEvent(new Event('popstate'));
      setCurrentActivity(activity);
    }
  }

  function handleThemeToggle() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  const [currentActivity, setCurrentActivity] = useState<'activity1' | 'activity2'>(() => {
    return window.location.pathname.startsWith('/activity2') ? 'activity2' : 'activity1';
  });

  useEffect(() => {
    if (view === 'learning') {
      localStorage.setItem(`lbd.activity1.step.${language}`, String(currentIndex));
    }
    setShowQuiz(false);
    setQuizAnswered(false);
  }, [currentIndex, language, view]);

  useEffect(() => {
    if (view === 'learning') {
      function onKey(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      }
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [currentIndex, total, showQuiz, quizAnswered, view]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lbd.theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateActivity = () => {
      setCurrentActivity(window.location.pathname.startsWith('/activity2') ? 'activity2' : 'activity1');
    };
    updateActivity();
    window.addEventListener('popstate', updateActivity);
    return () => window.removeEventListener('popstate', updateActivity);
  }, []);

  // Course List View
  if (view === 'courses') {
    return (
      <div className="app-container-full">
        <Navbar
          theme={theme}
          onThemeToggle={handleThemeToggle}
          currentPath="/activity1"
          onNavigateToCourses={handleNavigateToCourses}
        />
        <div className="courses-page-layout">
          {/* Desktop Sidebar */}
          <aside className="courses-sidebar">
            <div className="courses-sidebar-content">
              <CourseFilters
                filterCategories={filterCategories}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Mobile Filters Toggle Button */}
          {isMobile && (
            <button
              className="courses-filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
              aria-label={showFilters ? (language === 'en' ? 'Hide filters' : 'Masquer les filtres') : (language === 'en' ? 'Show filters' : 'Afficher les filtres')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span>{language === 'en' ? 'Filters' : 'Filtres'}</span>
              {selectedFilters.length > 0 && (
                <span className="filters-badge">{selectedFilters.length}</span>
              )}
            </button>
          )}

          {/* Mobile Filters Overlay */}
          {isMobile && showFilters && (
            <>
              <div
                className="courses-filters-backdrop"
                onClick={() => setShowFilters(false)}
                aria-hidden="true"
              />
              <aside className="courses-filters-mobile">
                <div className="courses-filters-mobile-header">
                  <h3>{language === 'en' ? 'Filters' : 'Filtres'}</h3>
                  <button
                    className="courses-filters-close"
                    onClick={() => setShowFilters(false)}
                    aria-label={language === 'en' ? 'Close filters' : 'Fermer les filtres'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div className="courses-filters-mobile-content">
                  <CourseFilters
                    filterCategories={filterCategories}
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </aside>
            </>
          )}

          <div className="courses-main-content">
            <div className="courses-container">
              <div className="courses-grid">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={() => handleCourseClick(course.id)}
                    />
                  ))
                ) : (
                  <div className="courses-empty">
                    <p>{language === 'en' ? 'No courses match your filters' : 'Aucun cours ne correspond à vos filtres'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Course Details View
  if (view === 'course-details' && selectedCourse) {
    return (
      <div className="app-container-full">
        <Navbar
          theme={theme}
          onThemeToggle={handleThemeToggle}
          currentPath="/activity1"
          onNavigateToCourses={handleNavigateToCourses}
        />
        <div className="main-content-full">
          <CourseDetails
            course={selectedCourse}
            courseSteps={allSteps
              .filter(s => {
                // Filter by courseId if specified
                if (selectedCourseId) {
                  if (s.courseId !== selectedCourseId) return false;
                } else {
                  // Default to Next.js course if no courseId specified (backward compatibility)
                  if (s.courseId && s.courseId !== 'nextjs-fundamentals') return false;
                }
                // Filter out action blocks with 'start-workshop' (new structure)
                const hasStartWorkshopAction = s.blocks?.some(b => b.type === 'action' && b.content === 'start-workshop');
                // Filter out legacy action field (old structure)
                const hasLegacyAction = s.action === 'start-workshop';
                return !hasStartWorkshopAction && !hasLegacyAction;
              })
              .map(s => ({
                title: s.title,
                meta: s.meta,
                section: s.section
              }))}
            onStartLearning={handleStartLearning}
            onBack={handleBackToCourses}
          />
        </div>
      </div>
    );
  }

  // Learning View (existing step-by-step view)
  return (
    <div className="app-container-with-sidebar">
      <Sidebar
        steps={steps}
        currentIndex={currentIndex}
        onStepChange={handleStepChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onActivitySwitch={handleActivitySwitch}
        currentActivity={currentActivity}
        activityTitle={selectedCourse?.title || t('theory')}
        activitySubtitle="Next.js Learning"
      />
      <div className="main-content">
        <div className="deck">
          <button className="btn-back-to-courses" onClick={handleBackToCourses}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {t('backToCourses')}
          </button>
          <div className="progress-bar"><div className="bar" style={{ width: `${((currentIndex + 1) / total) * 100}%` }} /></div>
          <div className="workshop-header">
            <h2 className="workshop-title">
              {selectedCourse?.title || t('theory')} – {t('step')} {currentIndex + 1} / {total}
              {showQuiz && <span className="quiz-indicator"> · {t('quizCheckpoint')}</span>}
            </h2>
          </div>
          <div className={`slide-wrapper ${isFading ? 'fade' : ''}`}>
            <Step step={current} showQuiz={showQuiz} onQuizAnswered={() => setQuizAnswered(true)} />
          </div>
          <div className="step-navigation">
            <button 
              className="btn-nav-step" 
              onClick={goPrev} 
              disabled={currentIndex === 0 && !showQuiz} 
              aria-label={`${t('previous')} ${t('step')}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>{t('previous')}</span>
            </button>
            <button 
              className="btn-nav-step primary" 
              onClick={goNext} 
              disabled={(!showQuiz && currentIndex === total - 1) || (showQuiz && !quizAnswered)} 
              aria-label={`${t('next')} ${t('step')}`}
            >
              <span>{t('next')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
