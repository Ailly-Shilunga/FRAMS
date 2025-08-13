const classes = {
    math: ["Alice", "Ben", "Charlie"],
    science: ["Diana", "Ethan", "Fiona"],
    history: ["George", "Hannah", "Ian"]
  };
  
  const classSelect = document.getElementById("classSelect");
  const studentList = document.getElementById("studentList");
  
  classSelect.addEventListener("change", () => {
    const selectedClass = classSelect.value;
    renderStudents(classes[selectedClass]);
  });
  
  function renderStudents(students) {
    studentList.innerHTML = "";
    students.forEach(name => {
      const div = document.createElement("div");
      div.className = "student";
      div.innerHTML = `
        <label>
          <input type="checkbox" data-name="${name}">
          ${name}
        </label>
      `;
      studentList.appendChild(div);
    });
  }
  
  function saveAttendance() {
    const selectedClass = classSelect.value;
    const checkboxes = studentList.querySelectorAll("input[type='checkbox']");
    const attendance = Array.from(checkboxes).map(cb => ({
      name: cb.dataset.name,
      present: cb.checked
    }));
  
    localStorage.setItem(`attendance_${selectedClass}`, JSON.stringify(attendance));
    alert(`Attendance saved for ${selectedClass}!`);
  }
  
  // Initial load
  renderStudents(classes[classSelect.value]);