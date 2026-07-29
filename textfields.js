// textfields.js — floating label + counter support for .md-text-field
function attachTextFields(){
  const fields = Array.from(document.querySelectorAll('.md-text-field'));
  fields.forEach(field=>{
    const input = field.querySelector('input,textarea');
    const label = field.querySelector('label');
    const helper = field.querySelector('.helper');
    const counter = field.querySelector('.counter');
    const max = input && input.getAttribute('maxlength') ? parseInt(input.getAttribute('maxlength'),10) : null;

    if(!input || !label) return;

    function update(){
      if(input.value && input.value.trim().length > 0) field.classList.add('has-value');
      else field.classList.remove('has-value');

      if(counter && max !== null){
        const len = input.value.length;
        counter.textContent = `${len}/${max}`;
        if(len >= max) counter.classList.add('limit'); else counter.classList.remove('limit');
      }
    }
    input.addEventListener('input', update, {passive:true});
    input.addEventListener('focus', ()=> field.classList.add('focused'));
    input.addEventListener('blur', ()=> field.classList.remove('focused'));

    // label click focuses input
    label.addEventListener('click', ()=> input.focus());

    // initialize state
    if(helper && !helper.textContent.trim()){
      const dh = field.dataset.helper;
      if(dh) helper.textContent = dh;
    }
    update();
  });
}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', ()=> attachTextFields());
}
