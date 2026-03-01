interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F4] dark:bg-[#1C1C1A] transition-colors duration-200 overflow-x-hidden font-sans">
      <header className="h-20 flex items-center justify-between px-8 md:px-16 fixed top-0 w-full z-50 bg-[#F9F8F4]/80 dark:bg-[#1C1C1A]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-50 font-display">ScreenCraft</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-primary transition-colors">Features</a>
          <a href="#" className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-primary transition-colors">Showcase</a>
          <button 
            onClick={onStart} 
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-medium text-sm shadow-md hover:shadow-lg transition-all"
          >
            Launch Editor
          </button>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-8 md:px-16 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-sage-100 dark:bg-stone-800 px-4 py-1.5 rounded-full border border-primary/20">
            <span className="material-icons-round text-primary text-sm">stars</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">New: iPhone 15 Pro Support</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-stone-800 dark:text-white leading-[1.1] font-display">
            Elevate your App <br />
            <span className="text-primary italic">Presence.</span>
          </h2>

          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-lg leading-relaxed">
            Create breathtaking App Store screenshots with a minimal, professional aesthetic. Designed for founders who care about the details.
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onStart} 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              Start Creating
              <span className="material-icons-round">arrow_forward</span>
            </button>
            <button className="bg-white dark:bg-stone-800 text-stone-800 dark:text-white border border-border-light dark:border-stone-700 px-8 py-4 rounded-full font-bold text-lg shadow-md hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
              View Examples
            </button>
          </div>

          <div className="flex items-center gap-12 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-800 dark:text-white font-display">100%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Client Side</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-800 dark:text-white font-display">4K</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Export Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-800 dark:text-white font-display">0$</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Free Forever</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] bg-sage-300 dark:bg-stone-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-[85%] bg-stone-900 rounded-[2.5rem] shadow-2xl border-[10px] border-stone-800 overflow-hidden transform group-hover:scale-105 transition-transform duration-700">
               <div className="w-full h-full bg-[#262624] flex items-center justify-center">
                 <span className="material-icons-round text-stone-700 text-6xl">image</span>
               </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-xl border border-border-light dark:border-stone-700 animate-bounce cursor-default">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-icons-round text-primary">auto_awesome</span>
              </div>
              <div>
                <div className="text-xs font-bold text-stone-800 dark:text-white">Smart Layout</div>
                <div className="text-[10px] text-stone-500">Auto-aligns elements</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-8 text-center bg-stone-50 dark:bg-stone-900/50 border-t border-border-light dark:border-border-dark">
         <p className="text-stone-400 text-xs font-medium uppercase tracking-[0.2em]">© 2026 ScreenCraft Dashboard. Built with Sage &amp; Soul.</p>
      </footer>
    </div>
  );
}
