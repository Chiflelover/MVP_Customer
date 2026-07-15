/**
 * diagnostico.js
 * Lógica para mostrar las recomendaciones y el resultado del diagnóstico
 * en base a los síntomas guardados en el sessionStorage.
 */
document.addEventListener('DOMContentLoaded', () => {
  const resultBadge = document.getElementById('resultBadge');
  const resultMessage = document.getElementById('resultMessage');
  const recContainer = document.getElementById('recommendationsContainer');

  // Leer síntomas de sessionStorage
  const rawSymptoms = sessionStorage.getItem('selectedSymptoms');
  const symptoms = rawSymptoms ? JSON.parse(rawSymptoms) : [];

  // Leer tiempo de enfermedad
  const rawTiempo = sessionStorage.getItem('tiempo');
  let days = null;
  if (rawTiempo) {
    const numMatch = rawTiempo.match(/(\d+)/);
    if (numMatch) {
      days = parseInt(numMatch[1]);
    }
  }

  // Lógica de gravedad consistente con formulario.js
  const isGrave = symptoms.length >= 3 || (days && days >= 7 && symptoms.length >= 2);
  
  // Actualizar estilos y mensajes de la tarjeta de diagnóstico
  if (isGrave) {
    resultBadge.textContent = 'Atención Requerida';
    resultBadge.style.background = 'rgba(232, 67, 94, 0.1)';
    resultBadge.style.color = '#e8435e';
    resultBadge.style.borderColor = 'rgba(232, 67, 94, 0.2)';
    resultMessage.textContent = 'Se detectan varios síntomas concurrentes. Te recomendamos consultar con un médico de inmediato.';
  } else {
    resultBadge.textContent = 'Caso Leve';
    resultBadge.style.background = 'rgba(42, 125, 225, 0.08)';
    resultBadge.style.color = '#2a7de1';
    resultBadge.style.borderColor = 'rgba(42, 125, 225, 0.08)';
    resultMessage.textContent = 'Tus síntomas parecen ser leves. Recomendamos reposo y cuidados en casa.';
  }

  // Generar recomendaciones dinámicas
  let recs = [];
  if (isGrave) {
    recs = [
      'Consultar con un médico profesional (Teleconsulta o Presencial)',
      'Monitorear frecuentemente la temperatura y síntomas',
      'Evitar realizar actividades físicas o esfuerzos intensos'
    ];
  } else {
    recs.push('Descansar y reponer energías');
    recs.push('Hidratarse adecuadamente con abundante agua o suero');
    
    if (symptoms.includes('Fiebre') || symptoms.includes('Dolor de cabeza')) {
      recs.push('Tomar paracetamol si presentas molestias, según dosis recomendadas');
    } else if (symptoms.includes('Dolor de garganta') || symptoms.includes('Tos')) {
      recs.push('Tomar bebidas tibias para suavizar la garganta');
    } else {
      recs.push('Monitorear la evolución en las próximas 24 horas');
    }
  }

  // Renderizar recomendaciones en el DOM
  let html = '<p>Te recomendamos:</p>';
  recs.forEach(rec => {
    html += `
      <div class="recomendacion-item">
        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
        <span>${rec}</span>
      </div>
    `;
  });
  recContainer.innerHTML = html;
});
