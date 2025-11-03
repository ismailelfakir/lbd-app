import { useEffect, useMemo, useState } from 'react';
import Activity1 from './activities/Activity1/App';
import Activity2 from './activities/Activity2/App';

function usePathname() {
  const [path, setPath] = useState<string>(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return [path, (to: string) => { if (to !== window.location.pathname) { history.pushState({}, '', to); const event = new Event('popstate'); window.dispatchEvent(event); } }] as const;
}

export default function Router() {
  const [path, navigate] = usePathname();
  const route = useMemo(() => {
    if (path.startsWith('/activity2')) return 'activity2';
    if (path.startsWith('/activity1')) return 'activity1';
    return 'activity1';
  }, [path]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '12px 0' }}>
        <button className="btn" onClick={() => navigate('/activity1')}>Activity 1 – Theory</button>
        <button className="btn primary" onClick={() => navigate('/activity2')}>Activity 2 – Workshop</button>
      </div>
      {route === 'activity1' ? <Activity1 /> : <Activity2 />}
    </div>
  );
}


