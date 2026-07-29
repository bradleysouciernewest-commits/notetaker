// textfields.js — floating label support for .md-text-field
function attachTextFields(){
  const fields = Array.from(document.querySelectorAll('.md-text-field'));
  fields.forEach(field=>{
    const input = field.querySelector('input,textarea');
    const label = field.querySelector('label');
    if(!input || !label) return;

    function update(){
      if(input.value && input.value.trim().length > 0) field.classList.add('has-value');
      else field.classList.remove('has-value');
    }
    input.addEventListener('input', update);
    input.addEventListener('focus', ()=> field.classList.add('focused'));
    input.addEventListener('blur', ()=> field.classList.remove('focused'));

    // label click focuses input
    label.addEventListener('click', ()=> input.focus());

    // initialize state
    update();
  });
}

if(typeof window !== 'undefined'){
  window.addEventListener('DOMContentLoaded', ()=> attachTextFields());
}
