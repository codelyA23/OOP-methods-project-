const apiUrl = "http://127.0.0.1:8000";

// Global state
let currentPlayId = null;
let currentActorId = null;
let currentDirectorId = null;
let currentShowtimeId = null;
let currentTicketId = null;
let currentSeatId = null;

// --- Helper Functions ---

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function updateAdminUI() {
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === 'admin';

  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = isAdmin ? 'block' : 'none';
  });
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  alert(message);
}

function getHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// --- CRUD Operations Helper ---

async function makeRequest(method, url, data = null) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: getHeaders(),
      body: data ? JSON.stringify(data) : null
    });

    if (response.status === 401) {
      showError("Your session has expired. Please log in again.");
      window.location.href = "login.html";
      return null;
    }

    if (!response.ok) {
      const error = await response.json();
      showError(`Failed: ${error.detail || response.statusText}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Request error:", error);
    showError(`A network or server error occurred. Please try again.`);
    return null;
  }
}

// --- Play CRUD Operations ---

async function fetchPlays() {
  const response = await makeRequest("GET", `${apiUrl}/plays/`);
  if (!response) return;
  
  const tbody = document.getElementById("plays-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  response.forEach(play => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${play.title}</td>
      <td>${play.duration} min</td>
      <td>$${play.price.toFixed(2)}</td>
      <td>${play.genre}</td>
      <td>${play.synopsis || ""}</td>
      <td class="admin-only">
        <button onclick="editPlay(${play.id})" class="btn edit-btn">Edit</button>
        <button onclick="deletePlay(${play.id})" class="btn delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function createPlay(playData) {
  const response = await makeRequest("POST", `${apiUrl}/plays/`, playData);
  if (response) {
    showSuccess("Play created successfully!");
    fetchPlays();
  }
}

async function updatePlay(playId, playData) {
  const response = await makeRequest("PUT", `${apiUrl}/plays/${playId}`, playData);
  if (response) {
    showSuccess("Play updated successfully!");
    fetchPlays();
  }
}

async function deletePlay(playId) {
  if (!confirm("Are you sure you want to delete this play?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/plays/${playId}`);
  if (response) {
    showSuccess("Play deleted successfully!");
    fetchPlays();
  }
}

// --- Actor CRUD Operations ---

