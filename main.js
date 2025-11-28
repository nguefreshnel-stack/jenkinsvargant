document.getElementById('themeToggle')?.addEventListener('click',()=>{
  document.documentElement.classList.toggle('dark');
});
document.getElementById('contactForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  document.getElementById('msg').textContent='Thanks! Message not actually sent in this demo.';
});