const modal = document.getElementById('doseModal');
const description = document.getElementById('modalDescription');
const authScreen = document.getElementById('authScreen');
const onboardingScreen = document.getElementById('onboardingScreen');
let activeButton;

function showFirstTimeDashboard() {
  document.querySelector('#loginForm .eyebrow').textContent = 'WELCOME TO MEDIGABAY';
  document.querySelector('#loginForm h2').textContent = 'Welcome!';
  document.querySelector('.greeting p').textContent = 'Your caregiver workspace';
  document.querySelector('.greeting h1').innerHTML = 'Welcome to MediGabay <span>👋</span>';
  document.querySelector('.stats-grid').innerHTML = `<article class="stat-card teal empty-stat"><div class="stat-icon">✓</div><div><span>Doses completed</span><strong>0 <em>/ 0</em></strong><small>Add a patient to begin</small></div><div class="mini-ring"><span>—</span></div></article><article class="stat-card amber empty-stat"><div class="stat-icon">◷</div><div><span>Need attention</span><strong>0</strong><small>No doses to review</small></div></article><article class="stat-card coral empty-stat"><div class="stat-icon">▣</div><div><span>Low medicine stock</span><strong>0</strong><small>No medicine added yet</small></div></article>`;
  document.getElementById('timeline').innerHTML = `<div class="empty-state"><span class="empty-icon">◷</span><strong>No schedules yet</strong><p>Add your first patient and their medicine schedule to start tracking doses.</p><button type="button" data-empty-action="patient">Add your first patient</button></div>`;
  const patients = document.querySelector('.patients-card');
  patients.querySelectorAll('.patient-card,.manage-patients').forEach(item => item.remove());
  patients.insertAdjacentHTML('beforeend', `<div class="empty-state"><span class="empty-icon">♙</span><strong>No patients yet</strong><p>Your care profiles will appear here.</p><button type="button" data-empty-action="patient">Add patient</button></div>`);
  document.querySelector('.consistency-content').outerHTML = `<div class="empty-state"><span class="empty-icon">⌁</span><strong>Insights will appear here</strong><p>We need dose logs before we can measure intake consistency.</p></div>`;
  document.querySelector('.insight-note').remove();
  document.querySelector('.stock-list').outerHTML = `<div class="empty-state"><span class="empty-icon">▣</span><strong>No refill forecasts yet</strong><p>Add medicines and stock quantities to see forecast alerts.</p></div>`;
  document.querySelector('.forecast-alert').remove();
}
showFirstTimeDashboard();

