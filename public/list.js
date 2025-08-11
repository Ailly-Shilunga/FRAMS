const studentListEl = document.getElementById('student-list');

function loadStudents() {
  const saved = localStorage.getItem('students');
  const students = saved ? JSON.parse(saved) : [];

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
    info.innerHTML = `<strong>${s.name}</strong><br>${s.class}<br><em>${s.parentEmail}</em>`;

    li.append(img, info);
    studentListEl.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', loadStudents);