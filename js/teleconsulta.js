/**
 * teleconsulta.js
 * Lógica para la selección visual de los horarios en teleconsulta.html
 */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.horario-item');
  const radios = document.querySelectorAll('input[name="horario"]');

  function updateActive() {
    items.forEach((item, index) => {
      const radio = radios[index];
      if (radio.checked) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  radios.forEach(radio => {
    radio.addEventListener('change', updateActive);
  });

  // Por si se hace clic en el label, sincronizar
  items.forEach((item, index) => {
    item.addEventListener('click', function() {
      const radio = radios[index];
      if (!radio.checked) {
        radio.checked = true;
        updateActive();
      }
    });
  });

  // Inicializar: marcar el primero por defecto si ninguno está seleccionado
  const anyChecked = Array.from(radios).some(r => r.checked);
  if (!anyChecked && radios.length > 0) {
    radios[0].checked = true;
    updateActive();
  }
});
