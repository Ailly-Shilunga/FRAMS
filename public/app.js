// ─── GLOBALS & DOM NODES ──────────────────────────────────────
const navEnroll        = document.getElementById('nav-enroll');
const navRegister      = document.getElementById('nav-register');
const enrollSection    = document.getElementById('enroll-section');
const registerSection  = document.getElementById('register-section');

const enrollWebcam     = document.getElementById('enroll-webcam');
const enrollCanvas     = document.getElementById('enroll-snapshot');
const enrollCtx        = enrollCanvas.getContext('2d');
const captureEnrollBtn = document.getElementById('capture-enroll');
const addStudentForm   = document.getElementById('add-student-form');

const studentListEl    = document.getElementById('student-list');

const studentSelect    = document.getElementById('student-select');
const startCameraBtn   = document.getElementById('start-camera');
const regWebcam        = document.getElementById('reg-webcam');
const regCanvas        = document.getElementById('reg-snapshot');
const regCtx           = regCanvas.getContext('2d');
const captureFaceBtn   = document.getElementById('capture-face');
const registerFaceBtn  = document.getElementById('register-face');

let students     = [];   // { id, name, class, parentEmail, face, descriptor }
let enrollImage  = '';
let registerImage = '';

// ─── STORAGE HELPERS ─────────────────────────────────────────
function loadStudents() {
  const saved = localStorage.getItem('students');
  students = saved ? JSON.parse(saved) : [];
}

function saveStudents() {
  localStorage.setItem('students', JSON.stringify(students));
}

// ─── RENDER LIST & DROPDOWN ─────────────────────────────────
function renderStudentList() {
  studentListEl.innerHTML = '';
  if (students.length === 0) {
    studentListEl.innerHTML = '<li>No students enrolled.</li>';
    return;
  }

  students.forEach(s => {
    const li  = document.createElement('li');
    const img = document.createElement('img');
    img.src   = s.face || 'assets/placeholder.png';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${s.name}</strong><br>${s.class}`;

    li.append(img, info);
    studentListEl.append(li);
  });
}

function populateStudentDropdown() {
  studentSelect.innerHTML = '';
  if (!students.length) {
    const opt = document.createElement('option');
    opt.textContent = 'No students';
    opt.disabled = true;
    studentSelect.append(opt);
    return;
  }

  students.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name} — ${s.class}`;
    studentSelect.append(opt);
  });
}

function initNav() {
  if (!navEnroll || !navRegister) return; // ✅ Prevent errors on pages without nav

  enrollSection.classList.remove('hidden');
  registerSection.classList.add('hidden');

  navEnroll.addEventListener('click', () => {
    enrollSection.classList.remove('hidden');
    registerSection.classList.add('hidden');
  });

  navRegister.addEventListener('click', () => {
    registerSection.classList.remove('hidden');
    enrollSection.classList.add('hidden');
    populateStudentDropdown();
  });
}

// ─── ENROLLMENT LOGIC ───────────────────────────────────────
function initEnrollment() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => enrollWebcam.srcObject = stream)
    .catch(err => alert('Camera error: ' + err));

  captureEnrollBtn.addEventListener('click', () => {
    enrollCtx.drawImage(enrollWebcam, 0, 0, enrollCanvas.width, enrollCanvas.height);
    enrollImage = enrollCanvas.toDataURL('image/png');
    enrollCanvas.classList.remove('hidden');
  });

  addStudentForm.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('student-name').value.trim();
    const cls   = document.getElementById('student-class').value.trim();
    const email = document.getElementById('parent-email').value.trim();

    if (!name || !cls || !email) {
      return alert('All fields are required.');
    }
    if (!enrollImage) {
      return alert('Please capture a photo.');
    }

    const newStu = {
      id:          Date.now(),
      name,
      class:       cls,
      parentEmail: email,
      face:        enrollImage,
      descriptor:  null
    };

    students.push(newStu);
    saveStudents();
    alert('✅ Added ' + name);

    addStudentForm.reset();
    enrollCanvas.classList.add('hidden');
    enrollImage = '';
    renderStudentList();
  });
}

// ─── FACE REGISTRATION LOGIC ────────────────────────────────
function initRegistration() {
  // Load face-api.js models
  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models')
  ]).catch(err => alert('Model load failed: ' + err));

  startCameraBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      regWebcam.srcObject = stream;
      regWebcam.classList.remove('hidden');
      captureFaceBtn.classList.remove('hidden');
    } catch (err) {
      alert('Camera error: ' + err);
    }
  });

  captureFaceBtn.addEventListener('click', () => {
    regCtx.drawImage(regWebcam, 0, 0, regCanvas.width, regCanvas.height);
    registerImage = regCanvas.toDataURL('image/png');
    regCanvas.classList.remove('hidden');
    registerFaceBtn.classList.remove('hidden');
  });

  registerFaceBtn.addEventListener('click', async () => {
    const sid     = studentSelect.value;
    const student = students.find(s => s.id == sid);
    if (!student) {
      return alert('Select a student.');
    }

    const detection = await faceapi
      .detectSingleFace(regCanvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return alert('❌ No face detected. Try again.');
    }

    student.descriptor = Array.from(detection.descriptor);
    student.face       = registerImage;
    saveStudents();
    alert(`✅ Face registered for ${student.name}`);

    regCanvas.classList.add('hidden');
    registerFaceBtn.classList.add('hidden');
  });
}

// ─── INITIALIZE APP ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  initNav();
  renderStudentList();
  initEnrollment();
  initRegistration();
});

// live facial atttendance capture //
const video = document.getElementById('video');
    const log = document.getElementById('log');
    let labeledDescriptors = [];

    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('models');
    }

    function loadRegisteredFaces() {
      const data = JSON.parse(localStorage.getItem('students')) || [];
      return data
        .filter(s => s.descriptor)
        .map(s => new faceapi.LabeledFaceDescriptors(
          s.name,
          [new Float32Array(s.descriptor)]
        ));
    }

    async function startVideo() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      video.srcObject = stream;
    }

    function logAttendance(name) {
      const time = new Date().toLocaleTimeString();
      const entry = document.createElement('div');
      entry.className = 'entry';
      entry.textContent = `${name} checked in at ${time}`;
      log.appendChild(entry);

      const records = JSON.parse(localStorage.getItem('attendanceLog')) || [];
      records.push({ name, time });
      localStorage.setItem('attendanceLog', JSON.stringify(records));
    }

    async function runRecognition() {
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceDescriptors();
          const resized = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resized);

          resized.forEach(detection => {
            const match = faceMatcher.findBestMatch(detection.descriptor);
            if (match.label !== 'unknown') {
              logAttendance(match.label);
            }
          });
        }, 2000);
      });
    }

    (async () => {
      await loadModels();
      labeledDescriptors = loadRegisteredFaces();
      await startVideo();
      runRecognition();
    })();
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