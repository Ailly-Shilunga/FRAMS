// — DOM References —
const video       = document.getElementById('webcam');
const canvas      = document.getElementById('snapshot');
const ctx         = canvas.getContext('2d');
const captureBtn  = document.getElementById('capture');
const form        = document.getElementById('add-student-form');
const studentList = document.getElementById('student-list');

let students     = [];
let faceDataURL  = '';

// — 1) Load saved students from localStorage —
function loadStudents() {
  const saved = localStorage.getItem('students');
  if (saved) {
    students = JSON.parse(saved);
  }
}
 
// — 2) Render students to the page —
function renderStudentList() {
  studentList.innerHTML = '';
  if (students.length === 0) {
    studentList.innerHTML = '<li>No students enrolled.</li>';
    return;
  }
  students.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${s.face}" width="80" alt="snapshot">
      <strong>${s.name}</strong> — ${s.class} <br>
      Parent: <em>${s.parentEmail}</em>
    `;
    studentList.appendChild(li);
  });
}

// — 3) Start the webcam —
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => console.error('Webcam error:', err));

// — 4) Capture a frame when the button is clicked —
captureBtn.addEventListener('click', () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  faceDataURL = canvas.toDataURL('image/png');
  canvas.style.display = 'block';
});

// — 5) Handle form submission —
form.addEventListener('submit', e => {
  e.preventDefault();
  
  const name        = document.getElementById('student-name').value.trim();
  const studentCls  = document.getElementById('student-class').value.trim();
  const parentEmail = document.getElementById('parent-email').value.trim();

  if (!name || !studentCls || !parentEmail) {
    return alert('Please fill in all fields.');
  }
  if (!faceDataURL) {
    return alert('Please capture the student’s face.');
  }

  // Build the student object
  const newStudent = {
    id:          Date.now(),
    name,
    class:       studentCls,
    parentEmail,
    face:        faceDataURL
  };

  // Save it
  students.push(newStudent);
  localStorage.setItem('students', JSON.stringify(students));

  // Reset UI
  alert(`✅ Saved ${name}!`);
  form.reset();
  canvas.style.display = 'none';
  faceDataURL = '';
  renderStudentList();
});

// — 6) On initial load —
window.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  renderStudentList();
});// — Face Registration Setup —

// 1) Load face-api.js models
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('models')
]).then(populateStudentSelect);

// 2) Populate the dropdown with existing students
function populateStudentSelect() {
  const select = document.getElementById('student-select');
  const students = JSON.parse(localStorage.getItem('students') || '[]');

  students.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id;
    option.textContent = s.name;
    select.appendChild(option);
  });
}

// 3) Start camera when clicked
document.getElementById('start-camera').addEventListener('click', async () => {
  const video            = document.getElementById('reg-webcam');
  const captureBtn       = document.getElementById('capture-face');
  const registerBtn      = document.getElementById('register-face');

  // start stream
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
 
  // show controls
  video.style.display      = 'block';
  captureBtn.style.display = 'inline-block';
});

// 4) Capture face snapshot
let regFaceImage = '';
document.getElementById('capture-face').addEventListener('click', () => {
  const video  = document.getElementById('reg-webcam');
  const canvas = document.getElementById('reg-snapshot');
  const btnReg = document.getElementById('register-face');

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  regFaceImage = canvas.toDataURL('image/png');

  canvas.style.display = 'block';
  btnReg.style.display = 'inline-block';
});

// 5) Compute descriptor & save to selected student
document.getElementById('register-face').addEventListener('click', async () => {
  const select   = document.getElementById('student-select');
  const canvas   = document.getElementById('reg-snapshot');
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student  = students.find(s => s.id == select.value);

  // detect and get face descriptor
  const detection = await faceapi
    .detectSingleFace(canvas)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return alert('No face detected—please recapture.');
  }

  // store descriptor (array of numbers) + optional image
  student.descriptor = Array.from(detection.descriptor);
  student.face       = regFaceImage;

  // persist
  localStorage.setItem('students', JSON.stringify(students));
  alert(`Registered face for ${student.name}!`);
});