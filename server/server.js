// read: 
// Querying/reading data from database: https://mongoosejs.com/docs/models.html#querying
// deleting data from database: https://mongoosejs.com/docs/models.html#deleting
// updating data in database: https://mongoosejs.com/docs/models.html#updating


var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
var cookieParser = require("cookie-parser");
var path = require("path");
var socketIo = require("socket.io");
var authRoutes = require("./routes/auth");
var { SERVER_SECRET, PORT } = require("./core");
var { userModel, tweetsModel } = require("./derepo");
var http = require("http");

var app = express();
var server = http.createServer(app);
var io = socketIo(server);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    credentials: true,
}));
app.use(cookieParser());
app.use("/", express.static(path.resolve(path.join(__dirname, "../public"))));




app.get("/download", (req, res) => {
    console.log(__dirname);
    res.sendFile(path.resolve(path.join(__dirname, "/package.json")))
})

app.use("/auth", authRoutes);




app.use(function (req, res, next) {

    console.log("req.cookies: ", req.cookies);
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate; // 86400,000

            if (diff > 300000) { // expire after 5 min (in milis)
                res.status(401).send("token expired")
            } else { // issue new token
                var token = jwt.sign({
                    id: decodedData.id,
                    userName: decodedData.userName,
                    userEmail: decodedData.userEmail,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86_400_000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {
    userModel.findById(req.body.jToken.id, 'userName userEmail',
        function (err, doc) {
            if (!err) {
                res.send({
                    profile: doc
                })
            } else {
                res.status(500).send({
                    message: "server error"
                })
            }

        })
});

app.post("/postTweet", (req, res, next) => {
    console.log("req body of tweet ",req.body);
    if (!req.body.userEmail || !req.body.tweetText) {
        res.status(409).send(`
            Please send useremail and tweet in json body
            e.g:
            "userEmail" : "abc@gmail.com",
            "tweetText" : "xxxxxx"
        `)
        return;
    };
    userModel.findById(req.body.jToken.id, 'userName userEmail',
        (err, user) => {
            if (!err) {
                console.log("tweet user : " + user);
                tweetsModel.create({
                    userEmail: req.body.userEmail,
                    tweetText: req.body.tweetText,
                    userName : user.userName,
                }).then((data) => {
                    console.log("Tweet created: " + data),
                        res.status(200).send({
                            message: "tweet created",
                            userName: user.userName,
                            userEmail: user.userEmail,
                        });
                        io.emit("NEW_POST" , data);
                }).catch((err) => {
                    res.status(500).send({
                        message: "an error occured : " + err,
                    });
                });
            }
            else {
                res.status.send({
                    message: "an error occured" + err,
                })
            }
        })
});

app.get("/getTweets", (req, res, next) => {

  tweetsModel.find({},(err,data)=>{
    if(!err)
    {
        console.log("tweet data=>",data);
        res.status(200).send({
            tweets : data,
        });
    }
    else{
        console.log("error : ",err);
        res.status(500).send("error");
    }
  })
});

app.get("/myTweets", (req, res, next) => {
    console.log("my tweets user=>",req.body);
    tweetsModel.find({userEmail : req.body.jToken.userEmail},(err,data)=>{
      if(!err)
      {
          console.log("tweet data=>",data);
          res.status(200).send({
              tweets : data,
          });
      }
      else{
          console.log("error : ",err);
          res.status(500).send("error");
      }
    })
  });





server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})

