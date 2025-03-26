let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskList = document.getElementById('task-items');
let submitBtn = document.querySelector('#submit');
let clearBtn = document.querySelector('.clear-items');
let intervals = {}; // Store active countdowns

submitBtn.addEventListener('click', () => {
  let input = document.getElementById('input');

  if (input.value.trim() === '') {
    alert('Please enter a valid input');
  } else {
    tasks.push({
      name: input.value,
      checked: false,
      endTime: null, // Store the timer end time
    });

    saveAndDisplay();
    input.value = '';
  }
});

function displaytasks() {
  taskList.innerHTML = tasks.map((task, index) => {
    let timeRemaining = "";
    if (task.endTime) {
      let now = new Date().getTime();
      let remaining = task.endTime - now;
      if (remaining > 0) {
        let days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        let hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        timeRemaining = `Remaining Time: ${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (remaining <= 0) {
        timeRemaining = "⏳ Time is up!";
      }
    }

    return `
    <div class="item" style="text-decoration: ${task.checked ? 'line-through' : 'none'};
      opacity: ${task.checked ? '0.6' : '1'};">
      <div class="item-name">
        <h3>${task.name}</h3>
      </div>
      <div class='timer'>
      <input type="datetime-local" id="datetime-picker-${index}" value="${task.endTime ? new Date(task.endTime).toISOString().slice(0,16) : ''}" ${task.endTime ? 'disabled' : ''}>
      <button id='activate-timer-${index}' onClick='countDown(${index})' ${task.endTime || task.checked ? 'disabled' : ''}>Activate The Timer</button>
      <div id='counter-result-${index}'>${timeRemaining}</div>
      </div>
      <div class="item-symbols">
        <button onclick='edittasks(${index})' class="edit-btn">
          <i class="fas fa-edit edit"></i>
        </button>
        <button onclick='deletetasks(${index})' class="delete-btn">
          <i class="fas fa-trash delete"></i>
        </button>
        <button onclick='checktasks(${index})' 
          style="color: white; 
          background-color: ${task.checked ? 'green' : 'red'}"
          class="check-btn">
         <i class="${task.checked ? "fa-solid fa-check" : "fa-solid fa-hourglass-end"}"></i>
        </button>
      </div>
    </div>
  `;
  }).join('');

  // Restart active timers on page reload
  tasks.forEach((task, index) => {
    if (task.endTime) {
      countDown(index, true);
    }
  });
}

// Save tasks to localStorage & update UI
function saveAndDisplay() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  displaytasks();
}

// Delete item & save changes
function deletetasks(index) {
  let isConfirmed = confirm('Are you sure you want to delete: ' + tasks[index].name + '?');
  if (isConfirmed) {
    clearInterval(intervals[index]);
    delete intervals[index];
    tasks.splice(index, 1);
    saveAndDisplay();
  }
}

// Edit item & save changes
function edittasks(index) {
  let newName = prompt('Enter new name', tasks[index].name);
  if (newName !== null && newName.trim() !== '') {
    tasks[index].name = newName;
    saveAndDisplay();
  } else if (newName.trim() === '') {
    alert('Please enter a valid input');
  }
}

// Check/Uncheck item & save changes
function checktasks(index) {
  tasks[index].checked = !tasks[index].checked;
  
  if (tasks[index].checked) {
    clearInterval(intervals[index]);
    delete intervals[index];
  }

  saveAndDisplay();
}

// Set a Timer For Each Task
function countDown(index, restart = false) {
  let timeInput = document.getElementById(`datetime-picker-${index}`);
  let activateTimerButton = document.getElementById(`activate-timer-${index}`);
  let counterResult = document.getElementById(`counter-result-${index}`);

  let countDownDate = restart ? tasks[index].endTime : new Date(timeInput.value).getTime();

  if (!restart && isNaN(countDownDate)) {
    alert("Please select a valid date and time.");
    return;
  }

  if (!restart) {
    tasks[index].endTime = countDownDate;
    saveAndDisplay();
  }

  activateTimerButton.style.display = 'none';
  timeInput.setAttribute('disabled', true);

  let updateCountdown = () => {
    let now = new Date().getTime();
    let timeRemaining = countDownDate - now;

    if (timeRemaining <= 0 || tasks[index].checked) {
      clearInterval(intervals[index]);
      delete intervals[index];
      counterResult.innerHTML = "⏳ Time is up!";
      return;
    }

    let days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    let hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    counterResult.innerHTML = `Remaining Time: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  updateCountdown();
  intervals[index] = setInterval(updateCountdown, 1000);
}

// Delete All Items
clearBtn.addEventListener('click', () => {
  let isConfirmed = confirm('Are you sure you want to clear all items?');
  if (isConfirmed) {
    Object.keys(intervals).forEach(index => clearInterval(intervals[index]));
    intervals = {};
    tasks = [];
    saveAndDisplay();
  }
});

// Load items on page load
displaytasks();
