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

        sessionStorage.setItem(
            "adminToken",
            data.access_token
        );

        loginMessage.textContent = "Login successful!";
        loginMessage.style.color = "green";

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

        allStudents = students;

        updateStatistics(students);

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
// UPDATE STATISTICS
// ==========================================

function updateStatistics(students) {

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("cricketCount").textContent =
        students.filter(
            student => student.sport === "Cricket"
        ).length;

    document.getElementById("footballCount").textContent =
        students.filter(
            student => student.sport === "Football"
        ).length;

    document.getElementById("basketballCount").textContent =
        students.filter(
            student => student.sport === "Basketball"
        ).length;

    document.getElementById("badmintonCount").textContent =
        students.filter(
            student => student.sport === "Badminton"
        ).length;
}


// ==========================================
// DISPLAY STUDENTS
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
                    <th>Actions</th>
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

                            <td>

                                <button
                                    onclick="editStudent(${student.id})"
                                >
                                    Edit
                                </button>

                                <button
                                    onclick="deleteStudent(${student.id})"
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

    `;
}


// ==========================================
// EDIT STUDENT
// ==========================================

async function editStudent(studentId) {

    const student =
        allStudents.find(
            student => student.id === studentId
        );

    if (!student) {
        alert("Student not found.");
        return;
    }


    const name = prompt(
        "Student name:",
        student.name || ""
    );

    if (name === null) return;


    const rollNo = prompt(
        "Roll number:",
        student.roll_no || ""
    );

    if (rollNo === null) return;


    const email = prompt(
        "Email:",
        student.email || ""
    );

    if (email === null) return;


    const phone = prompt(
        "Phone:",
        student.phone || ""
    );

    if (phone === null) return;


    const sport = prompt(
        "Sport:",
        student.sport || ""
    );

    if (sport === null) return;


    const category = prompt(
        "Category:",
        student.category || ""
    );

    if (category === null) return;


    const updatedStudent = {

        name: name.trim(),

        roll_no: rollNo.trim(),

        email: email.trim(),

        phone: phone.trim(),

        sport: sport.trim(),

        category: category.trim()

    };


    const token =
        sessionStorage.getItem("adminToken");


    try {

        const response = await fetch(
            `${BACKEND_URL}/students/${studentId}`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedStudent)
            }
        );


        const data = await response.json();


        if (response.status === 401) {

            logout();

            throw new Error(
                "Your login session has expired."
            );
        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to update student."
            );
        }


        alert(
            "Student updated successfully!"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to update student."
        );

    }

}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(studentId) {

    const student =
        allStudents.find(
            student => student.id === studentId
        );


    if (!student) {

        alert("Student not found.");

        return;
    }


    const confirmed = confirm(
        `Are you sure you want to delete ${student.name}?`
    );


    if (!confirmed) {
        return;
    }


    const token =
        sessionStorage.getItem("adminToken");


    try {

        const response = await fetch(
            `${BACKEND_URL}/students/${studentId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();


        if (response.status === 401) {

            logout();

            throw new Error(
                "Your login session has expired."
            );
        }


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to delete student."
            );
        }


        alert(
            "Student deleted successfully!"
        );


        await loadStudents();


    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to delete student."
        );

    }

}


// ==========================================
// SEARCH + FILTER
// ==========================================

function filterStudents() {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedSport =
        sportFilter.value;


    const filteredStudents =
        allStudents.filter(function (student) {

            const name =
                (student.name || "")
                    .toLowerCase();

            const rollNo =
                (student.roll_no || "")
                    .toLowerCase();

            const email =
                (student.email || "")
                    .toLowerCase();


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