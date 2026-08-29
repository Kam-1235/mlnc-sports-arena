const BACKEND_URL = "https://mlnc-sports-backend.onrender.com";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

const loadButton = document.getElementById("loadStudents");
const logoutButton = document.getElementById("logoutButton");

const message = document.getElementById("message");
const studentsContainer = document.getElementById("studentsContainer");

const searchInput = document.getElementById("searchStudent");
const sportFilter = document.getElementById("sportFilter");

let allStudents = [];


// ==========================================
// CHECK EXISTING LOGIN
// ==========================================

const savedToken = sessionStorage.getItem("adminToken");

if (savedToken) {
    showDashboard();
}


// ==========================================
// ADMIN LOGIN
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    loginMessage.textContent = "Logging in...";
    loginMessage.style.color = "";


    try {

        const formData = new URLSearchParams();

        formData.append("username", username);
        formData.append("password", password);


        const response = await fetch(
            `${BACKEND_URL}/admin/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Incorrect username or password"
            );

        }


        // Save login token
        sessionStorage.setItem(
            "adminToken",
            data.access_token
        );


        loginMessage.textContent = "Login successful!";

        showDashboard();

        loadStudents();


    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            error.message || "Login failed.";

        loginMessage.style.color = "red";

    }

});


// ==========================================
// SHOW DASHBOARD
// ==========================================

function showDashboard() {

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";

}


// ==========================================
// LOAD STUDENTS
// ==========================================

loadButton.addEventListener(
    "click",
    loadStudents
);


async function loadStudents() {

    const token = sessionStorage.getItem("adminToken");

    if (!token) {

        logout();

        return;

    }


    message.textContent =
        "Loading registrations...";

    message.style.color = "";

    studentsContainer.innerHTML = "";


    try {

        const response = await fetch(
            `${BACKEND_URL}/students`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );


        if (response.status === 401) {

            logout();

            throw new Error(
                "Your login session has expired. Please login again."
            );

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load registrations."
            );

        }


        const students = await response.json();


        // Save all students
        allStudents = students;


        // ==========================================
        // UPDATE STATISTICS
        // ==========================================

        document.getElementById(
            "totalStudents"
        ).textContent = students.length;


        document.getElementById(
            "cricketCount"
        ).textContent =
            students.filter(
                student => student.sport === "Cricket"
            ).length;


        document.getElementById(
            "footballCount"
        ).textContent =
            students.filter(
                student => student.sport === "Football"
            ).length;


        document.getElementById(
            "basketballCount"
        ).textContent =
            students.filter(
                student => student.sport === "Basketball"
            ).length;


        document.getElementById(
            "badmintonCount"
        ).textContent =
            students.filter(
                student => student.sport === "Badminton"
            ).length;


        // ==========================================
        // DISPLAY STUDENTS
        // ==========================================

        if (students.length === 0) {

            message.textContent =
                "No students have registered yet.";

            studentsContainer.innerHTML =
                "<p>No registrations found.</p>";

            return;

        }


        message.textContent =
            `${students.length} registration(s) found.`;


        displayStudents(students);


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to load registrations.";

        message.style.color = "red";

    }

}


// ==========================================
// DISPLAY STUDENTS TABLE
// ==========================================

function displayStudents(students) {

    if (students.length === 0) {

        studentsContainer.innerHTML =
            "<p>No matching registrations found.</p>";

        return;

    }


    studentsContainer.innerHTML = `

        <table border="1" cellpadding="10" cellspacing="0">

            <thead>

                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Sport</th>
                    <th>Category</th>
                    <th>Registered At</th>
                </tr>

            </thead>

            <tbody>

                ${students.map(function (student) {

                    return `

                        <tr>

                            <td>${student.id ?? ""}</td>

                            <td>${student.name ?? ""}</td>

                            <td>${student.roll_no ?? ""}</td>

                            <td>${student.email ?? ""}</td>

                            <td>${student.phone ?? ""}</td>

                            <td>${student.sport ?? ""}</td>

                            <td>${student.category ?? ""}</td>

                            <td>${student.registered_at ?? ""}</td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

    `;

}


// ==========================================
// SEARCH + SPORT FILTER
// ==========================================

function filterStudents() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedSport =
        sportFilter.value;


    const filteredStudents =
        allStudents.filter(function (student) {


            const name =
                (student.name || "").toLowerCase();

            const rollNo =
                (student.roll_no || "").toLowerCase();

            const email =
                (student.email || "").toLowerCase();


            const matchesSearch =
                name.includes(searchText) ||
                rollNo.includes(searchText) ||
                email.includes(searchText);


            const matchesSport =
                selectedSport === "All" ||
                student.sport === selectedSport;


            return (
                matchesSearch &&
                matchesSport
            );

        });


    displayStudents(filteredStudents);


    message.textContent =
        `${filteredStudents.length} registration(s) shown.`;

}


// ==========================================
// SEARCH EVENTS
// ==========================================

searchInput.addEventListener(
    "input",
    filterStudents
);


sportFilter.addEventListener(
    "change",
    filterStudents
);


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    logout
);


function logout() {

    sessionStorage.removeItem(
        "adminToken"
    );


    loginSection.style.display =
        "block";

    dashboardSection.style.display =
        "none";


    usernameInput.value = "";

    passwordInput.value = "";


    loginMessage.textContent = "";

    message.textContent = "";

    studentsContainer.innerHTML = "";


    allStudents = [];

}