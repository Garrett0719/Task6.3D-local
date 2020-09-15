const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")
const mongoose = require("mongoose")
const validator = require("validator")
const alert = require("alert")
const Registration = require("./registration.js")
const bcrypt = require("bcrypt")
const salt = bcrypt.genSaltSync(10);
var User = mongoose.model("registration")
const server = require("./server.js")
var flash = require('connect-flash');
var session = require('express-session');
var nodemailer = require('nodemailer');
const email = require('./email.js');
const cors = require('cors')

var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

  const check = {}

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.use(session({ 
    cookie: { maxAge: 8640000}, 
    resave: false, 
    saveUninitialized: false,
    secret:'$$$iCrowdTaskSecret'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(Registration.createStrategy())
passport.serializeUser(Registration.serializeUser())
passport.deserializeUser(Registration.deserializeUser())

app.post('/email', function(req, res, next) {
    var mail = req.body.email;
    
email.send({
    from: '"YuhaoYang" <kapgarry0719@gmail.com>', 
    to: mail, 
    subject: 'Login success',
    text: 'Some simple words.', 
    html: '<h3>Please click the following link to reset your password</h3><a href="http://localhost:8000/resetpwd">http://localhost:8000/resetpwd</a>'
  });
  res.redirect('/');
});

app.get('/reqtaskgoogle',(req,res)=>{
    res.sendFile(__dirname + "/reqtaskgoogle.html")
})

app.get('/',(req,res)=>{
    if(req.session.sign){
        res.redirect('/reqtask')
    }
    else{
        res.sendFile(__dirname + "/reqlogin.html")
    }
})

mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB3",{useNewUrlParser:true, useUnifiedTopology:true})

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

app.get('/reqsignup',function (req,res) {
    res.sendFile(__dirname+"/"+"reqsignup.html");
})

app.get('/forgotpwd',(req,res)=>{
    res.sendFile(__dirname + "/forgotpwd.html")
})

app.get('/resetpwd',(req,res)=>{
    res.sendFile(__dirname + "/resetpwd.html")
})

app.post('/reqlogin',(req,res)=>{
    const country = req.body.country
    const firstname = req.body.first_name
    const lastname = req.body.last_name
    const email = req.body.email
    let password = req.body.password
    let confirm = req.body.confirmpassword
    const address = req.body.address
    const address2 = req.body.address2
    const city = req.body.city
    const state = req.body.region
    const zip = req.body.zip
    const tel = req.body.phone
    let hash = bcrypt.hashSync(password, salt)
    password = hash
    confirm = hash
    module.exports.hash = hash;
    module.exports.confirm = confirm;
    const registration = new Registration({
        livecountry:country,
        fname: firstname,
        lname: lastname,
        Password: password,
        Email: email,
        Address:address,
        Address2:address2,
        City:city,
        State:state,
        Zip:zip,
        Phonenumber:tel
    })
    registration.save(function(error){
        if(error){
             if(validator.isEmpty(firstname)){
                alert("Please input first name")
            }
            else if(validator.isEmpty(country)){
                alert("Please choose a country")
            }
            else if(validator.isEmpty(lastname)){
                alert("Please input last name")
            }
            else if(validator.isEmpty(email)){
                alert('Please input email address!')
            }
            else if(!validator.isEmail(email)){
                alert("Email is not valid!")
            }
            else if(!validator.isLength(password,{min:8})){
                alert('password should be at least 8 characters!')
            }
            else if(validator.isEmpty(password)){
                alert('Please input password!')
            }
            else if(!validator.equals(confirm, password)){
                alert('Password does not match with Confirm password!')
            }
            else if(validator.isEmpty(address)){
                alert('Please input address!')
            }
            else if(validator.isEmpty(city)){
                alert('Please input city!')
            }
            else if(validator.isEmpty(state)){
                alert('Please input state!')
            }
            else if((!validator.equals(tel,""))&&(!validator.isMobilePhone(tel))){
                alert('Phone number is not valid!')
            }
        }
        else{
            if(res.statusCode === 200){
                res.sendFile(__dirname + "/reqlogin.html")
            }
            else 
        {
            res.sendFile(__dirname + "/fail.html")
        }
        }
})
})


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
},
    function(username, password, done) {
      User.findOne({ Email: username }, function(err, result) {
        return done(null, result);
            });
}))

app.get('/reqtask',(req,res)=>{
    if(req.session.sign)
    {
    res.sendFile(__dirname + "/reqtask.html")
    }
    else if(!req.session.sign){
    res.redirect('/')
    }
})

app.post('/',function (req,res) {
    var email=req.body.email;
    var pwd=req.body.password;
    
        User.findOne({Email:email},function (error,result) {
            if (result==null)
            {
                res.sendFile(__dirname + "/" + "fail.html" );
            }
            else
            {
                bcrypt.compare(pwd, result.Password).then(function(result) {
                    if(result==null)
                    {
                        res.sendFile(__dirname + "/" + "fail.html" );
                    }
                    else{
                        if(req.body.checkbox ==='on'){
                            passport.authenticate('local')(req,res, ()=>{
                                req.session.sign = true
                                res.redirect('/reqtask')
                            })
                        }
                        else{
                            res.sendFile(__dirname + "/reqtask.html")
                        }
                    }
                });
                
            }
        })

})

//resetpassword

app.post('/resetpwd',(req,res)=>{
    let NewPassword = req.body.newpassword;
    const ConfirmNewPassword = req.body.confirmnewpassword;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const phone = req.body.phone;
    if(NewPassword === ConfirmNewPassword){
        let hash = bcrypt.hashSync(NewPassword, salt)
        NewPassword = hash;
    }
            User.updateOne({"Email": email}, {"Password": NewPassword}, function (err, data) {
                if(err) 
                {
                    throw err;
                }
                if(data){
                    res.redirect('/');
                }
                else
                {
                    res.sendFile(__dirname + "/fail.html")
                }
            });
        })

        let port = process.env.PORT;
        if(port == null || port ==""){
            port = 8000;
        }
        
        app.listen(port,(req,res)=>{
            console.log("Server is running successfully")
        })

