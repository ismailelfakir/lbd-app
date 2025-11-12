import { useI18n } from '../i18n/context';

type Course = {
  id: string;
  title: string;
  shortDescription: string;
  duration: string;
  difficulty: string;
  tags: string[];
  image: string;
  totalSteps: number;
};

type CourseCardProps = {
  course: Course;
  onClick: () => void;
};

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const { t } = useI18n();

  return (
    <div className="course-card" onClick={onClick}>
      <div className="course-card-image">
        <img src={course.image} alt={course.title} />
        <div className="course-card-overlay">
          <span className="course-card-difficulty">{course.difficulty}</span>
        </div>
      </div>
      <div className="course-card-content">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-description">{course.shortDescription}</p>
        <div className="course-card-meta">
          <span className="course-card-duration">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {course.duration}
          </span>
          <span className="course-card-steps">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {course.totalSteps} {t('steps')}
          </span>
        </div>
        <div className="course-card-tags">
          {course.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="course-card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