async function fetchActors() {
  const response = await makeRequest("GET", `${apiUrl}/actors/`);
  if (!response) return;
  
  const tbody = document.getElementById("actors-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  response.forEach(actor => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${actor.name}</td>
      <td>${actor.gender}</td>
      <td>${actor.date_of_birth}</td>
      <td class="admin-only">
        <button onclick="editActor(${actor.id})" class="btn edit-btn">Edit</button>
        <button onclick="deleteActor(${actor.id})" class="btn delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function createActor(e) {
  e.preventDefault();
  const form = e.target;
  const actorData = {
    name: form.querySelector("#actor-name").value,
    gender: form.querySelector("#actor-gender").value,
    date_of_birth: form.querySelector("#actor-dob").value
  };

  const response = await makeRequest("POST", `${apiUrl}/actors/`, actorData);
  if (response) {
    showSuccess("Actor created successfully!");
    form.reset();
    currentActorId = null;
    fetchActors();
  }
}



// Helper function to safely set form values
function setFormValues(actor) {
  console.log('setFormValues called with actor:', actor);
  
  // Get fresh references to the form elements
  const nameInput = document.getElementById('actor-name');
  const genderSelect = document.getElementById('actor-gender');
  const dobInput = document.getElementById('actor-dob');
  
  console.log('Form elements found:', { 
    nameInput: nameInput ? 'Found' : 'Not found',
    genderSelect: genderSelect ? 'Found' : 'Not found',
    dobInput: dobInput ? 'Found' : 'Not found'
  });
  
  if (!nameInput) {
    console.error('nameInput not found');
    return false;
  }
  if (!genderSelect) {
    console.error('genderSelect not found');
    return false;
  }
  if (!dobInput) {
    console.error('dobInput not found');
    return false;
  }
  
  try {
    console.log('Setting name to:', actor.name);
    nameInput.value = actor.name || '';
    console.log('Name set successfully');
    
    console.log('Setting gender to:', actor.gender);
    genderSelect.value = actor.gender || 'M';
    console.log('Gender set successfully');
    
    if (actor.date_of_birth) {
      console.log('Processing date_of_birth:', actor.date_of_birth);
      const year = actor.date_of_birth.split('-')[0];
      console.log('Extracted year:', year);
      dobInput.value = year;
      console.log('Date of birth set successfully');
    } else {
      console.log('No date_of_birth, clearing field');
      dobInput.value = '';
    }
    
    console.log('All form values set successfully');
    return true;
  } catch (error) {
    console.error('Error in setFormValues:', {
      error: error.message,
      stack: error.stack,
      actor: actor,
      elements: {
        nameInput: nameInput ? 'Exists' : 'Null',
        genderSelect: genderSelect ? 'Exists' : 'Null',
        dobInput: dobInput ? 'Exists' : 'Null'
      }
    });
    return false;
  }
}

async function editActor(actorId) {
  console.group('editActor');
  try {
    console.log("Editing actor ID:", actorId);
    
    // Ensure the admin controls section is visible
    const adminSection = document.getElementById('admin-actor-controls');
    console.log('Admin section:', adminSection ? 'Found' : 'Not found');
    
    if (!adminSection) {
      const errorMsg = 'Admin section not found. Are you logged in as an admin?';
      console.error(errorMsg);
      showError(errorMsg);
      return;
    }
    
    // Make sure the section is visible
    console.log('Making admin section visible');
    adminSection.style.display = 'block';
    
    // Scroll to the form
    console.log('Scrolling to form');
    adminSection.scrollIntoView({ behavior: 'smooth' });
    
    // Get form reference before making the API call
    const form = document.getElementById('add-actor-form');
    console.log('Form element:', form ? 'Found' : 'Not found');
    
    // Fetch actor data first
    console.log('Fetching actor data...');
    const actor = await makeRequest("GET", `${apiUrl}/actors/${actorId}`);
    console.log("Actor data received:", actor);
    
    if (!actor) {
      const errorMsg = "No actor data received from server";
      console.error(errorMsg);
      showError(errorMsg);
      return;
    }
    
    // Try to set form values with retry logic
    let attempts = 0;
    const maxAttempts = 5; // Increased from 3 to 5
    let success = false;
    
    console.log('Starting form value setting attempts...');
    
    while (attempts < maxAttempts && !success) {
      attempts++;
      console.group(`Attempt ${attempts}/${maxAttempts}`);
      
      // Small delay to allow for any DOM updates
      const delay = attempts * 100; // Increase delay with each attempt
      console.log(`Waiting ${delay}ms before attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to set the form values
      console.log('Attempting to set form values...');
      success = setFormValues(actor);
      
      console.groupEnd();
      
      if (!success && attempts < maxAttempts) {
        console.warn(`Attempt ${attempts} failed, retrying...`);
      }
    }
    
    if (!success) {
      throw new Error(`Failed to set form values after ${maxAttempts} attempts`);
    }
    
    // Update form for edit mode
    console.log('Updating form for edit mode...');
    
    // Get fresh references to form elements
    const nameInput = document.getElementById('actor-name');
    const genderSelect = document.getElementById('actor-gender');
    const dobInput = document.getElementById('actor-dob');
    
    console.log('Final form elements:', { 
      nameInput: nameInput ? 'Exists' : 'Null',
      genderSelect: genderSelect ? 'Exists' : 'Null',
      dobInput: dobInput ? 'Exists' : 'Null',
      form: form ? 'Exists' : 'Null'
    });
    
    // Change form submit button text to "Update"
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;
    if (submitButton) {
      console.log('Updating submit button text to "Update Actor"');
      submitButton.textContent = 'Update Actor';
      submitButton.setAttribute('data-edit-mode', 'true');
      submitButton.setAttribute('data-actor-id', actorId);
      
      // Store the actor ID in the form data
      if (form) {
        form.setAttribute('data-actor-id', actorId);
      }
    } else {
      console.warn('Submit button not found in form');
    }
    
    // Set up form submission handler
    if (form) {
      console.log('Setting up form submit handler');
      form.onsubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted in edit mode');
        await handleActorFormSubmit(e, true, actorId);
      };
      console.log('Form submit handler set up successfully');
    } else {
      console.warn('Form not found for setting up submit handler');
    }
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error in editActor:", error);
    showError(error.message || "An error occurred while loading actor details");
  }
}

async function updateActor(e) {
  e.preventDefault();
  if (!currentActorId) return;
  
  const form = e.target;
  const actorData = {
    name: form.querySelector("#actor-name").value,
    gender: form.querySelector("#actor-gender").value,
    date_of_birth: form.querySelector("#actor-dob").value
  };

  const response = await makeRequest("PUT", `${apiUrl}/actors/${currentActorId}`, actorData);
  if (response) {
    showSuccess("Actor updated successfully!");
    form.reset();
    currentActorId = null;
    fetchActors();
  }
}



// --- Director CRUD Operations ---

async function fetchDirectors() {
  const response = await makeRequest("GET", `${apiUrl}/directors/`);
  if (!response) return;
  
  const tbody = document.getElementById("directors-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  response.forEach(director => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${director.name}</td>
      <td>${director.date_of_birth}</td>
      <td>${director.citizenship}</td>
      <td class="admin-only">
        <button onclick="editDirector(${director.id})" class="btn edit-btn">Edit</button>
        <button onclick="deleteDirector(${director.id})" class="btn delete-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  // Update admin UI after rendering directors
  updateAdminUI();
}

async function editDirector(directorId) {
  const director = await makeRequest("GET", `${apiUrl}/directors/${directorId}`);
  if (!director) return;

  const form = document.getElementById("add-director-form");
  if (!form) {
    console.error('Director form not found');
    showError('Director form not found');
    return;
  }

  const nameInput = document.getElementById("director-name");
  const dobInput = document.getElementById("director-dob");
  const citizenshipInput = document.getElementById("director-citizenship");
  
  if (!nameInput || !dobInput || !citizenshipInput) {
    console.error('One or more director form fields not found');
    showError('One or more director form fields not found');
    return;
  }

  nameInput.value = director.name || '';
  dobInput.value = director.date_of_birth || '';
  citizenshipInput.value = director.citizenship || '';

  currentDirectorId = directorId;

  // Update submit button for edit mode
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.textContent = "Update Director";
  }
}

async function createDirector(directorData) {
  const response = await makeRequest("POST", `${apiUrl}/directors/`, directorData);
  if (response) {
    showSuccess("Director created successfully!");
    fetchDirectors();
  }
}

async function updateDirector(directorId, directorData) {
  const response = await makeRequest("PUT", `${apiUrl}/directors/${directorId}`, directorData);
  if (response) {
    showSuccess("Director updated successfully!");
    fetchDirectors();
  }
}

async function deleteDirector(directorId) {
  if (!confirm("Are you sure you want to delete this director?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/directors/${directorId}`);
  if (response) {
    showSuccess("Director deleted successfully!");
    fetchDirectors();
  }
}

// --- Showtime CRUD Operations ---



async function createShowtime(showtimeData) {
  const response = await makeRequest("POST", `${apiUrl}/showtimes/`, showtimeData);
  if (response) {
    showSuccess("Showtime created successfully!");
    fetchShowtimes(showtimeData.play_id);
  }
}

async function deleteShowtime(playId, dateTime) {
  if (!confirm("Are you sure you want to delete this showtime?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/showtimes/`, { play_id: playId, date_and_time: dateTime });
  if (response) {
    showSuccess("Showtime deleted successfully!");
    fetchShowtimes(playId);
  }
}

// --- Seat CRUD Operations ---

async function fetchSeats() {
  const response = await makeRequest("GET", `${apiUrl}/seats/`);
  if (!response) return;
  
  const tbody = document.getElementById("seats-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  response.forEach(seat => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${seat.row_no}</td>
      <td>${seat.seat_no}</td>
      <td class="admin-only">
        <div class="action-buttons">
          <button onclick="editSeat(${seat.row_no}, ${seat.seat_no})" class="btn-edit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button onclick="deleteSeat(${seat.row_no}, ${seat.seat_no})" class="btn-delete">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  updateAdminUI();
}

async function createSeat(seatData) {
  const response = await makeRequest("POST", `${apiUrl}/seats/`, seatData);
  if (response) {
    // Don't show success message for bulk operations
    if (!window.isBulkOperation) {
    showSuccess("Seat created successfully!");
    }
    fetchSeats();
  }
}

// Silent seat creation for bulk operations
async function createSeatSilent(seatData) {
  try {
    const response = await fetch(`${apiUrl}/seats/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(seatData)
    });
    
    if (response.status === 401) {
      showError("Your session has expired. Please log in again.");
      window.location.href = "login.html";
      return null;
    }
    
    if (response.ok) {
      return await response.json();
    }
    
    // For seat creation, don't show errors - just return null
    return null;
  } catch (error) {
    console.log(`Seat creation failed for ${seatData.row_no}-${seatData.seat_no}:`, error);
    return null;
  }
}

async function deleteSeat(rowNo, seatNo) {
  if (!confirm("Are you sure you want to delete this seat?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/seats/`, {
    row_no: rowNo,
    seat_no: seatNo
  });
  
  if (response) {
    showSuccess("Seat deleted successfully!");
    fetchSeats();
  }
}

async function deleteAllSeats() {
  const seatCount = document.querySelectorAll('#seats-table-body tr').length;
  if (seatCount === 0) {
    showError("No seats to delete.");
    return;
  }
  
  if (!confirm(`Are you sure you want to delete ALL ${seatCount} seats? This action cannot be undone.`)) {
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/seats/all`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (response.status === 401) {
      showError("Your session has expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }
    
    if (response.ok) {
      const result = await response.json();
      showSuccess(result.message);
      fetchSeats();
    } else {
      const error = await response.json();
      showError(`Failed to delete seats: ${error.detail || response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting all seats:", error);
    showError("An error occurred while deleting seats.");
  }
}

async function editSeat(rowNo, seatNo) {
  // Populate the single seat form with current values
  const rowInput = document.getElementById("row-no");
  const seatInput = document.getElementById("seat-no");
  const submitBtn = document.querySelector("#add-seat-form button[type='submit']");
  
  if (rowInput && seatInput && submitBtn) {
    rowInput.value = rowNo;
    seatInput.value = seatNo;
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Seat';
    
    // Store the current seat being edited
    window.currentEditingSeat = { row_no: rowNo, seat_no: seatNo };
    
    // Scroll to the form
    document.querySelector("#add-seat-form").scrollIntoView({ behavior: 'smooth' });
  }
}

// --- Ticket CRUD Operations ---

async function fetchUserTickets() {
  const response = await makeRequest("GET", `${apiUrl}/tickets/`);
  if (!response) return;
  
  const tbody = document.getElementById("tickets-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  response.forEach(ticket => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ticket.ticket_no}</td>
      <td>${ticket.row_no}</td>
      <td>${ticket.seat_no}</td>
      <td>${new Date(ticket.showtime_date_and_time).toLocaleString()}</td>
      <td>${ticket.showtime_play_id}</td>
      <td>
        <button onclick="deleteTicket(${ticket.row_no}, ${ticket.seat_no}, '${ticket.showtime_date_and_time}', ${ticket.showtime_play_id})" class="btn delete-btn">Cancel</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function createTicket(ticketData) {
  const response = await makeRequest("POST", `${apiUrl}/tickets/`, ticketData);
  if (response) {
    showSuccess("Ticket booked successfully!");
    fetchUserTickets();
  }
}

async function deleteTicket(rowNo, seatNo, dateTime, playId) {
  if (!confirm("Are you sure you want to cancel this ticket?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/tickets/`, {
    row_no: rowNo,
    seat_no: seatNo,
    showtime_date_and_time: dateTime,
    showtime_play_id: playId
  });
  
  if (response) {
    showSuccess("Ticket cancelled successfully!");
    fetchUserTickets();
  }
}

// --- Authentication ---

function updateNav() {
    const token = localStorage.getItem("accessToken");
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const ticketsLink = document.getElementById('tickets-link');

    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'list-item';
        if (ticketsLink) ticketsLink.style.display = 'list-item';
    } else {
        if (loginLink) loginLink.style.display = 'list-item';
        if (registerLink) registerLink.style.display = 'list-item';
        if (logoutLink) logoutLink.style.display = 'none';
        if (ticketsLink) ticketsLink.style.display = 'none';
    }
    updateAdminUI();
}

async function handleRegister(e) {
  e.preventDefault();
  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    telephone_no: document.getElementById("telephone_no").value,
  };

  try {
    const response = await fetch(`${apiUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      const payload = parseJwt(data.access_token);
      if (payload && payload.role) {
        localStorage.setItem("userRole", payload.role);
      }
      window.location.href = "index.html";
    } else {
      showError("Registration failed: Incorrect email or password.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showError(`An unexpected error occurred during registration.`);
  }
}

function logout(e) {
  e.preventDefault();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  window.location.href = "login.html";
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new URLSearchParams();
  formData.append("username", document.getElementById("email").value);
  formData.append("password", document.getElementById("password").value);

  try {
    const response = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      const payload = parseJwt(data.access_token);
      if (payload && payload.role) {
        localStorage.setItem("userRole", payload.role);
      }
      updateNav();
      window.location.href = "index.html";
    } else {
      showError("Login failed: Incorrect email or password.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError(`An unexpected error occurred during login.`);
  }
}

// --- Helper Functions ---

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}



// --- Authentication ---

function updateNav() {
    const token = localStorage.getItem("accessToken");
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const ticketsLink = document.getElementById('tickets-link');

    if (token) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'list-item';
        if (ticketsLink) ticketsLink.style.display = 'list-item';
    } else {
        // User is logged out
        if (loginLink) loginLink.style.display = 'list-item';
        if (registerLink) registerLink.style.display = 'list-item';
        if (logoutLink) logoutLink.style.display = 'none';
        if (ticketsLink) ticketsLink.style.display = 'none';
    }
}

async function handleRegister(e) {
  e.preventDefault();
  const userData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    telephone_no: document.getElementById("telephone_no").value,
  };

  try {
    const response = await fetch(`${apiUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      
      const payload = parseJwt(data.access_token);
      if (payload && payload.role) {
        localStorage.setItem("userRole", payload.role);
      }
      
      window.location.href = "index.html";
    } else {
      alert("Registration failed: Incorrect email or password.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert(`An unexpected error occurred during registration.`);
  }
}

function logout(e) {
  e.preventDefault();
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  window.location.href = "login.html";
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new URLSearchParams();
  formData.append("username", document.getElementById("email").value);
  formData.append("password", document.getElementById("password").value);

  try {
    const response = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      const payload = parseJwt(data.access_token);
      if (payload && payload.role) {
        localStorage.setItem("userRole", payload.role);
      }
      updateNav();
      updateAdminUI();
      window.location.href = "index.html";
    } else {
      alert("Login failed: Incorrect email or password.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert(`An unexpected error occurred during login.`);
  }
}

// --- Play CRUD Operations ---

async function handleFormSubmit(e) {
  e.preventDefault();
  const playForm = document.getElementById("play-form");
  const submitButton = playForm.querySelector('button[type="submit"]');
  const playData = {
    title: document.getElementById("title").value,
    duration: parseInt(document.getElementById("duration").value),
    price: parseFloat(document.getElementById("price").value),
    genre: document.getElementById("genre").value,
    synopsis: document.getElementById("synopsis").value,
  };

  const method = currentPlayId ? "PUT" : "POST";
  const url = currentPlayId ? `${apiUrl}/plays/${currentPlayId}` : `${apiUrl}/plays/`;
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(playData),
    });

    if (response.status === 401) {
      alert("Your session has expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    if (response.ok) {
      playForm.reset();
      submitButton.textContent = "Add Play";
      currentPlayId = null;
      fetchPlays();
    } else {
      const error = await response.json();
      alert(`Failed to save play: ${error.detail}`);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
}

async function fetchPlays() {
  const tbody = document.getElementById("plays-table-body");
  if (!tbody) return;

  try {
    const res = await fetch(`${apiUrl}/plays/`);
    if (!res.ok) {
      console.error("Failed to fetch plays:", res.statusText);
      return;
    }
    const plays = await res.json();
    tbody.innerHTML = "";

    plays.forEach((play) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${play.title}</td>
        <td>${play.duration} min</td>
        <td>$${play.price.toFixed(2)}</td>
        <td>${play.genre}</td>
        <td>${play.synopsis || ""}</td>
        <td class="admin-only">
          <button class="edit-btn" onclick="editPlay(${play.id})">Edit</button>
          <button class="delete-btn" onclick="deletePlay(${play.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    // Update UI after plays are rendered
    updateAdminUI();
  } catch (error) {
    console.error("Error fetching plays:", error);
  }
}

async function editPlay(id) {
  try {
    const res = await fetch(`${apiUrl}/plays/${id}`);
    if (!res.ok) {
      console.error("Failed to fetch play details");
      return;
    }
    const play = await res.json();

    document.getElementById("title").value = play.title;
    document.getElementById("duration").value = play.duration;
    document.getElementById("price").value = play.price;
    document.getElementById("genre").value = play.genre;
    document.getElementById("synopsis").value = play.synopsis;

    currentPlayId = id;
    const playForm = document.getElementById("play-form");
    playForm.querySelector('button[type="submit"]').textContent = "Update Play";
    playForm.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error editing play:", error);
  }
}

async function deletePlay(id) {
  if (!confirm("Are you sure you want to delete this play?")) {
    return;
  }
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${apiUrl}/plays/${id}`, {
      method: "DELETE",
      headers: headers,
    });

    if (response.status === 401) {
      alert("Your session has expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    if (response.ok) {
      fetchPlays();
    } else {
      const error = await response.json();
      alert(`Failed to delete play: ${error.detail}`);
    }
  } catch (error) {
    console.error("Error deleting play:", error);
  }
}

// --- Customer CRUD Operations ---

async function fetchCustomers() {
  const tbody = document.getElementById("customers-table-body");
  if (!tbody) return;

  try {
    const response = await makeRequest("GET", `${apiUrl}/customers/`);
    if (!response) return;

    tbody.innerHTML = "";
    response.forEach(customer => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.telephone_no || 'N/A'}</td>
        <td>${customer.role}</td>
        <td class="admin-only">
          <button onclick="editCustomer(${customer.id})" class="btn edit-btn">Edit</button>
          <button onclick="deleteCustomer(${customer.id})" class="btn delete-btn">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    showError("Failed to load customers");
  }
}

async function createCustomer(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector("#customer-name").value;
  const email = form.querySelector("#customer-email").value;
  const phone = form.querySelector("#customer-phone").value;
  const password = form.querySelector("#customer-password").value;

  // Validation
  if (!name || name.trim().length < 2) {
    showError("Name must be at least 2 characters long");
    return;
  }

  if (!email || !isValidEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  if (phone && !isValidPhone(phone)) {
    showError("Please enter a valid phone number");
    return;
  }

  if (!password || !isValidPassword(password)) {
    showError("Password must be at least 8 characters long and contain at least one number and one special character");
    return;
  }

  const customerData = {
    name: name.trim(),
    email: email.trim(),
    telephone_no: phone ? phone.trim() : null,
    hashed_password: password
  };

  try {
    const response = await makeRequest("POST", `${apiUrl}/customers/`, customerData);
    if (response) {
      showSuccess("Customer created successfully!");
      form.reset();
      fetchCustomers();
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      showError(error.response.data.detail);
    } else {
      showError("Failed to create customer. Please try again.");
    }
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Simple phone number validation (can be adjusted based on specific requirements)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

function isValidPassword(password) {
  // Password must be at least 8 characters long and contain at least one number and one special character
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
}

async function updateCustomer(customerId, customerData) {
  const response = await makeRequest("PUT", `${apiUrl}/customers/${customerId}`, customerData);
  if (response) {
    showSuccess("Customer updated successfully!");
    fetchCustomers();
  }
}

async function deleteCustomer(customerId) {
  if (!confirm("Are you sure you want to delete this customer?")) return;
  
  const response = await makeRequest("DELETE", `${apiUrl}/customers/${customerId}`);
  if (response) {
    showSuccess("Customer deleted successfully!");
    fetchCustomers();
  }
}

async function editCustomer(customerId) {
  const customer = await makeRequest("GET", `${apiUrl}/customers/${customerId}`);
  if (!customer) return;
  
  const form = document.getElementById("add-customer-form");
  if (!form) return;
  
  form.querySelector("#customer-name").value = customer.name;
  form.querySelector("#customer-email").value = customer.email;
  form.querySelector("#customer-phone").value = customer.telephone_no || '';
  currentCustomerId = customerId;
}

// --- Actor CRUD Operations ---

async function fetchActors() {
  const tbody = document.getElementById("actors-table-body");
  if (!tbody) return;

  try {
    const response = await makeRequest("GET", `${apiUrl}/actors/`);
    if (!response) return;

    const isAdmin = localStorage.getItem('userRole') === 'admin';
    tbody.innerHTML = "";
    
    response.forEach(actor => {
      const row = document.createElement("tr");
      let rowHTML = `
        <td>${actor.name}</td>
        <td>${actor.gender}</td>
        <td>${actor.date_of_birth}</td>
      `;
      
      if (isAdmin) {
        rowHTML += `
          <td class="admin-actions">
            <button data-action="edit" data-actor-id="${actor.id}" class="btn edit-btn">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button data-action="delete" data-actor-id="${actor.id}" class="btn delete-btn">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>
        `;
      }
      
      row.innerHTML = rowHTML;
      tbody.appendChild(row);
    });
    
    // Update admin UI visibility
    updateAdminUI();
  } catch (error) {
    console.error("Error fetching actors:", error);
    showError("Failed to load actors");
  }
}

async function createActor(actorData) {
  const response = await makeRequest("POST", `${apiUrl}/actors/`, actorData);
  if (response) {
    showSuccess("Actor created successfully!");
    fetchActors();
  }
}

async function updateActor(actorId, actorData) {
  const response = await makeRequest("PUT", `${apiUrl}/actors/${actorId}`, actorData);
  if (response) {
    showSuccess("Actor updated successfully!");
    fetchActors();
  }
}



async function editActor(actorId) {
  const actor = await makeRequest("GET", `${apiUrl}/actors/${actorId}`);
  if (!actor) return;
  
  const form = document.getElementById("add-actor-form");
  if (!form) {
    console.error('Actor form not found');
    showError('Actor form not found');
            return;
        }

  const nameInput = document.getElementById("actor-name");
  const genderSelect = document.getElementById("actor-gender");
  const dobInput = document.getElementById("actor-dob");
  if (!nameInput || !genderSelect || !dobInput) {
    console.error('One or more actor form fields not found', {
      nameInput, genderSelect, dobInput
    });
    showError('One or more actor form fields not found');
        return;
    }

  nameInput.value = actor.name || '';
  genderSelect.value = actor.gender || 'M';
  // Normalize date_of_birth (could be year or date string)
  if (actor.date_of_birth) {
    let year = actor.date_of_birth;
    if (typeof year === 'string' && year.includes('-')) {
      year = year.split('-')[0];
    }
    dobInput.value = year;
        } else {
    dobInput.value = '';
  }


  currentActorId = actorId;


}

async function handleActorFormSubmit(e) {
  e.preventDefault();
  const actorData = {
    name: document.getElementById("actor-name").value,
    gender: document.getElementById("actor-gender").value,
    date_of_birth: document.getElementById("actor-dob").value
  };

  try {
    if (currentActorId) {
      const response = await makeRequest("PUT", `${apiUrl}/actors/${currentActorId}`, actorData);
      if (response) {
        showSuccess("Actor updated successfully!");
        e.target.reset();
        currentActorId = null;
        setTimeout(() => fetchActors(), 200);
      }
        } else {
      const response = await makeRequest("POST", `${apiUrl}/actors/`, actorData);
      if (response) {
        showSuccess("Actor created successfully!");
        e.target.reset();
        setTimeout(() => fetchActors(), 200);
      }
        }
    } catch (error) {
    console.error("Error saving actor:", error);
    showError(error.message || "An error occurred while saving the actor");
    }
}

// --- Showtime Management ---

// --- Showtime Management ---

async function populatePlaySelect() {
    const filterSelect = document.getElementById('play-select');
    const formSelect = document.getElementById('showtime-play');

    try {
        const res = await fetch(`${apiUrl}/plays/`);
        const plays = await res.json();
        
        // Populate the filter dropdown
        if (filterSelect) {
        plays.forEach(play => {
            const option = document.createElement('option');
            option.value = play.id;
            option.textContent = play.title;
                filterSelect.appendChild(option);
            });
        }
        
        // Populate the form dropdown
        if (formSelect) {
            plays.forEach(play => {
                const option = document.createElement('option');
                option.value = play.id;
                option.textContent = play.title;
                formSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating plays dropdown:', error);
    }
}

async function fetchShowtimes(playId) {
    const container = document.getElementById('showtimes-list');
    if (!container) return;

    // Show loading state
    container.innerHTML = '<div class="loading-seats"><i class="fas fa-spinner fa-spin"></i> Loading showtimes...</div>';

    try {
        let showtimes = [];
        
        // Always fetch all showtimes and filter by playId if provided
        const res = await fetch(`${apiUrl}/showtimes/`);
        if (!res.ok) throw new Error('Failed to fetch showtimes');
        let allShowtimes = await res.json();
        
        // Filter by playId if provided
        showtimes = playId 
            ? allShowtimes.filter(st => st.play_id == playId)
            : allShowtimes;

        if (showtimes.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No showtimes available.</p></div>';
            return;
        }

        let showtimesHTML = '';
        showtimes.forEach(showtime => {
    // Format date and time for display
    const dateObj = new Date(showtime.date_and_time);
    const dateStr = dateObj.toLocaleDateString();
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Admin action buttons will be included in the template below

            const showtimeDate = new Date(showtime.date_and_time);
            const formattedDate = showtimeDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            const formattedTime = showtimeDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Get the play ID for this showtime
            const showtimePlayId = showtime.play_id || playId;
            
            showtimesHTML += `
                <div class="showtime-card">
                    <div class="showtime-header">
                        <h3 class="showtime-title">${showtime.play?.title || 'Unknown Play'}</h3>
                        <div class="showtime-date">${formattedDate}</div>
                    </div>
                    <div class="showtime-body">
                        <div class="showtime-details">
                            <div class="showtime-detail">
                                <i class="fas fa-clock"></i>
                                <span class="showtime-time">${formattedTime}</span>
                            </div>
                            <div class="showtime-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="showtime-venue">${showtime.venue || 'Main Theater'}</span>
                            </div>
                            <div class="showtime-detail">
                                <i class="fas fa-chair"></i>
                                <span class="showtime-seats">${showtime.available_seats || 'Unlimited'} seats available</span>
                            </div>
                        </div>
                        <div class="showtime-actions">
                            <button class="btn btn-primary" onclick="bookTickets('${showtimePlayId}', '${showtime.date_and_time}')">
                                <i class="fas fa-ticket-alt"></i> Book Tickets
                            </button>
                            ${localStorage.getItem('userRole') === 'admin' ? `
                            <div class="admin-actions">
                                <button class="btn btn-secondary btn-edit-showtime" 
                                        data-play-id="${showtimePlayId}" 
                                        data-datetime="${showtime.date_and_time}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger" 
                                        onclick="if(confirm('Are you sure you want to delete this showtime?')) { handleDeleteShowtime('${showtimePlayId}', '${showtime.date_and_time}') }">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = showtimesHTML;
        updateAdminUI();

        // Add event delegation for edit buttons
        container.querySelectorAll('.btn-edit-showtime').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const playId = btn.getAttribute('data-play-id');
            const dateTime = btn.getAttribute('data-datetime');
            
            if (!playId || !dateTime) {
              console.error('Missing showtime identifiers on button');
              return;
            }
            
            console.log('Editing showtime - Play ID:', playId, 'Date/Time:', dateTime);
            
            try {
              // Fetch all showtimes to find the one we want to edit
              const allShowtimes = await makeRequest('GET', `${apiUrl}/showtimes/`);
              if (!allShowtimes) {
                throw new Error('Failed to fetch showtimes');
              }
              
              // Find the specific showtime by play_id and date_time
              const showtime = allShowtimes.find(st => 
                st.play_id == playId && 
                new Date(st.date_and_time).getTime() === new Date(dateTime).getTime()
              );
              
              if (!showtime) {
                throw new Error('Showtime not found');
              }
              
              console.log('Fetched showtime:', showtime);
              
              // Populate modal fields with date and time only
              const dt = new Date(showtime.date_and_time);
              document.getElementById('edit-showtime-date').value = dt.toISOString().split('T')[0];
              document.getElementById('edit-showtime-time').value = dt.toTimeString().slice(0,5);
              
              // Store showtime identifiers in form data attributes
              const form = document.getElementById('edit-showtime-form');
              form.setAttribute('data-play-id', playId);
              form.setAttribute('data-original-datetime', dateTime);
              
              // Show the modal with proper styling and z-index
              const modal = document.getElementById('edit-showtime-modal');
              modal.style.display = 'block';
              modal.style.zIndex = '2000'; // Higher than other elements
              modal.classList.add('show');
              document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
            } catch (error) {
              console.error('Error loading showtime details:', error);
              showError('Failed to load showtime details. Please try again.');
            }
          });
        });

        // Modal close logic
        const closeEditModal = () => {
          const modal = document.getElementById('edit-showtime-modal');
          modal.style.display = 'none';
          modal.classList.remove('show');
          document.body.style.overflow = 'auto'; // Re-enable scrolling
        };
        
        // Close modal when clicking the close button
        document.getElementById('close-edit-showtime-modal').onclick = closeEditModal;
        
        // Close modal when clicking outside the modal content
        window.onclick = (event) => {
          const modal = document.getElementById('edit-showtime-modal');
          if (event.target === modal) {
            closeEditModal();
          }
        };
        
        // Handle form submission for updating showtime
        const editShowtimeForm = document.getElementById('edit-showtime-form');
        if (editShowtimeForm) {
          editShowtimeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const playId = editShowtimeForm.getAttribute('data-play-id');
            const originalDateTime = editShowtimeForm.getAttribute('data-original-datetime');
            
            if (!playId || !originalDateTime) {
              showError('Invalid showtime data');
              return;
            }
            
            const date = document.getElementById('edit-showtime-date').value;
            const time = document.getElementById('edit-showtime-time').value;
            
            if (!date || !time) {
              showError('Please fill in all fields');
              return;
            }
            
            // Combine date and time
            const dateTime = new Date(`${date}T${time}`).toISOString();
            
            try {
              // Prepare the update data
              const updateData = {
                date_and_time: dateTime
              };
              
              // Make the update request
              const response = await makeRequest('PUT', `${apiUrl}/showtimes/update?play_id=${encodeURIComponent(playId)}&original_date_time=${encodeURIComponent(originalDateTime)}`, updateData);
              
              if (response) {
                showSuccess('Showtime updated successfully!');
                closeEditModal();
                // Refresh the showtimes list
                fetchShowtimes(currentPlayId);
              }
            } catch (error) {
              console.error('Error updating showtime:', error);
              showError('Failed to update showtime. Please try again.');
            }
          });
        }
        
        window.onclick = function(event) {
          const modal = document.getElementById('edit-showtime-modal');
          if (event.target === modal) {
            modal.style.display = 'none';
          }
        };

    } catch (error) {
        console.error('Error fetching showtimes:', error);
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>An error occurred while loading showtimes.</p></div>';
    }
}

async function handleAddShowtime(e) {
    e.preventDefault();
    const playId = document.getElementById('showtime-play').value;
    const date = document.getElementById('showtime-date').value;
    const time = document.getElementById('showtime-time').value;
    const venue = document.getElementById('showtime-venue').value;
    // const availableSeats = document.getElementById('showtime-available').value;

    if (!playId || !date || !time || !venue) {
        showError('Please fill in all fields.');
        return;
    }

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`).toISOString();

    const showtimeData = {
        play_id: parseInt(playId),
        date_and_time: dateTime,
        venue: venue,
        // available_seats: parseInt(availableSeats)
    };

    const response = await makeRequest("POST", `${apiUrl}/showtimes/`, showtimeData);
    if (response) {
        showSuccess('Showtime added successfully!');
            document.getElementById('add-showtime-form').reset();
        fetchShowtimes(playId);
    }
}

async function handleDeleteShowtime(playId, dateTime) {
    if (!confirm('Are you sure you want to delete this showtime?')) return;

    const response = await makeRequest("DELETE", `${apiUrl}/showtimes/`, {
        play_id: parseInt(playId),
        date_and_time: dateTime
    });
    
    if (response) {
        showSuccess('Showtime deleted successfully!');
            fetchShowtimes(playId);
    }
}

// --- Ticket Management ---

async function fetchUserTickets() {
    const container = document.getElementById('tickets-container');
    if (!container) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
        container.innerHTML = '<p>You must be logged in to view your tickets. <a href="login.html">Login here</a>.</p>';
        return;
    }

    try {
        const res = await fetch(`${apiUrl}/tickets/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (res.status === 401) {
            container.innerHTML = '<p>Your session has expired. Please <a href="login.html">log in again</a>.</p>';
            return;
        }

        const tickets = await res.json();

        if (tickets.length === 0) {
            container.innerHTML = '<p>You have not purchased any tickets yet.</p>';
            return;
        }

        let table = '<table><thead><tr><th>Play</th><th>Showtime</th><th>Seat</th><th>Price</th></tr></thead><tbody>';
        tickets.forEach(ticket => {
            table += `
                <tr>
                    <td>${ticket.showtime.play.title}</td>
                    <td>${new Date(ticket.showtime.date_and_time).toLocaleString()}</td>
                    <td>Row: ${ticket.seat.row}, Number: ${ticket.seat.number}</td>
                    <td>$${ticket.price.toFixed(2)}</td>
                </tr>
            `;
        });
        table += '</tbody></table>';
        container.innerHTML = table;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        container.innerHTML = '<p>An error occurred while loading your tickets.</p>';
    }
}

// --- Global Initializer ---

document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname.split("/").pop();

    // Load plays on home page
    if (page === 'index.html' || page === '') {
        fetchPlays();
    }

    // Always update nav and admin UI
    if (typeof updateNav === "function") {
        updateNav();
    }
    if (typeof updateAdminUI === "function") {
        updateAdminUI();
    }

    // Page-specific initializations
    if (page === "register.html" && document.getElementById("register-form")) {
        document.getElementById("register-form").addEventListener("submit", handleRegister);
    }

    if (page === "login.html" && document.getElementById("login-form")) {
        document.getElementById("login-form").addEventListener("submit", handleLogin);
    }

    if (page === "plays.html") {
        fetchPlays();
        const playForm = document.getElementById("play-form");
        if (playForm) {
            playForm.addEventListener("submit", handleFormSubmit);
        }
    }

    if (page === "actors.html") {
        fetchActors();
        const addActorForm = document.getElementById("add-actor-form");
        if (addActorForm) {
            addActorForm.addEventListener("submit", handleActorFormSubmit);
        }
    }

    if (page === "directors.html") {
        fetchDirectors();
        const addDirectorForm = document.getElementById("add-director-form");
        if (addDirectorForm) {
            addDirectorForm.addEventListener("submit", handleDirectorFormSubmit);
        }
    }

    if (page === "showtimes.html") {
        populatePlaySelect();
        fetchShowtimes(null); // Initial call with no play selected
        document.getElementById('play-select').addEventListener('change', (e) => fetchShowtimes(e.target.value));
        const addShowtimeForm = document.getElementById('add-showtime-form');
        if (addShowtimeForm) {
            addShowtimeForm.addEventListener('submit', handleAddShowtime);
        }
    }

    if (page === "tickets.html") {
        fetchAndRenderUserTickets();
        const filter = document.getElementById('status-filter');
        if (filter) {
            filter.addEventListener('change', e => {
                const status = e.target.value;
                const filtered = filterTicketsByStatus(status);
                renderTicketCards(filtered);
            });
        }
    }

    if (page === "seats.html") {
        fetchSeats();
        const addSeatForm = document.getElementById("add-seat-form");
        const bulkSeatForm = document.getElementById("bulk-seat-form");
        if (addSeatForm) {
            addSeatForm.addEventListener("submit", handleSeatFormSubmit);
        }
        if (bulkSeatForm) {
            bulkSeatForm.addEventListener("submit", handleBulkSeatFormSubmit);
        }
    }
    
    // Update admin controls for actors page specifically
    const userRole = localStorage.getItem("userRole");
    const isAdmin = userRole === 'admin';
    const actorAdminControls = document.getElementById('admin-actor-controls');
    if (actorAdminControls) {
        actorAdminControls.style.display = isAdmin ? 'block' : 'none';
    }
    
    // Debug: Log form elements on page load
    console.log('Page loaded. Checking for form elements...');
    const debugNameInput = document.getElementById('actor-name');
    const debugGenderSelect = document.getElementById('actor-gender');
    const debugDobInput = document.getElementById('actor-dob');
    const debugForm = document.getElementById('add-actor-form');
    console.log('Form elements on load:', {
        nameInput: debugNameInput,
        genderSelect: debugGenderSelect,
        dobInput: debugDobInput,
        form: debugForm
    });
    
    // Add event delegation for actor actions
    const actorsTable = document.getElementById('actors-table');
    if (actorsTable) {
        actorsTable.addEventListener('click', async (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            const actorId = parseInt(button.dataset.actorId);
            
            if (isNaN(actorId)) {
                console.error('Invalid actor ID:', button.dataset.actorId);
                return;
            }
            
            try {
                if (action === 'edit') {
                    await editActor(actorId);
                } else if (action === 'delete') {
                    if (confirm('Are you sure you want to delete this actor?')) {
                        await deleteActor(actorId);
                    }
                }
            } catch (error) {
                console.error(`Error in ${action} action:`, error);
                showError(`Failed to ${action} actor`);
            }
        });
    }

    const directorAdminControls = document.getElementById('admin-director-controls');
    if (directorAdminControls) {
        directorAdminControls.style.display = isAdmin ? 'block' : 'none';
    }

    const showtimeAdminControls = document.getElementById('admin-showtime-controls');
    if (showtimeAdminControls) {
        showtimeAdminControls.style.display = isAdmin ? 'block' : 'none';
    }
});

// A new logout function for onclick handlers
function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    window.location.href = "login.html";
}


async function deletePlay(id) {
  if (!confirm("Are you sure you want to delete this play?")) return;

  const token = localStorage.getItem("accessToken");
  const headers = {};
  if (token) {
      headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${apiUrl}/plays/${id}`, { 
        method: "DELETE",
        headers: headers 
    });

    if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    if (response.ok) {
      fetchPlays();
    } else {
      const error = await response.json();
      alert(`Failed to delete play: ${error.detail}`);
    }
  } catch (error) {
    console.error("Error deleting play:", error);
  }
}

// --- Initializer ---

document.addEventListener("DOMContentLoaded", () => {
  // Update nav and UI visibility on every page load
  updateNav();
  updateAdminUI();
  
  // Set up event listeners for all forms
  const playForm = document.getElementById("play-form");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (playForm) playForm.addEventListener("submit", handleFormSubmit);
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  // Initialize actors page if we're on actors.html
  if (window.location.pathname.endsWith("actors.html")) {
    const actorForm = document.getElementById("add-actor-form");
    if (actorForm) {
      actorForm.addEventListener("submit", handleActorFormSubmit);
    }
    if (document.getElementById("actors-table-body")) fetchActors();
  }

  // Initialize other pages
  const currentPage = window.location.pathname.split("/").pop();
  switch (currentPage) {
    case "plays.html":
      if (document.getElementById("plays-table-body")) fetchPlays();
      break;
    case "directors.html":
      if (document.getElementById("directors-table-body")) fetchDirectors();
      break;
    case "showtimes.html":
      if (document.getElementById("showtimes-table-body")) fetchShowtimes();
      break;
    case "tickets.html":
      if (document.getElementById("tickets-table-body")) fetchUserTickets();
      break;
  }
});

// Handle actor form submission
async function handleActorFormSubmit(e) {
  e.preventDefault();
  const actorData = {
    name: document.getElementById("actor-name").value,
    gender: document.getElementById("actor-gender").value,
    date_of_birth: document.getElementById("actor-dob").value
  };

  try {
    if (currentActorId) {
      const response = await makeRequest("PUT", `${apiUrl}/actors/${currentActorId}`, actorData);
      if (response) {
        showSuccess("Actor updated successfully!");
        e.target.reset();
        currentActorId = null;
        setTimeout(() => fetchActors(), 200);
      }
    } else {
      const response = await makeRequest("POST", `${apiUrl}/actors/`, actorData);
      if (response) {
        showSuccess("Actor created successfully!");
        e.target.reset();
        setTimeout(() => fetchActors(), 200);
      }
    }
  } catch (error) {
    console.error("Error saving actor:", error);
    showError(error.message || "An error occurred while saving the actor");
  }
}

// Actor CRUD operations
async function createActor(actorData) {
  const response = await makeRequest("POST", `${apiUrl}/actors/`, actorData);
  if (response) {
    showSuccess("Actor created successfully!");
    fetchActors();
  }
}

async function updateActor(actorId, actorData) {
  const response = await makeRequest("PUT", `${apiUrl}/actors/${actorId}`, actorData);
  if (response) {
    showSuccess("Actor updated successfully!");
    fetchActors();
  }
}

async function deleteActor(actorId) {
  if (!confirm("Are you sure you want to delete this actor?")) return;
  
  try {
    const response = await fetch(`${apiUrl}/actors/${actorId}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete actor");
    }

    const result = await response.json();
    showSuccess("Actor deleted successfully!");
    setTimeout(() => fetchActors(), 200);
  } catch (error) {
    console.error("Error deleting actor:", error);
    showError(error.message || "An error occurred while deleting the actor");
  }
}

async function handleDirectorFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const directorData = {
    name: form.querySelector("#director-name").value,
    date_of_birth: parseInt(form.querySelector("#director-dob").value),
    citizenship: form.querySelector("#director-citizenship").value
  };

    if (currentDirectorId) {
      const response = await makeRequest("PUT", `${apiUrl}/directors/${currentDirectorId}`, directorData);
      if (response) {
        showSuccess("Director updated successfully!");
      form.reset();
        currentDirectorId = null;
      fetchDirectors();
      }
    } else {
      const response = await makeRequest("POST", `${apiUrl}/directors/`, directorData);
      if (response) {
        showSuccess("Director created successfully!");
      form.reset();
      fetchDirectors();
    }
  }
}

async function handleSeatFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const seatData = {
        row_no: parseInt(form.querySelector("#row-no").value),
        seat_no: parseInt(form.querySelector("#seat-no").value)
    };

    const submitBtn = form.querySelector("button[type='submit']");
    
    if (window.currentEditingSeat) {
        // Update existing seat
        const response = await makeRequest("PUT", `${apiUrl}/seats/${window.currentEditingSeat.row_no}/${window.currentEditingSeat.seat_no}`, seatData);
        if (response) {
            showSuccess("Seat updated successfully!");
            form.reset();
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Seat';
            window.currentEditingSeat = null;
            fetchSeats();
        }
    } else {
        // Create new seat
        const response = await makeRequest("POST", `${apiUrl}/seats/`, seatData);
        if (response) {
            showSuccess("Seat created successfully!");
            form.reset();
            fetchSeats();
        }
    }
}

// --- Automatic Seat Creation Functions ---

async function generateTheaterLayout(size) {
    const layouts = {
        small: { rows: 5, seatsPerRow: 8 },
        medium: { rows: 8, seatsPerRow: 12 },
        large: { rows: 12, seatsPerRow: 15 }
    };
    
    const layout = layouts[size];
    if (!layout) return;
    
    if (!confirm(`This will create ${layout.rows * layout.seatsPerRow} seats (${layout.rows} rows × ${layout.seatsPerRow} seats). Continue?`)) {
        return;
    }
    
    await createBulkSeats(1, layout.rows, layout.seatsPerRow);
}

async function createBulkSeats(startRow, endRow, seatsPerRow) {
    const seats = [];
    for (let row = startRow; row <= endRow; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            seats.push({ row_no: row, seat_no: seat });
        }
    }
    
    // Set bulk operation flag to suppress individual success messages
    window.isBulkOperation = true;
    
    // Show progress
    const totalSeats = seats.length;
    let created = 0;
    let existing = 0;
    
    for (const seat of seats) {
        const response = await createSeatSilent(seat);
        if (response) {
            created++;
        } else {
            // Seat already exists or failed to create
            existing++;
        }
    }
    
    // Clear bulk operation flag
    window.isBulkOperation = false;
    
    // Show summary message
    if (created === totalSeats) {
        showSuccess(`Successfully created ${created} seats!`);
    } else if (created > 0) {
        showSuccess(`Created ${created} new seats. ${existing} seats already existed.`);
    } else {
        showSuccess(`All ${totalSeats} seats already exist.`);
    }
    
    fetchSeats();
}

async function handleBulkSeatFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const startRow = parseInt(form.querySelector("#start-row").value);
    const endRow = parseInt(form.querySelector("#end-row").value);
    const seatsPerRow = parseInt(form.querySelector("#seats-per-row").value);
    
    if (startRow > endRow) {
        showError("Start row cannot be greater than end row.");
        return;
    }
    
    const totalSeats = (endRow - startRow + 1) * seatsPerRow;
    if (totalSeats > 200) {
        if (!confirm(`This will create ${totalSeats} seats. This might take a while. Continue?`)) {
            return;
        }
    }
    
    await createBulkSeats(startRow, endRow, seatsPerRow);
    form.reset();
}

// --- Ticket Card UI for tickets.html ---

function getTicketStatus(ticket) {
    const now = new Date();
    const showtime = new Date(ticket.showtime_date_and_time || ticket.showtime?.date_and_time);
    if (ticket.cancelled) return 'cancelled';
    if (showtime < now) return 'past';
    return 'upcoming';
}

function formatSeat(ticket) {
    if (ticket.row_no && ticket.seat_no) return `Row ${ticket.row_no}, Seat ${ticket.seat_no}`;
    if (ticket.seat && ticket.seat.row && ticket.seat.number) return `Row ${ticket.seat.row}, Seat ${ticket.seat.number}`;
    return 'N/A';
}

function renderTicketCards(tickets) {
    const grid = document.getElementById('tickets-list');
    if (!grid) return;
    if (!tickets.length) {
        grid.innerHTML = `<div class="empty-state">
            <i class="fas fa-ticket-alt"></i>
            <h3>No Tickets Yet</h3>
            <p>You haven't purchased any tickets yet. Check out our <a href="showtimes.html">upcoming shows</a>!</p>
        </div>`;
        return;
    }
    grid.innerHTML = '';
    tickets.forEach(ticket => {
        const status = getTicketStatus(ticket);
        const card = document.createElement('div');
        card.className = 'ticket-card';
        card.innerHTML = `
            <div class="ticket-card-header">
                <h3 class="ticket-card-title">${ticket.showtime?.play?.title || ticket.play_title || 'Play'}</h3>
                <div class="ticket-card-date"><i class="far fa-calendar-alt"></i> ${new Date(ticket.showtime_date_and_time || ticket.showtime?.date_and_time).toLocaleString()}</div>
            </div>
            <div class="ticket-card-body">
                <div class="ticket-card-details">
                    <div class="ticket-detail"><i class="fas fa-chair"></i> ${formatSeat(ticket)}</div>
                    <div class="ticket-detail"><i class="fas fa-ticket-alt"></i> ${ticket.ticket_no || 'N/A'}</div>
                    <div class="ticket-detail ticket-venue"><i class="fas fa-map-marker-alt"></i> ${ticket.venue || 'Main Theater'}</div>
                </div>
                <div class="ticket-card-footer">
                    <span class="ticket-status status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    <button class="btn-view-ticket" data-ticket-id="${ticket.ticket_no}"><i class="fas fa-eye"></i> View</button>
                </div>
            </div>
        `;
        card.querySelector('.btn-view-ticket').addEventListener('click', () => showTicketModal(ticket));
        grid.appendChild(card);
    });
}

async function fetchAndRenderUserTickets() {
    const grid = document.getElementById('tickets-list');
    if (!grid) return;
    const token = localStorage.getItem('accessToken');
    if (!token) {
        grid.innerHTML = '<p>You must be logged in to view your tickets. <a href="login.html">Login here</a>.</p>';
        return;
    }
    try {
        const res = await fetch(`${apiUrl}/tickets/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
            grid.innerHTML = '<p>Your session has expired. Please <a href="login.html">log in again</a>.</p>';
            return;
        }
        const tickets = await res.json();
        window._allTickets = tickets; // for filtering
        renderTicketCards(tickets);
  } catch (error) {
        console.error('Error fetching tickets:', error);
        grid.innerHTML = '<p>An error occurred while loading your tickets.</p>';
    }
}

function filterTicketsByStatus(status) {
    const tickets = window._allTickets || [];
    if (status === 'all') return tickets;
    return tickets.filter(t => getTicketStatus(t) === status);
}

document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    if (page === 'tickets.html') {
        fetchAndRenderUserTickets();
        const filter = document.getElementById('status-filter');
        if (filter) {
            filter.addEventListener('change', e => {
                const status = e.target.value;
                const filtered = filterTicketsByStatus(status);
                renderTicketCards(filtered);
            });
        }
    }
});

function showTicketModal(ticket) {
    const modal = document.getElementById('ticket-modal');
    if (!modal) return;
    // Fill modal fields
    document.getElementById('ticket-play').textContent = ticket.showtime?.play?.title || ticket.play_title || 'Play';
    document.getElementById('ticket-status').textContent = getTicketStatus(ticket).charAt(0).toUpperCase() + getTicketStatus(ticket).slice(1);
    document.getElementById('ticket-datetime').textContent = new Date(ticket.showtime_date_and_time || ticket.showtime?.date_and_time).toLocaleString();
    document.getElementById('ticket-venue').textContent = ticket.venue || 'Main Theater';
    document.getElementById('ticket-seat').textContent = formatSeat(ticket);
    document.getElementById('ticket-number').textContent = ticket.ticket_no || 'N/A';
    // TODO: Generate QR code if needed
    modal.style.display = 'block';
    // Close modal logic
    modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
    window.onclick = function(event) { if (event.target == modal) modal.style.display = 'none'; };
}

// --- Ticket Booking Modal Logic ---

let selectedSeat = null;
let bookingPlayId = null;
let bookingShowtime = null;

async function bookTickets(playId, showtimeDateTime) {
    bookingPlayId = playId;
    bookingShowtime = showtimeDateTime;
    selectedSeat = null;
    const modal = document.getElementById('seat-booking-modal');
    const seatListContainer = document.getElementById('seat-list-container');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    const selectedSeatText = document.getElementById('selected-seat-text');
    
    if (!modal || !seatListContainer || !confirmBtn) return;
    
    // Reset UI
    seatListContainer.innerHTML = '<div class="loading-seats"><i class="fas fa-spinner fa-spin"></i> Loading seats...</div>';
    confirmBtn.disabled = true;
    selectedSeatText.textContent = 'No seat selected';
    
    // Show modal with popup animation
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Fetch available seats for this showtime
    try {
        const res = await fetch(`${apiUrl}/showtimes/${playId}/${encodeURIComponent(showtimeDateTime)}/available-seats`);
        if (!res.ok) throw new Error('Failed to fetch seats');
        const seats = await res.json();
        
        if (!seats.length) {
            seatListContainer.innerHTML = '<div class="no-seats"><i class="fas fa-exclamation-triangle"></i><p>No seats found for this showtime.</p></div>';
            return;
        }
        
        // Group seats by row
        const seatsByRow = {};
        seats.forEach(seat => {
            if (!seatsByRow[seat.row_no]) {
                seatsByRow[seat.row_no] = [];
            }
            seatsByRow[seat.row_no].push(seat);
        });
        
        // Sort rows and seats within each row
        const sortedRows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));
        
        seatListContainer.innerHTML = '';
        sortedRows.forEach(rowNo => {
            const rowSeats = seatsByRow[rowNo].sort((a, b) => parseInt(a.seat_no) - parseInt(b.seat_no));
            
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            
            // Add row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = `R${rowNo}`;
            rowDiv.appendChild(rowLabel);
            
            // Add seats for this row
            rowSeats.forEach(seat => {
                const btn = document.createElement('button');
                btn.className = 'seat-btn';
                
                // Add booked class if seat is booked
                if (seat.is_booked) {
                    btn.classList.add('booked');
                }
                
                btn.innerHTML = `
                    <span class="seat-number">${seat.seat_no}</span>
                `;
                
                // Only add click handler if seat is not booked
                if (!seat.is_booked) {
                    btn.onclick = () => {
                        selectedSeat = seat;
                        // Update selected seat text
                        selectedSeatText.textContent = `Row ${seat.row_no}, Seat ${seat.seat_no}`;
                        // Highlight selected
                        seatListContainer.querySelectorAll('.seat-btn').forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        confirmBtn.disabled = false;
                    };
                }
                
                rowDiv.appendChild(btn);
            });
            
            seatListContainer.appendChild(rowDiv);
        });
    } catch (err) {
        seatListContainer.innerHTML = '<div class="error-seats"><i class="fas fa-exclamation-circle"></i><p>Error loading seats. Please try again.</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    // Modal close logic
    const seatModal = document.getElementById('seat-booking-modal');
    if (seatModal) {
        const closeModal = () => {
            seatModal.classList.remove('show');
            setTimeout(() => seatModal.style.display = 'none', 300);
        };
        
        seatModal.querySelector('.close-modal').onclick = closeModal;
        window.onclick = function(event) { 
            if (event.target == seatModal) closeModal(); 
        };
    }
    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            if (!selectedSeat || !bookingPlayId || !bookingShowtime) return;
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('You must be logged in to book a ticket.');
                return;
            }
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Booking...';
            try {
                const res = await fetch(`${apiUrl}/tickets/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        showtime_play_id: bookingPlayId,
                        showtime_date_and_time: bookingShowtime,
                        row_no: selectedSeat.row_no,
                        seat_no: selectedSeat.seat_no
                    })
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.detail || 'Booking failed');
                }
                const result = await res.json();
                alert('Ticket booked successfully!');
                seatModal.classList.remove('show');
                setTimeout(() => seatModal.style.display = 'none', 300);
                // Optionally refresh tickets or showtimes
            } catch (err) {
                alert(`Failed to book ticket: ${err.message}`);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Book Ticket';
            }
        };
    }
});
