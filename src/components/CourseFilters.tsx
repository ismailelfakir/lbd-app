import { useI18n } from '../i18n/context';

type FilterOption = {
  id: string;
  label: string;
  count: number;
};

type FilterCategory = {
  id: string;
  title: string;
  options: FilterOption[];
};

type CourseFiltersProps = {
  filterCategories: FilterCategory[];
  selectedFilters: string[];
  onFilterChange: (filterId: string) => void;
};

export default function CourseFilters({ filterCategories, selectedFilters, onFilterChange }: CourseFiltersProps) {
  const { t, language } = useI18n();

  return (
    <div className="course-filters">
      <h3 className="course-filters-title">{language === 'en' ? 'Filters' : 'Filtres'}</h3>
      {filterCategories.map((category) => (
        <div key={category.id} className="course-filter-category">
          <h4 className="course-filter-category-title">{category.title}</h4>
          <div className="course-filters-list">
            {category.options.map((option) => (
              <label key={option.id} className="course-filter-item">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(option.id)}
                  onChange={() => onFilterChange(option.id)}
                />
                <span className="course-filter-label">
                  {option.label}
                  <span className="course-filter-count">({option.count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

