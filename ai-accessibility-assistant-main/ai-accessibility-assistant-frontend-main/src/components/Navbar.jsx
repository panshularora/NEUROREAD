import { useEffect, useMemo, useState } from 'react';

export default function Navbar({ mode, onModeChange, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const newIsDark = !isDark;
    
    // Inject overlay
    const overlay = document.createElement('div');
    overlay.id = 'theme-overlay';
    overlay.style.backgroundColor = newIsDark ? '#1A1A1A' : '#F2F0E9';
    document.body.appendChild(overlay);

    const anim = overlay.animate([
      { clipPath: `circle(0% at ${originX}px ${originY}px)` },
      { clipPath: `circle(150% at ${originX}px ${originY}px)` }
    ], {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });

    anim.onfinish = () => {
      document.documentElement.classList.toggle('dark', newIsDark);
      document.body.classList.toggle('dark', newIsDark);
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      setIsDark(newIsDark);
      overlay.remove();
    };
  };

  const className = useMemo(() => {
    const base =
      'fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 rounded-full px-6 py-3 flex items-center justify-between w-[90%] max-w-5xl border';
    if (!scrolled) return `${base} bg-transparent text-cream border-transparent`;
    return `${base} bg-white/60 backdrop-blur-md text-moss border-moss/10`;
  }, [scrolled]);

  return (
    <nav id="navbar" className={className}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-moss/5 flex items-center justify-center overflow-hidden border border-moss/10">
          <img src="/logo.png" alt="Neuroread Logo" className="w-6 h-6 object-contain" />
        </div>
        <div className="uppercase text-sm font-medium tracking-[0.2em]">N e u r o r e a d</div>
      </div>

      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full border border-moss/20 flex items-center justify-center transition-all hover:bg-moss/5 group relative overflow-hidden"
          aria-label="Toggle dark mode"
        >
          <div key={isDark ? 'dark' : 'light'} className="theme-icon-anim flex items-center justify-center">
            <span 
              className="iconify text-[1.1rem]" 
              data-icon={isDark ? 'solar:sun-linear' : 'solar:moon-linear'} 
            />
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8 font-medium text-xs tracking-wide uppercase">
          <a
            href="#modes"
            onClick={(e) => {
              e.preventDefault();
              onModeChange('assistive');
              onNavigate?.('modes');
            }}
            className="hover:opacity-70 transition-opacity"
            aria-current={mode === 'assistive' ? 'page' : undefined}
          >
            ASSIST
          </a>
          <a
            href="#modes"
            onClick={(e) => {
              e.preventDefault();
              onModeChange('learning');
              onNavigate?.('modes');
            }}
            className="hover:opacity-70 transition-opacity"
            aria-current={mode === 'learning' ? 'page' : undefined}
          >
            LEARNING
          </a>
          <a
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('dashboard');
            }}
            className="hover:opacity-70 transition-opacity"
          >
            DASHBOARD
          </a>
        </div>
      </div>
    </nav>
  );
}

