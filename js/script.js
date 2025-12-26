// script.js - client-side logic for Vet Clinic site

// Utility: format datetime nicely
function formatDateTimeLocal(dStr) {
  if (!dStr) return '';
  const d = new Date(dStr);
  if (isNaN(d)) return dStr;
  return d.toLocaleString();
}

/* -----------------------
   Booking: store in localStorage
   ----------------------- */
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem('vc_bookings') || '[]');
  } catch (e) {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem('vc_bookings', JSON.stringify(list));
}

function renderBookings() {
  const el = document.getElementById('appointmentsList');
  if (!el) return;
  const bookings = getBookings().sort((a,b)=> new Date(a.datetime) - new Date(b.datetime));
  el.innerHTML = '';
  if (bookings.length === 0) {
    el.innerHTML = '<div class="app-item">Записей нет</div>';
    return;
  }
  bookings.forEach((b, idx) => {
    const item = document.createElement('div');
    item.className = 'app-item';
    item.innerHTML = `<div><strong>${b.petName}</strong> — ${b.service}<br><small>${formatDateTimeLocal(b.datetime)} · ${b.ownerName}</small></div>
      <div><button class="btn btn-secondary" onclick="removeBooking(${idx})">Отменить</button></div>`;
    el.appendChild(item);
  });
}

function handleBookingSubmit(e) {
  e.preventDefault();
  const ownerName = document.getElementById('ownerName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const petName = document.getElementById('petName').value.trim();
  const species = document.getElementById('species').value;
  const service = document.getElementById('service').value;
  const datetime = document.getElementById('datetime').value;
  const comment = document.getElementById('comment').value.trim();

  if (!ownerName || !phone || !petName || !datetime) {
    alert('Пожалуйста, заполните обязательные поля.');
    return false;
  }

  const bookings = getBookings();
  bookings.push({ownerName,phone,email,petName,species,service,datetime,comment,createdAt:new Date().toISOString()});
  saveBookings(bookings);
  renderBookings();
  alert('Запись сохранена! Мы свяжемся с вами для подтверждения.');
  e.target.reset();
  return false;
}

function removeBooking(idx) {
  const bookings = getBookings();
  if (idx < 0 || idx >= bookings.length) return;
  if (!confirm('Отменить запись?')) return;
  bookings.splice(idx,1);
  saveBookings(bookings);
  renderBookings();
}

function clearBookings() {
  if (!confirm('Очистить все записи?')) return;
  localStorage.removeItem('vc_bookings');
  renderBookings();
}

/* -----------------------
   Calculator: food calculation
   ----------------------- */
function calculateFood(e) {
  e.preventDefault();
  const species = document.getElementById('calc-species').value;
  const weight = parseFloat(document.getElementById('calc-weight').value);
  const age = document.getElementById('calc-age').value;
  const activity = document.getElementById('calc-activity').value;
  const kcal_per_100g = parseFloat(document.getElementById('calc-kcal').value);

  if (!weight || weight <= 0) {
    alert('Введите корректный вес');
    return false;
  }

  // Basal Energy Requirement (simplified):
  // RER = 70 * (weight_kg ^ 0.75)
  const rer = 70 * Math.pow(weight, 0.75);

  // Multiplyers based on species, age and activity - simplified practical chart
  let factor = 1.6; // adult default
  if (species === 'dog') {
    if (age === 'puppy') factor = 3.0;
    if (age === 'senior') factor = 1.4;
  } else if (species === 'cat') {
    if (age === 'puppy') factor = 2.5;
    if (age === 'senior') factor = 1.2;
  }

  if (activity === 'low') factor *= 0.9;
  if (activity === 'high') factor *= 1.2;

  const daily_kcal = Math.round(rer * factor);
  const grams_per_day = Math.round((daily_kcal / kcal_per_100g) * 100);

  const text = `Примерная суточная норма: ${daily_kcal} ккал (~${grams_per_day} г корма при калорийности ${kcal_per_100g} ккал/100г). Это ориентировочная рекомендация.`;
  const resultEl = document.getElementById('calc-result');
  const calcText = document.getElementById('calc-text');
  calcText.textContent = text;
  resultEl.style.display = 'block';

  return false;
}

function resetCalc() {
  const form = document.getElementById('calc-form');
  if (form) form.reset();
  const resultEl = document.getElementById('calc-result');
  if (resultEl) resultEl.style.display = 'none';
}

/* -----------------------
   Quiz: simple scoring
   ----------------------- */
function handleQuizSubmit(e) {
  e.preventDefault();
  const answers = {
    q1: 'b',
    q2: 'b',
    q3: 'b'
  };
  let score = 0;
  for (const q in answers) {
    const els = document.getElementsByName(q);
    let chosen = null;
    for (const el of els) if (el.checked) chosen = el.value;
    if (chosen === answers[q]) score++;
  }
  const text = document.getElementById('quiz-text');
  const resultBox = document.getElementById('quiz-result');
  text.innerHTML = `Вы набрали ${score} из 3. ${score === 3 ? 'Отлично! Вы хорошо ориентируетесь.' : score === 2 ? 'Хорошо, но есть чему поучиться.' : 'Рекомендуем прочитать статьи и проконсультироваться с ветеринаром.'}`;
  resultBox.style.display = 'block';
  return false;
}

function resetQuiz() {
  const form = document.getElementById('quiz-form');
  if (form) form.reset();
  const resultBox = document.getElementById('quiz-result');
  if (resultBox) resultBox.style.display = 'none';
}

/* -----------------------
   Init
   ----------------------- */
document.addEventListener('DOMContentLoaded', function() {
  renderBookings();
});
