
export function initLandingPage() {
  const landingPage = document.getElementById('landing-page');
  const appEditor = document.getElementById('app');
  const btnStartNav = document.getElementById('btn-start-nav');
  const btnStartHero = document.getElementById('btn-start-hero');

  if (!landingPage || !appEditor) return;

  // Check valid session or just default to landing
  // For now, always show landing on fresh load unless URL param exists?
  // Let's keep it simple: Show landing.
  
  const startEditor = () => {
    // Fade out landing
    landingPage.style.opacity = '0';
    
    setTimeout(() => {
      landingPage.style.display = 'none';
      appEditor.style.display = 'flex'; // Restore flex layout
      
      // Fade in editor
      appEditor.style.opacity = '0';
      requestAnimationFrame(() => {
        appEditor.style.opacity = '1';
      });
      
      // Trigger resize to ensure canvas renders correctly after becoming visible
      window.dispatchEvent(new Event('resize'));
    }, 500); // Match transition duration
  };

  if (btnStartNav) btnStartNav.addEventListener('click', startEditor);
  if (btnStartHero) btnStartHero.addEventListener('click', startEditor);
}
