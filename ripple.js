// Improved ripple with pointercancel and keyboard handling
export function attachRipples(selector = '.ripple'){
  const nodes = Array.from(document.querySelectorAll(selector));
  nodes.forEach(el=>{
    // ensure the element can contain absolute children
    if(getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';

    let activeRipple = null;
    let pointerId = null;

    function createRipple(x, y){
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (x - rect.left - size/2) + 'px';
      ripple.style.top = (y - rect.top - size/2) + 'px';
      el.appendChild(ripple);
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      ripple.offsetWidth;
      ripple.classList.add('ripple-animate');
      return ripple;
    }

    function removeRipple(rip){
      if(!rip) return;
      rip.remove();
      if(activeRipple === rip) activeRipple = null;
    }

    el.addEventListener('pointerdown', (e)=>{
      if(e.button !== 0) return;
      pointerId = e.pointerId;
      activeRipple = createRipple(e.clientX, e.clientY);

      function endHandler(ev){
        if(ev.pointerId !== pointerId) return;
        removeRipple(activeRipple);
        el.removeEventListener('pointerup', endHandler);
        el.removeEventListener('pointercancel', cancelHandler);
      }
      function cancelHandler(ev){
        if(ev.pointerId !== pointerId) return;
        removeRipple(activeRipple);
        el.removeEventListener('pointerup', endHandler);
        el.removeEventListener('pointercancel', cancelHandler);
      }

      el.addEventListener('pointerup', endHandler);
      el.addEventListener('pointercancel', cancelHandler);
    });

    // keyboard activation (Enter/Space) - create centered ripple
    el.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        // create centered ripple
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width/2;
        const y = rect.top + rect.height/2;
        const rip = createRipple(x,y);
        setTimeout(()=> removeRipple(rip), 600);
      }
    });
  });
}

// auto-attach on load
if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', ()=>{
    attachRipples('.ripple');
  });
}
