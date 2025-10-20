// Calculator logic: expression building, live preview, keyboard support
(() => {
  const exprEl = document.getElementById('expression');
  const previewEl = document.getElementById('preview');
  const buttons = document.querySelectorAll('.btn');

  let expression = '';

  function setExpression(value){
    expression = value;
    exprEl.textContent = expression || '0';
    updatePreview();
  }

  function sanitizeForEval(src){
    // Replace unicode operators with JS equivalents
    return src.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  }

  function safeEval(src){
    if(!src) return 0;
    try{
      // Basic safety: allow only digits, operators, decimal point, parentheses, percent and spaces
      const allowed = /^[0-9+\-*/().%\s]*$/;
      const test = sanitizeForEval(src);
      if(!allowed.test(test)) return 'Err';

      // Handle percent: convert 'n%' to '(n/100)'
      const percentHandled = test.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

      // Eval in a safe function scope
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict";return (${percentHandled})`)();
      if(typeof result === 'number' && !Number.isFinite(result)) return '∞';
      return result;
    }catch(e){
      return 'Err';
    }
  }

  function updatePreview(){
    const res = safeEval(expression);
    previewEl.textContent = (res === 'Err') ? '= Err' : `= ${res}`;
  }

  function pushValue(val){
    // Prevent multiple dots in a number segment
    if(val === '.'){
      // split on operators
      const parts = expression.split(/[^0-9.]/);
      const last = parts[parts.length-1] || '';
      if(last.includes('.')) return;
    }

    // Prevent leading zeros like 00
    if(/^[0]$/.test(expression) && /[0-9]/.test(val)){
      setExpression(val);
      return;
    }

    // Append
    setExpression(expression + val);
  }

  function doBackspace(){
    setExpression(expression.slice(0,-1));
  }

  function doClear(){
    setExpression('');
  }

  function doAllClear(){
    setExpression('');
    previewEl.textContent = '= 0';
  }

  function doEquals(){
    const res = safeEval(expression);
    if(res === 'Err'){
      exprEl.textContent = 'Err';
      expression = '';
      previewEl.textContent = '= 0';
      return;
    }
    setExpression(String(res));
  }

  buttons.forEach(btn =>{
    btn.addEventListener('click', ()=>{
      const v = btn.getAttribute('data-value');
      const action = btn.getAttribute('data-action');
      if(action){
        if(action === 'backspace') doBackspace();
        else if(action === 'clear') doClear();
        else if(action === 'all-clear') doAllClear();
        else if(action === 'equals') doEquals();
      }else if(v){
        pushValue(v);
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e)=>{
    const key = e.key;

    // Allow digits
    if(/^[0-9]$/.test(key)){
      pushValue(key);
      e.preventDefault();
      return;
    }

    if(key === 'Enter' || key === '='){
      doEquals();
      e.preventDefault();
      return;
    }

    if(key === 'Backspace'){
      doBackspace();
      e.preventDefault();
      return;
    }

    if(key === 'Escape'){
      doAllClear();
      e.preventDefault();
      return;
    }

    if(key === '.' || key === ','){
      pushValue('.');
      e.preventDefault();
      return;
    }

    if(key === '+' || key === '-' || key === '*' || key === '/' || key === '%'){
      pushValue(key);
      e.preventDefault();
      return;
    }

    // parentheses
    if(key === '(' || key === ')'){
      pushValue(key);
      e.preventDefault();
      return;
    }
  });

  // Initialize
  setExpression('');
})();
