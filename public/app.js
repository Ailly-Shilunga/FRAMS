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
});