const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let shortUrl = '';
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++){
    let place = string.charAt(Math.floor(Math.random() * (string.length - 1)));
    shortUrl += place;
  }
  return shortUrl;
};

const checkEmail = function(str, users){
  for (let userId in users) {
    let obj = users[userId];
    if (obj['email'] === str) {
      return str;
    }
  }
  return "";
};

const checkPass = function(str, pass, users){
  for (let userId in users) {
    let obj = users[userId];
    if (obj['email'] === str && obj['password'] === pass) {
      return pass;
    }
  }
  return "";
};

let templateVars = {};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req,res) => {
  urlDatabase[generateRandomString()] = req.body['longURL'];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...s
  const shortUrl = req.params.shortURL;

  res.redirect(urlDatabase[shortUrl]);
});

app.post("/urls/:shortURL/edit", (req, res) => {  // edit -> to render urls_show
  templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {  // delete
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {  // delete
  urlDatabase[req.params.id] = req.body['longURL'];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let email = req.body['email'];
  let pass = req.body['password'];
  if (checkEmail(email, users) === email && checkPass(email, pass, users) === pass) {
    userId = email;
  } else {
    res.sendStatus(404);
    return;
  }
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let idObj = {};
  let user = generateRandomString();  
  idObj['id'] = user;
  idObj['email'] = req.body['email'];
  idObj['password'] = req.body['password'];
  if (req.body['email'] === "" || req.body['password'] === ""){
    res.sendStatus(404);
    return;
  }
  if (checkEmail(req.body['email'], users) === req.body['email']) {
    res.sendStatus(404);
    return;
  } else {
    users[user] = idObj;
  }
  if (checkEmail(req.cookies['user_id'], users)) {
    templateVars['user_id'] = req.cookies['user_id'];
  }
  res.cookie('user_id', idObj['email']);
  res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});