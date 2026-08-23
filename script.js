const matches = [
  {
    date: "10 Sep 2026",
    sport: "Cricket",
    match: "Thunder Hawks vs Blue Warriors",
    time: "10:00 AM",
    venue: "College Ground",
    status: "Upcoming"
  },
  {
    date: "11 Sep 2026",
    sport: "Badminton",
    match: "A. Sharma vs R. Singh",
    time: "11:30 AM",
    venue: "Indoor Hall",
    status: "Upcoming"
  },
  {
    date: "12 Sep 2026",
    sport: "Football",
    match: "Campus Titans vs Delhi Strikers",
    time: "3:00 PM",
    venue: "Football Ground",
    status: "Upcoming"
  },
  {
    date: "13 Sep 2026",
    sport: "Basketball",
    match: "MLNC Hoopers vs Campus Titans",
    time: "2:00 PM",
    venue: "Basketball Court",
    status: "Upcoming"
  },
  {
    date: "14 Sep 2026",
    sport: "Cricket",
    match: "Delhi Strikers vs Thunder Hawks",
    time: "10:00 AM",
    venue: "College Ground",
    status: "Upcoming"
  },
  {
    date: "16 Sep 2026",
    sport: "Football",
    match: "Blue Warriors vs Campus Titans",
    time: "4:00 PM",
    venue: "Football Ground",
    status: "Upcoming"
  }
];


// ==========================================
// MATCH SCHEDULE
// ==========================================

function renderSchedule(filter = "all") {
  const body = document.getElementById("scheduleBody");

  const rows = matches.filter(function (match) {
    return filter === "all" || match.sport === filter;
  });

  body.innerHTML = rows.map(function (match) {
    return `
      <tr>
        <td>${match.date}</td>
        <td><b>${match.sport}</b></td>
        <td>${match.match}</td>
        <td>${match.time}</td>
        <td>${match.venue}</td>
        <td>
          <span class="status">${match.status}</span>
        </td>
      </tr>
    `;
  }).join("");
}

renderSchedule();


// ==========================================
// SPORT FILTER
// ==========================================

document.getElementById("sportFilter").addEventListener("change", function (event) {
  renderSchedule(event.target.value);
});


// ==========================================
// SELECT SPORT
// ==========================================

function selectSport(sport) {
  document.getElementById("sport").value = sport;

  document.getElementById("register").scrollIntoView({
    behavior: "smooth"
  });

  setTimeout(function () {
    document.getElementById("name").focus();
  }, 500);
}


// ==========================================
// STUDENT REGISTRATION
// ==========================================

document.getElementById("registrationForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const sport = document.getElementById("sport").value;
  const category = document.getElementById("category").value;
  const msg = document.getElementById("formMessage");

  // Student data to send to FastAPI
  const studentData = {
    name: name,
    roll_no: roll,
    email: email,
    phone: phone,
    sport: sport,
    category: category
  };

  try {

    // ==========================================
    // LIVE RENDER BACKEND
    // ==========================================

    const response = await fetch(
      "https://mlnc-sports-backend.onrender.com/students",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(studentData)
      }
    );


    // ==========================================
    // CHECK RESPONSE
    // ==========================================

    if (!response.ok) {
      const errorData = await response.json().catch(function () {
        return null;
      });

      console.error("Backend error:", errorData);

      throw new Error("Registration failed");
    }


    // ==========================================
    // GET RESPONSE FROM BACKEND
    // ==========================================

    const result = await response.json();

    console.log("Student registered successfully:", result);


    // ==========================================
    // SUCCESS MESSAGE
    // ==========================================

    msg.textContent =
      `✓ Thank you, ${result.name}! Your ${result.sport} registration has been submitted successfully.`;

    msg.style.color = "#087443";


    // ==========================================
    // RESET FORM
    // ==========================================

    document.getElementById("registrationForm").reset();

  } catch (error) {

    console.error("Registration error:", error);

    msg.textContent =
      "Registration failed. Please try again.";

    msg.style.color = "red";
  }
});


// ==========================================
// MOBILE MENU
// ==========================================

document.getElementById("menuBtn").addEventListener("click", function () {
  document.getElementById("nav").classList.toggle("open");
});


// ==========================================
// CLOSE MOBILE MENU AFTER CLICKING A LINK
// ==========================================

document.querySelectorAll("nav a").forEach(function (link) {
  link.addEventListener("click", function () {
    document.getElementById("nav").classList.remove("open");
  });
});