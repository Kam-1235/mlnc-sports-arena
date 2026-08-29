const API_BASE_URL = "https://mlnc-sports-backend.onrender.com";

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
// LOGIN
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
            `${API_BASE_URL}/admin/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded"
                },

                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Invalid username or password"
            );
        }

        // Save JWT token
        localStorage.setItem(
            "adminToken",
            data.access_token
        );

        localStorage.setItem(
            "adminUsername",
            username
        );

        // Show dashboard
        loginSection.style.display = "none";
        dashboardSection.style.display = "block";

        loginMessage.textContent = "";

        // Load registrations automatically
        loadStudents();

    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            error.message || "Login failed.";

        loginMessage.style.color = "red";
    }

});


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        showLogin();

        return;
    }

    message.textContent =
        "Loading registrations...";

    message.style.color = "";

    studentsContainer.innerHTML = "";

    try {

        const response = await fetch(
            `${API_BASE_URL}/students`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        // Token expired / invalid
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

        const students =
            await response.json();

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

            <table border="1"
                   cellpadding="10"
                   cellspacing="0">

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
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    ${students.map(function (student) {

                        return `

                            <tr>

                                <td>${escapeHTML(student.id)}</td>

                                <td>${escapeHTML(student.name)}</td>

                                <td>${escapeHTML(student.roll_no)}</td>

                                <td>${escapeHTML(student.email)}</td>

                                <td>${escapeHTML(student.phone || "")}</td>

                                <td>${escapeHTML(student.sport)}</td>

                                <td>${escapeHTML(student.category)}</td>

                                <td>
                                    ${escapeHTML(
                                        student.registered_at || ""
                                    )}
                                </td>

                                <td>

                                    <button
                                        onclick="editStudent(${student.id})">
                                        Edit
                                    </button>

                                    <button
                                        onclick="deleteStudent(${student.id})">
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>
        `;

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to load registrations.";

        message.style.color = "red";
    }
}


// ==========================================
// EDIT STUDENT
// ==========================================

async function editStudent(studentId) {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        showLogin();

        return;
    }

    try {

        // Get current student
        const response = await fetch(
            `${API_BASE_URL}/students/${studentId}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                "Unable to get student details."
            );
        }

        const student =
            await response.json();

        const name =
            prompt("Name:", student.name);

        if (name === null) return;

        const roll =
            prompt("Roll No.:", student.roll_no);

        if (roll === null) return;

        const email =
            prompt("Email:", student.email);

        if (email === null) return;

        const phone =
            prompt("Phone:", student.phone);

        if (phone === null) return;

        const sport =
            prompt("Sport:", student.sport);

        if (sport === null) return;

        const category =
            prompt("Category:", student.category);

        if (category === null) return;


        const updatedStudent = {

            name: name.trim(),

            roll_no: roll.trim(),

            email: email.trim(),

            phone: phone.trim(),

            sport: sport.trim(),

            category: category.trim()

        };


        const updateResponse =
            await fetch(
                `${API_BASE_URL}/students/${studentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(updatedStudent)
                }
            );


        if (updateResponse.status === 401) {

            logout();

            return;
        }


        if (!updateResponse.ok) {

            throw new Error(
                "Failed to update student."
            );
        }


        message.textContent =
            "Student updated successfully.";

        message.style.color = "#087443";

        await loadStudents();

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to update student.";

        message.style.color = "red";
    }
}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(studentId) {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        showLogin();

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this student?"
        );

    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/students/${studentId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            logout();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to delete student."
            );
        }


        message.textContent =
            "Student deleted successfully.";

        message.style.color = "#087443";

        await loadStudents();

    } catch (error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Unable to delete student.";

        message.style.color = "red";
    }
}


// ==========================================
// LOGOUT
// ==========================================

logoutButton.addEventListener(
    "click",
    function () {

        logout();

    }
);


function logout() {

    localStorage.removeItem("adminToken");

    localStorage.removeItem("adminUsername");

    showLogin();

    usernameInput.value = "";

    passwordInput.value = "";

    studentsContainer.innerHTML = "";

    message.textContent = "";
}


function showLogin() {

    loginSection.style.display = "block";

    dashboardSection.style.display = "none";

    usernameInput.focus();
}


// ==========================================
// REFRESH BUTTON
// ==========================================

loadButton.addEventListener(
    "click",
    loadStudents
);


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// CHECK EXISTING LOGIN
// ==========================================

const existingToken =
    localStorage.getItem("adminToken");

if (existingToken) {

    loginSection.style.display = "none";

    dashboardSection.style.display = "block";

    loadStudents();

} else {

    showLogin();
}