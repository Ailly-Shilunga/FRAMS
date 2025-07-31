// An array to store students in memory
let students = [];

// Get references to the form and the list in the DOM (HTML)
const addStudentForm = document.getElementById('add-student-form');
const studentList = document.getElementById('student-list');

// When the page loads, check if there are saved students in localStorage
window.onload = function() {
  const saved = localStorage.getItem('students');
  if (saved) {
    students = JSON.parse(saved); // Load from storage
    renderStudentList(); // Show the students on the page
  }
};

// When the form is submitted:
addStudentForm.onsubmit = function(event) {
  event.preventDefault(); // Prevents the page from reloading

  // Get the values from the form fields
  const name = document.getElementById('student-name').value.trim();
  const studentClass = document.getElementById('student-class').value.trim();
  const parentEmail = document.getElementById('parent-email').value.trim();

  // Only continue if all fields are filled in
  if (!name || !studentClass || !parentEmail) return;

  // Create a new student object
  const newStudent = {
    id: Date.now(), // Unique ID (uses the current time)
    name,
    class: studentClass,
    parentEmail
  };
  students.push(newStudent); // Add to the students array

  // Save to localStorage so it stays after refresh
  localStorage.setItem('students', JSON.stringify(students));

  // Update the list on the page
  renderStudentList();

  // Clear the form fields
  addStudentForm.reset();
};

// Show the students on the page
function renderStudentList() {
  studentList.innerHTML = ''; // Clear the list
  if (students.length === 0) {
    studentList.innerHTML = '<li>No students added yet.</li>';
    return;
  }
  // Go through each student and add them to the HTML list
  students.forEach(student => {
    const li = document.createElement('li');
    li.textContent = `${student.name} (${student.class}) - Parent: ${student.parentEmail}`;
    studentList.appendChild(li);
  });
}
const video = document.getElementById("webcam")
const canvas = document.getElementById('snapshot')
const context = canvas.getcontext('2d')

navigator.mediaDevices.getUserMedia({ video: true})
  .than(stream ,
    video,srcObject = stream,
  );
  let capturedImage = '';

document.getElementById('capture').addEventListener('click', () => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedImage = canvas.toDataURL('image/png');
  canvas.style.display = 'block';
});

document.getElementById('enrollForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const className = document.getElementById('class').value;
  const email = document.getElementById('email').value;

  const student = { name, class: className, email, face: capturedImage };
  localStorage.setItem(`student_${name}`, JSON.stringify(student));
  alert(`Saved ${name}'s data with captured face!`);
});
// Grab DOM elements
const video       = document.getElementById('webcam');
const canvas      = document.getElementById('snapshot');
const captureBtn  = document.getElementById('capture');
const form        = document.getElementById('add-student-form');
const studentList = document.getElementById('student-list');

// 1) Start webcam stream
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error('Webcam error:', err));

// 2) Capture button → draw frame to canvas
captureBtn.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.style.display = 'block';
});

// 3) Form submission → add student to list
form.addEventListener('submit', e => {
  e.preventDefault();

  const name       = document.getElementById('student-name').value;
  const studentCls = document.getElementById('student-class').value;
  const email      = document.getElementById('parent-email').value;
  const imgData    = canvas.toDataURL('image/png');

  // Build list item
  const li = document.createElement('li');
  li.innerHTML = `
    <img src="${imgData}" width="80" alt="snapshot" />
    <strong>${name}</strong> — ${studentCls} (<em>${email}</em>)
  `;
  studentList.appendChild(li);

  // Reset form & hide canvas
  form.reset();
  canvas.style.display = 'none';
});

