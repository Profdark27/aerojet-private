export function loadSplineScene(container: string, sceneUrl: string) {
  if (typeof window === 'undefined') return;
  const el = document.querySelector(container);
  if (!el) return;
  
  // If already has content, don't re-inject
  if (el.innerHTML !== '') return;

  const iframe = document.createElement('iframe');
  iframe.src = sceneUrl;
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.pointerEvents = 'none'; // Keep it non-interactive for decorative use
  el.innerHTML = '';
  el.appendChild(iframe);
}