const profileModal = document.getElementById('profileModal');
const caregiverForm = document.getElementById('caregiverForm');
const patientForm = document.getElementById('patientForm');
const careState = JSON.parse(localStorage.getItem('medigabay-profiles') || '{"caregiver":null,"patients":[]}');
careState.patients.forEach(patient => { if (!Array.isArray(patient.medications)) patient.medications = []; });
function saveProfiles() { localStorage.setItem('medigabay-profiles', JSON.stringify(careState)); }
function initials(name) { return name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'MG'; }
function closeProfileModal() { profileModal.classList.remove('show'); profileModal.setAttribute('aria-hidden', 'true'); }
function openProfile(type, index = '') {
  profileModal.classList.add('show'); profileModal.setAttribute('aria-hidden', 'false');
  caregiverForm.classList.toggle('hidden', type !== 'caregiver'); patientForm.classList.toggle('hidden', type !== 'patient');
  if (type === 'caregiver') { const profile = careState.caregiver || {}; ['name','phone','email','relationship'].forEach(key => caregiverForm.elements[key].value = profile[key] || ''); }
  else { const profile = index === '' ? {} : careState.patients[index]; patientForm.reset(); patientForm.elements.index.value = index; document.getElementById('patientFormTitle').textContent = index === '' ? 'Add a patient' : 'Edit patient profile'; if (profile) ['name','nickname','birthYear','gender','relationship','notes'].forEach(key => patientForm.elements[key].value = profile[key] || ''); }
}
function renderCaregiver() {
  const mini = document.querySelector('.profile-mini'); const profile = careState.caregiver;
  mini.querySelector('.avatar').textContent = profile ? initials(profile.name) : '＋';
  mini.querySelector('strong').textContent = profile ? profile.name : 'Your profile';
  mini.querySelector('small').textContent = profile ? profile.relationship : 'Add caregiver details';
  document.querySelector('.greeting h1').innerHTML = profile ? `Welcome, ${profile.name.split(' ')[0]} <span>👋</span>` : 'Welcome to MediGabay <span>👋</span>';
}
function renderPatients() {
  const container = document.querySelector('.patients-card'); const heading = container.querySelector('.card-heading p');
  container.querySelectorAll('.patient-card,.empty-state,.manage-patients').forEach(item => item.remove());
  heading.textContent = careState.patients.length ? `${careState.patients.length} ${careState.patients.length === 1 ? 'person' : 'people'} in your care` : 'No patients added yet';
  if (!careState.patients.length) { container.insertAdjacentHTML('beforeend', `<div class="empty-state"><span class="empty-icon">♙</span><strong>No patients yet</strong><p>Create a profile for the person you care for.</p><button type="button" data-empty-action="patient">Add patient</button></div>`); return; }
  careState.patients.forEach((patient, index) => { const age = patient.birthYear ? `${new Date().getFullYear() - patient.birthYear} years old` : patient.relationship; container.insertAdjacentHTML('beforeend', `<button class="patient-card ${index === 0 ? 'selected' : ''}" data-patient-index="${index}"><div class="patient-photo">${initials(patient.nickname || patient.name)}</div><div><strong>${patient.nickname || patient.name}</strong><span>${age || 'Patient profile'}</span><span class="patient-relationship">${patient.relationship || ''}</span></div><b>›</b></button>`); });
  container.insertAdjacentHTML('beforeend', `<button class="manage-patients" type="button" data-empty-action="patient">Add another patient <span>＋</span></button>`);
}
function renderSchedule() {
  const timeline = document.getElementById('timeline');
  if (!careState.patients.length) { timeline.innerHTML = `<div class="empty-state"><span class="empty-icon">◷</span><strong>No schedules yet</strong><p>Add your first patient to begin setting up medication schedules.</p><button type="button" data-empty-action="patient">Add your first patient</button></div>`; return; }
  timeline.innerHTML = `<div class="patient-schedule-list">${careState.patients.map((patient, index) => { const meds = patient.medications || []; const firstMed = meds[0]; return `<button class="patient-schedule ${meds.length ? 'has-meds' : ''}" type="button" data-schedule-patient="${index}"><span class="schedule-avatar">${initials(patient.nickname || patient.name)}</span><div>${meds.length ? `<span class="med-summary"><strong>${patient.nickname || patient.name}</strong><small>${firstMed.name} · ${firstMed.dosage}${meds.length > 1 ? ` +${meds.length - 1} more` : ''}</small></span>` : `<strong>${patient.nickname || patient.name}</strong><span>Set up medication information</span>`}</div>${meds.length ? `<span class="med-count">${meds.length} med${meds.length > 1 ? 's' : ''}</span>` : ''}<b>›</b></button>`; }).join('')}</div>`;
}
function renderProfiles() { renderCaregiver(); renderPatients(); renderSchedule(); }
renderProfiles();
document.querySelector('.profile-mini').addEventListener('click', () => openProfile('caregiver'));
document.querySelectorAll('.add-patient,.plain-plus').forEach(button => button.addEventListener('click', () => openProfile('patient')));
document.addEventListener('click', event => { const addButton = event.target.closest('[data-empty-action="patient"]'); if (addButton) openProfile('patient'); const patientCard = event.target.closest('[data-patient-index]'); if (patientCard) openProfile('patient', Number(patientCard.dataset.patientIndex)); });
document.querySelectorAll('.close-profile').forEach(button => button.addEventListener('click', closeProfileModal));
profileModal.addEventListener('click', event => { if (event.target === profileModal) closeProfileModal(); });
caregiverForm.addEventListener('submit', event => { event.preventDefault(); careState.caregiver = Object.fromEntries(new FormData(caregiverForm)); saveProfiles(); renderProfiles(); closeProfileModal(); showToast('Caregiver profile saved!'); });
patientForm.addEventListener('submit', event => { event.preventDefault(); const patient = Object.fromEntries(new FormData(patientForm)); const index = patient.index; delete patient.index; if (index === '') { patient.medications = []; careState.patients.push(patient); } else { patient.medications = careState.patients[index].medications || []; careState.patients[index] = patient; } saveProfiles(); renderProfiles(); closeProfileModal(); showToast('Patient profile saved!'); });

