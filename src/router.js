import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const PathContext = createContext({
  path: '/',
  navigate: () => {},
});

export function Router({ children }) {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  const navigate = useCallback((to, { replace = false } = {}) => {
    const next = to || '/';
    if (next !== window.location.pathname) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({}, '', next);
    }
    setPath(next);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    function onPopState() {
      setPath(window.location.pathname || '/');
      window.scrollTo(0, 0);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <PathContext.Provider value={{ path, navigate }}>
      {children}
    </PathContext.Provider>
  );
}

export function usePath() {
  return useContext(PathContext).path;
}

export function Link({ to, className, children, end = false }) {
  const { path, navigate } = useContext(PathContext);
  const active = end ? path === to : path === to || path.startsWith(`${to}/`);
  const classes = [className, active ? 'active' : ''].filter(Boolean).join(' ');

  return (
    <a
      href={to}
      className={classes || undefined}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
