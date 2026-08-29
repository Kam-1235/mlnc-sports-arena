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


// ==========================================
// CHECK IF ADMIN IS ALREADY LOGGED IN
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


        // Save JWT token
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

loadButton.addEventListener("click", loadStudents);


async function loadStudents() {

    const token = sessionStorage.getItem("adminToken");

    if (!token) {

        logout();

        return;

    }


    message.textContent = "Loading registrations...";

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


        if (students.length === 0) {

            message.textContent =
                "No students have registered yet.";

            studentsContainer.innerHTML =
                "<p>No registrations found.</p>";

            return;

        }


        message.textContent =
            `${students.length} registration(s) found.`;


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


    } catch (error) {

        console.error(error);

        message.textContent =
            error.message || "Unable to load registrations.";

        message.style.color = "red";

    }

}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener("click", logout);


function logout() {

    sessionStorage.removeItem("adminToken");

    loginSection.style.display = "block";
    dashboardSection.style.display = "none";

    usernameInput.value = "";
    passwordInput.value = "";

    loginMessage.textContent = "";
    message.textContent = "";

    studentsContainer.innerHTML = "";

}