const medicationModal = document.getElementById('medicationModal');
const medicationForm = document.getElementById('medicationForm');
function closeMedicationModal() { medicationModal.classList.remove('show'); medicationModal.setAttribute('aria-hidden', 'true'); }
function openMedicationSetup(index) {
  const patient = careState.patients[index]; medicationForm.reset(); medicationForm.elements.patientIndex.value = index;
  document.getElementById('medicationTitle').textContent = `${patient.nickname || patient.name}'s medication`;
  medicationModal.classList.add('show'); medicationModal.setAttribute('aria-hidden', 'false');
}
document.addEventListener('click', event => { const patient = event.target.closest('[data-schedule-patient]'); if (patient) openMedicationSetup(Number(patient.dataset.schedulePatient)); });
document.querySelector('.close-medication').addEventListener('click', closeMedicationModal);
medicationModal.addEventListener('click', event => { if (event.target === medicationModal) closeMedicationModal(); });
medicationForm.addEventListener('submit', event => { event.preventDefault(); const medicine = Object.fromEntries(new FormData(medicationForm)); const patientIndex = medicine.patientIndex; delete medicine.patientIndex; careState.patients[patientIndex].medications.push(medicine); saveProfiles(); renderSchedule(); closeMedicationModal(); showToast('Medication information saved!'); });

document.querySelectorAll('[data-show]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
  document.getElementById(button.dataset.show).classList.remove('hidden');
}));
document.querySelectorAll('.auth-form').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault(); authScreen.classList.add('hidden'); onboardingScreen.classList.remove('hidden');
}));
document.querySelectorAll('.auth-language button').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.auth-language button').forEach(item => item.classList.remove('selected')); button.classList.add('selected');
}));
document.querySelectorAll('.password-field button').forEach(button => button.addEventListener('click', () => {
  const input = button.previousElementSibling; input.type = input.type === 'password' ? 'text' : 'password';
}));
function moveToStep(id) {
  document.querySelectorAll('.onboarding-card').forEach(card => card.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  const step = ['welcomeStep', 'rulesStep', 'languageStep'].indexOf(id);
  document.querySelectorAll('.onboarding-progress i').forEach((dot, index) => dot.classList.toggle('active', index <= step));
}
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => moveToStep(button.dataset.next)));
document.getElementById('rulesCheck').addEventListener('change', event => {
  const button = document.getElementById('rulesNext'); button.disabled = !event.target.checked; button.classList.toggle('disabled', !event.target.checked);
});
document.querySelectorAll('.language-option').forEach(option => option.addEventListener('click', () => {
  document.querySelectorAll('.language-option').forEach(item => item.classList.remove('selected')); option.classList.add('selected');
}));
function enterDashboard() { onboardingScreen.classList.add('hidden'); showToast('Welcome to MediGabay — handa na tayong magsimula!'); }
document.getElementById('finishOnboarding').addEventListener('click', enterDashboard);
document.getElementById('startDemo').addEventListener('click', enterDashboard);

document.querySelectorAll('.log-dose').forEach(button => button.addEventListener('click', () => {
  activeButton = button; description.textContent = `${button.dataset.med} for ${button.dataset.patient}`; modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
}));
document.querySelector('.close-modal').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
function closeModal() { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
document.querySelectorAll('.choice').forEach(choice => choice.addEventListener('click', () => { document.querySelectorAll('.choice').forEach(item => item.classList.remove('active')); choice.classList.add('active'); }));
document.getElementById('doseForm').addEventListener('submit', event => {
  event.preventDefault(); const status = document.querySelector('.choice.active').dataset.status;
  if (activeButton) { const row = activeButton.closest('.schedule-row'); row.classList.remove('overdue'); row.classList.add('done'); row.querySelector('.timeline-dot').textContent = '✓'; row.querySelector('.medication span').innerHTML = `For ${activeButton.dataset.patient} <b>•</b> Logged just now`; const chip = document.createElement('span'); chip.className = 'status ontime'; chip.textContent = status; activeButton.replaceWith(chip); document.getElementById('completedCount').textContent = '6'; document.getElementById('attentionCount').textContent = '0'; }
  closeModal(); showToast('Dose logged successfully — salamat!');
});
document.querySelectorAll('.patient-card').forEach(card => card.addEventListener('click', () => { document.querySelectorAll('.patient-card').forEach(item => item.classList.remove('selected')); card.classList.add('selected'); showToast(`Showing ${card.dataset.patient}'s care details`); }));
document.querySelector('.mobile-menu').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
function showToast(message) { let toast = document.querySelector('.toast'); if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.append(toast); } toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
