// — DOM refs —
const videoEl    = document.getElementById('enroll-webcam');
const canvasEl   = document.getElementById('enroll-snapshot');
const ctx        = canvasEl.getContext('2d');
const capBtn     = document.getElementById('capture-enroll');
const form       = document.getElementById('add-student-form');
const listEl     = document.getElementById('student-list');

let students = JSON.parse(localStorage.getItem('students') || '[]');
let snapshot = '';

// 1) Start webcam
navigator.mediaDevices.getUserMedia({ video:true })
  .then(stream => videoEl.srcObject = stream)
  .catch(err => alert('Camera error: '+err));

// 2) Capture photo
capBtn.addEventListener('click', () => {
  canvasEl.width  = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;
  ctx.drawImage(videoEl, 0, 0);
  snapshot = canvasEl.toDataURL('image/png');
  canvasEl.classList.remove('hidden');
});

// 3) Render student list
function renderList() {
  listEl.innerHTML = '';
  if (!students.length) {
    return listEl.innerHTML = '<li>No students enrolled.</li>';
  }
  students.forEach(s => {
    const li  = document.createElement('li');
    const img = document.createElement('img');
    img.src   = s.face || 'images/placeholder.png';
    const div = document.createElement('div');
    div.innerHTML = `<strong>${s.name}</strong><br>${s.class}<br><em>${s.parentEmail}</em>`;
    li.append(img, div);
    listEl.append(li);
  });
}

// 4) Handle form submit
form.addEventListener('submit', e => {
  e.preventDefault();
  const name  = document.getElementById('student-name').value.trim();
  const cls   = document.getElementById('student-class').value.trim();
  const email = document.getElementById('parent-email').value.trim();

  if (!name||!cls||!email) return alert('Fill all fields.');
  if (!snapshot) return alert('Capture a photo first.');

  const newStu = { id:Date.now(), name, class:cls, parentEmail:email, face:snapshot };
  students.push(newStu);
  localStorage.setItem('students', JSON.stringify(students));

  alert(`Saved ${name}!`);
  form.reset();
  canvasEl.classList.add('hidden');
  snapshot = '';
  renderList();
});

// 5) On load
window.addEventListener('DOMContentLoaded', renderList);
document.getElementById('signupForm').addEventListener('submit', function(e) {
  const dob = document.getElementById('dob').value;
  const contact = document.getElementById('parentContact').value;

  const dobPattern = /^\d{4}\/\d{2}\/\d{2}$/;
  const contactPattern = /^\+264\d{8}$/;

  if (!dobPattern.test(dob)) {
    e.preventDefault();
    alert("Date of Birth must be in YYYY/MM/DD format.");
    return;
  }

  if (!contactPattern.test(contact)) {
    e.preventDefault();
    alert("Parent contact number must start with +264 and be followed by 8 digits.");
    return;
  }
});