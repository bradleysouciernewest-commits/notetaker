// Lightweight ripple implementation (Material-inspired)
export function attachRipples(selector = '.ripple'){
  const nodes = Array.from(document.querySelectorAll(selector));
  nodes.forEach(el=>{
    // ensure the element can contain absolute children
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';
    el.addEventListener('pointerdown', (e)=>{
      // ignore secondary buttons
      if(e.button !== 0) return;
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = size + 'px';
      const left = e.clientX - rect.left - size/2;
      const top = e.clientY - rect.top - size/2;
      ripple.style.left = left + 'px';
      ripple.style.top = top + 'px';
      el.appendChild(ripple);
      // force reflow then animate
      // eslint-disable-next-line no-unused-expressions
      ripple.offsetWidth;
      ripple.classList.add('ripple-animate');
      // remove after animation
      setTimeout(()=>{
        ripple.remove();
      }, 600);
    });
  });
}

// auto-attach on load
if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', ()=>{
    attachRipples('.ripple');
  });
}
