/* app.js
   ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
   1) Enrollment (Add Student)
   2) Face Registration (Register Face for Existing Student)
   3) [Attendance scanning stub—add later]
*/

// ─── 1) ENROLLMENT: DOM References & Globals ───────────────────────────────────
const enrollVideo       = document.getElementById('webcam');          // <video id="webcam">
const snapshotCanvas    = document.getElementById('snapshot');       // <canvas id="snapshot">
const snapshotCtx       = snapshotCanvas.getContext('2d');
const captureEnrollBtn  = document.getElementById('capture');        // <button id="capture">
const addStudentForm    = document.getElementById('add-student-form');// <form id="add-student-form">
const studentListEl     = document.getElementById('student-list');   // <ul id="student-list">

let students       = [];  // will hold {id, name, class, parentEmail, face?, descriptor?}
let enrollFaceData = '';  // base64 from canvas snapshot

// Load students from localStorage
function loadStudents() {
  const saved = localStorage.getItem('students');
  if (saved) students = JSON.parse(saved);
}

// Render the list of enrolled students (with any face image they have)
function renderStudentList() {
  studentListEl.innerHTML = '';
  if (students.length === 0) {
    studentListEl.innerHTML = '<li>No students enrolled.</li>';
    return;
  }
  students.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${s.face || 'assets/placeholder.png'}" width="80" style="vertical-align:middle; margin-right:8px;">
      <strong>${s.name}</strong> — ${s.class}<br>
      Parent: <em>${s.parentEmail}</em>
    `;
    studentListEl.appendChild(li);
  });
}

// Start the webcam for enrollment
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(stream => enrollVideo.srcObject = stream)
  .catch(err => console.error('Webcam error:', err));

// Capture snapshot for enrollment
captureEnrollBtn.addEventListener('click', () => {
  snapshotCtx.drawImage(enrollVideo, 0, 0, snapshotCanvas.width, snapshotCanvas.height);
  enrollFaceData = snapshotCanvas.toDataURL('image/png');
  snapshotCanvas.style.display = 'block';
});

// Handle the “Add Student” form submit
addStudentForm.addEventListener('submit', e => {
  e.preventDefault();
  const name        = document.getElementById('student-name').value.trim();
  const studentCls  = document.getElementById('student-class').value.trim();
  const parentEmail = document.getElementById('parent-email').value.trim();

  if (!name || !studentCls || !parentEmail) {
    return alert('Please fill in all fields.');
  }
  if (!enrollFaceData) {
    return alert('Please capture the student’s face.');
  }

  const newStudent = {
    id:          Date.now(),
    name,
    class:       studentCls,
    parentEmail,
    face:        enrollFaceData,
    descriptor:  null     // to be set in face registration
  };
  students.push(newStudent);
  localStorage.setItem('students', JSON.stringify(students));

  alert(`✅ Saved ${name}!`);
  addStudentForm.reset();
  snapshotCanvas.style.display = 'none';
  enrollFaceData = '';
  renderStudentList();
});

// On page load, seed & render
window.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  renderStudentList();
});



// ─── 2) FACE REGISTRATION: DOM & Globals ─────────────────────────────────────
const studentSelect    = document.getElementById('student-select');  // <select id="student-select">
const startRegBtn      = document.getElementById('start-camera');    // <button id="start-camera">
const regVideo         = document.getElementById('reg-webcam');      // <video id="reg-webcam">
const captureRegBtn    = document.getElementById('capture-face');    // <button id="capture-face">
const regCanvas        = document.getElementById('reg-snapshot');    // <canvas id="reg-snapshot">
const regCtx           = regCanvas.getContext('2d');
const registerFaceBtn  = document.getElementById('register-face');   // <button id="register-face">

let registrationImage = '';

// 2.1 Load face-api.js models, then populate the dropdown
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models')
])
.then(populateStudentDropdown)
.catch(err => console.error('Model load failed:', err));

function populateStudentDropdown() {
  studentSelect.innerHTML = '';
  const list = JSON.parse(localStorage.getItem('students') || '[]');
  if (list.length === 0) {
    const opt = document.createElement('option');
    opt.textContent = 'No students available';
    opt.disabled = true;
    studentSelect.appendChild(opt);
    return;
  }
  list.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name} — ${s.class}`;
    studentSelect.appendChild(opt);
  });
}

// 2.2 Start webcam for registration
startRegBtn.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  regVideo.srcObject = stream;
  regVideo.style.display      = 'block';
  captureRegBtn.style.display = 'inline-block';
});

// 2.3 Capture snapshot for registration
captureRegBtn.addEventListener('click', () => {
  regCtx.drawImage(regVideo, 0, 0, regCanvas.width, regCanvas.height);
  registrationImage = regCanvas.toDataURL('image/png');
  regCanvas.style.display      = 'block';
  registerFaceBtn.style.display= 'inline-block';
});

// 2.4 Compute descriptor & save to selected student
registerFaceBtn.addEventListener('click', async () => {
  const list    = JSON.parse(localStorage.getItem('students') || '[]');
  const student = list.find(s => s.id == studentSelect.value);
  if (!student) return alert('Please select a student.');

  const detection = await faceapi
    .detectSingleFace(regCanvas)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return alert('❌ No face detected—please try again.');
  }

  student.descriptor = Array.from(detection.descriptor);
  student.face       = registrationImage;

  localStorage.setItem('students', JSON.stringify(list));
  alert(`✅ Face registered for ${student.name}!`);

  regCanvas.style.display      = 'none';
  registerFaceBtn.style.display= 'none';
});



// ─── 3) ATTENDANCE (Placeholder) ────────────────────────────────────────────
// Later: load descriptors, start attendance webcam, match faces, log timestamps.
