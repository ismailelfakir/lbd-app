type NavigationProps = {
  onPrev: () => void;
  onNext: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  variant?: 'bottom' | 'side';
};

export default function Navigation({ onPrev, onNext, disablePrev, disableNext, variant = 'side' }: NavigationProps) {
  if (variant === 'side') {
    return (
      <div className="nav nav-side" aria-label="Step navigation">
        <button
          className="btn side left"
          onClick={onPrev}
          disabled={!!disablePrev}
          aria-label="Previous step"
        >
          Previous
        </button>
        <button
          className="btn primary side right"
          onClick={onNext}
          disabled={!!disableNext}
          aria-label="Next step"
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <div className="nav">
      <button className="btn" onClick={onPrev} disabled={!!disablePrev} aria-label="Previous step">
        Previous
      </button>
      <button className="btn primary" onClick={onNext} disabled={!!disableNext} aria-label="Next step">
        Next
      </button>
    </div>
  );
}


