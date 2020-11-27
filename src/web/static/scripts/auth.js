function setAuthButtonActions() {
    //buttons and inputs
    const emailL = document.getElementById("loginEmail")
    const passwordL = document.getElementById("loginPassword")
    const loginButton = document.getElementById("loginButton")

    const emailS = document.getElementById("signupEmail")
    const passwordS = document.getElementById("signupPassword")
    const usernameS = document.getElementById("signupUsername")
    const signupButton = document.getElementById("signupButton")

    const logoutButton = document.getElementById("logoutButton")

    if (loginButton) {
        loginButton.onclick = function () {
            console.log("loginbutton clicked")
            $.ajax({
                type: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                url: "http://127.0.0.1:3000/api/auth/login",
                data: JSON.stringify({ "user": { "email": emailL.value, "password": passwordL.value } }),
                success: function (response) {
                    location.reload() // reloads the page 
                    console.log(response)
                },
                error: function showErrorMessage(xhr, status, error) {
                    console.log(xhr)
                }
            });
        }
    }

    if (signupButton) {
        signupButton.onclick = function () {
            console.log("signupbutton clicked")
            $.ajax({
                type: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                url: "http://127.0.0.1:3000/api/auth/signup",
                data: JSON.stringify({ "user": { "email": emailS.value, "password": passwordS.value, username: usernameS.value } }),
                success: function (response) {
                    location.reload() // reloads the page
                    console.log(response)
                },
                error: function showErrorMessage(xhr, status, error) {
                    console.log(xhr)
                }
            });
        }
    }

    if (logoutButton) {
        logoutButton.onclick = function () {
            console.log("logoutButton clicked")
            $.ajax({
                type: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                },
                url: "http://127.0.0.1:3000/api/auth/logout",
                success: function (response) {
                    location.reload() // reloads the page
                    console.log(response)
                },
                error: function showErrorMessage(xhr, status, error) {
                    console.log(xhr)
                }
            });
        }
    }
} 
