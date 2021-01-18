
// const url = 'https://loginjwtmongo.herokuapp.com';
const url = "http://localhost:5000";
// document.getElementById("date").innerHTML = new Date('2019-06-11')
timeago().render(document.querySelectorAll('.timeago'));
var socket = io(url);

socket.on('connect', function () {
    // console.log("I am connected");
});


const signup = () => {

    var userEmail = document.getElementById("email").value.toLowerCase();
    var userPassword = document.getElementById("password").value
    var userName = document.getElementById("name").value

    let obj = {
        userEmail: userEmail,
        userPassword: userPassword,
        userName: userName,
    };

    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/signup");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(obj));

    Http.onreadystatechange = (e) => {

        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            console.log(Http.status);
            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href = "login.html";
            }
            else {
                alert(jsonRes.message);
            }
        }
    }
    return false;
}

const login = () => {

    var userEmail = document.getElementById("email").value.toLowerCase();
    var userPassword = document.getElementById("password").value

    obj = {
        userEmail: userEmail,
        userPassword: userPassword,
    }
    // console.log(obj);

    const Http = new XMLHttpRequest();

    Http.open("POST", url + "/auth/login");
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify(obj));

    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            console.log(Http.responseText);
            let jsonRes = JSON.parse(Http.responseText);

            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href = "dashboard.html";
            }
            else {
                alert(jsonRes.message);
            }

        }
    }
    return false;
}

function getProfile() {
    // console.log("url=>", url);
    axios({
        method: 'get',
        url: "http://localhost:5000/profile",
    }).then((response) => {
        // console.log("welcoming user==>", response);
        // console.log(response.data);
        document.getElementById('welcomeUser').innerHTML = response.data.profile.userName;
        sessionStorage.setItem("userEmail", response.data.profile.userEmail);
        getTweets();
    }, (error) => {
        // console.log(error.message);
        location.href = "./login.html"
        // console.log("this is my error", error);
    });

}

function forgot_password() {
    axios({
        method: 'post',
        url: url + "/auth/forget-password",
        data: {
            userEmail: document.getElementById("email").value,
        }
    }).then((response) => {
        document.getElementById("forgot-response").style.display = "initial";
        document.getElementById("forgot-response").innerHTML = JSON.stringify(response.message);
        alert(JSON.stringify(response.message));
        localStorage.setItem("forgot_email", document.getElementById("email").value);
        window.location.href = "reset-password.html";

    }, (error) => {
        console.log(error);
    })
    return false;
}

function checkOtp() {
    var forgot_email = (localStorage.getItem("forgot_email"))
    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/auth/forget-password-step-2")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify({
        userEmail: forgot_email,
        newPassword: document.getElementById("newPassword").value,
        otp: document.getElementById("otp").value,
    }))
    Http.onreadystatechange = (e) => {
        let jsonRes = JSON.parse(Http.responseText);
        if (Http.readyState === 4) {
            if (Http.status === 200) {
                alert(jsonRes.message);
                window.location.href = "login.html";
            }
            else {
                document.getElementById("forgot-response").style.display = "initial";
                document.getElementById("forgot-response").innerHTML = jsonRes.message;
                alert(jsonRes.message);
            }
        }
    }

    return false;

}
const clearTweets = () => {
    document.getElementById("posts") = "";
}

const getTweets = () => {
    var userEmail = sessionStorage.getItem("userEmail");
    document.getElementById("posts").innerHTML = "";
    const Http = new XMLHttpRequest();
    Http.open("GET", url + "/getTweets");
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {

            data = JSON.parse((Http.responseText));
            // console.log(data);

            for (let i = 0; i < data.tweets.length; i++) {
                date = moment((data.tweets[i].createdOn)).fromNow()
                // if (data.tweets[i].userEmail !== userEmail) {
                var eachTweet = document.createElement("li");
                eachTweet.innerHTML =
                    `<h4 class="userName">
                    ${data.tweets[i].userName}
                </h4> 
                <small class="timeago">${date}</small>
                <p class="userPost" datetime=${date}>
                    ${data.tweets[i].tweetText}
                </p>`;

                // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
                document.getElementById("posts").appendChild(eachTweet)
                // }
            }
        }
    }

}



const postTweet = () => {

    userEmail = sessionStorage.getItem("userEmail");
    const Http = new XMLHttpRequest();
    Http.open("POST", url + "/postTweet")
    Http.setRequestHeader("Content-Type", "application/json");
    Http.send(JSON.stringify({
        userEmail: userEmail,
        tweetText: document.getElementById("tweetText").value,
    }))


    document.getElementById("tweetText").value = "";

}

const myTweets = () => {
    document.getElementById("posts").innerHTML = "";
    const Http = new XMLHttpRequest();
    Http.open("GET", url + "/myTweets");
    Http.send();
    Http.onreadystatechange = (e) => {
        if (Http.readyState === 4) {
            let jsonRes = JSON.parse(Http.responseText)
            // console.log(jsonRes);
            for (let i = 0; i < jsonRes.tweets.length; i++) {
                // console.log(`this is ${i} tweet = ${jsonRes.tweets[i].createdOn}`);

                var eachTweet = document.createElement("li");
                eachTweet.innerHTML =
                    `<h4 class="userName">
                    ${jsonRes.tweets[i].userName}
                </h4> 
                <small class="timeago">${jsonRes.tweets[i].createdOn}</small>
                <p class="userPost">
                    ${jsonRes.tweets[i].tweetText}
                </p>`;

                // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
                document.getElementById("posts").appendChild(eachTweet)

            }
        }
    }
}

socket.on("NEW_POST", (newPost) => {

    var eachTweet = document.createElement("li");
    eachTweet.innerHTML =
        `<h4 class="userName">
        ${newPost.userName}
    </h4> 
    <small class="timeago">${moment(newPost.createdOn).fromNow()}</small>
    <p class="userPost">
        ${newPost.tweetText}
    </p>`;
    // console.log(`User: ${tweets[i]} ${tweets[i].userPosts[j]}`)
    document.getElementById("posts").appendChild(eachTweet)
})


let logout = () => {
    axios({
        method: "post",
        url: url + "/auth/logout",
    }).then((response) => {
        alert(response.data);
        sessionStorage.removeItem("userEmail");
        window.location.href = "login.html";
    })
}

