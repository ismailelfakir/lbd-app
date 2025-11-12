import { useI18n } from '../i18n/context';

type Course = {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  tags: string[];
  image: string;
  totalSteps: number;
  whatYouWillLearn: string[];
  prerequisites: string[];
};

type CourseStep = {
  title: string;
  meta?: {
    duration?: string;
    difficulty?: string;
  };
  section?: 'course' | 'workshop';
};

type CourseDetailsProps = {
  course: Course;
  courseSteps?: CourseStep[];
  onStartLearning: () => void;
  onBack: () => void;
};

export default function CourseDetails({ course, courseSteps, onStartLearning, onBack }: CourseDetailsProps) {
  const { t, language } = useI18n();

  return (
    <div className="course-details">
      <button className="btn-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        {t('backToCourses')}
      </button>

      <div className="course-details-hero">
        <div className="course-details-image">
          <img src={course.image} alt={course.title} />
        </div>
        <div className="course-details-header">
          <div className="course-details-badges">
            <span className="course-badge">{course.difficulty}</span>
            <span className="course-badge">{course.duration}</span>
            <span className="course-badge">{course.totalSteps} {t('steps')}</span>
          </div>
          <h1 className="course-details-title">{course.title}</h1>
          <p className="course-details-description">{course.description}</p>
          <div className="course-details-tags">
            {course.tags.map((tag, i) => (
              <span key={i} className="course-tag">{tag}</span>
            ))}
          </div>
          <button className="btn primary lg course-start-btn" onClick={onStartLearning}>
            {t('startLearning')} →
          </button>
        </div>
      </div>

      <div className="course-details-content">
        <div className="course-details-section">
          <h2 className="course-details-section-title">{t('whatYouWillLearn')}</h2>
          <ul className="course-details-list">
            {course.whatYouWillLearn.map((item, i) => (
              <li key={i} className="course-details-list-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="course-details-section">
          <h2 className="course-details-section-title">{t('prerequisites')}</h2>
          <ul className="course-details-list">
            {course.prerequisites.map((item, i) => (
              <li key={i} className="course-details-list-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {courseSteps && courseSteps.length > 0 && (
          <div className="course-details-section course-details-steps">
            <h2 className="course-details-section-title">
              {language === 'en' ? 'Course Content' : 'Contenu du cours'}
            </h2>
            <div className="course-steps-list">
              {courseSteps.map((step, i) => {
                const isTheory = step.section === 'course';
                const isWorkshop = step.section === 'workshop';
                
                return (
                  <div key={i} className={`course-step-item ${isTheory ? 'course-step-theory' : 'course-step-practice'}`}>
                    <div className="course-step-number">{i + 1}</div>
                    <div className="course-step-content">
                      <h4 className="course-step-title">{step.title}</h4>
                      <div className="course-step-meta-row">
                        {step.meta?.duration && (
                          <span className="course-step-meta">{step.meta.duration}</span>
                        )}
                        {isTheory && (
                          <span className="course-step-badge theory">{language === 'en' ? 'Theory' : 'Théorie'}</span>
                        )}
                        {isWorkshop && (
                          <span className="course-step-badge practice">{language === 'en' ? 'Practice' : 'Pratique'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

