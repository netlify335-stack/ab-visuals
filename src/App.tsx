import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { useData } from './lib/DataContext';

function normalize(path: string) {
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}

export default function App() {
  const [path, setPath] = useState(() => normalize(window.location.pathname));
  const { loading } = useData();

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (path !== '/' && path !== '/amit231106') {
      window.history.replaceState({}, '', '/');
      setPath('/');
    }
  }, [path]);

  if (loading) {
    return (
      <div className="boot">
        <div className="boot-mark">AB VISUALS</div>
        <div className="boot-line" />
      </div>
    );
  }

  if (path === '/amit231106') return <Admin />;
  return <Home />;
}
