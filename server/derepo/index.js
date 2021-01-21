
var {DBURI} = require("../core");



var mongoose = require("mongoose");



let dbURI = DBURI;


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

////////////////mongodb connected disconnected events///////////////////////////////////////////////

mongoose.connection.on("connected", () => { // MONGODB Connected
    console.log("Mongoose connected");
})


mongoose.connection.on("disconnected", () => {
    console.log("MONGODB disconnected");
    process.exit(1);
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB disconnected due to : " + err);
    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("App is terminating");
    mongoose.connection.close(() => {
        console.log("MONGODB disconnected");
        process.exit(0);
    })

})

var userSchema = new mongoose.Schema({
    userEmail: String,
    userName: String,
    userPassword: String,
    profileUrl : String,
});
var userModel = mongoose.model("users", userSchema);

var otpSchema = new mongoose.Schema({
    "userEmail": String,
    "otp": String,
    "createdOn" : { "type": Date, "default": Date.now },
});
var otpModel = mongoose.model("otp", otpSchema);

var tweetsSchema = mongoose.Schema({
    userEmail : String,
    tweetText : String,
    userName : String,
    profileUrl : String,
    "createdOn" : { "type": Date, "default": Date.now },
})

var tweetsModel = mongoose.model("tweets",tweetsSchema);



module.exports = {
    userModel: userModel,
    otpModel: otpModel,
    tweetsModel : tweetsModel,
}