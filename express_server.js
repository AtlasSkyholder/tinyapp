const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW"}
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

const urlsForUser = function(id, urlData){  // checks if userID matches inside urlDatabase and returns
  let arr = [];                             // array of short urls
  for (let item in urlData) {
    let obj = urlData[item];
    console.log(typeof id); // checking type
    console.log(typeof obj['userID']);  //checking type
    console.log(id);
    console.log(obj['userID']);
    if (obj['userID'] == id) {
      arr.push(item);
    }
  }
  return arr;
};

let templateVars = {};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let obj = urlDatabase[req.params.shortURL];
  urlDatabase[req.params.shortURL] = {longURL: obj['longURL'], userID: req.cookies['user_id']};
  templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: obj['longURL'],  user_id: req.cookies['user_id']};
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.cookies['user_id'] };
  res.render("urls_login", templateVars);
});

app.post("/urls", (req,res) => { // main page
  let urlObj = {};
  urlObj['longURL'] = req.body['longURL'];
  urlObj['userID'] = req.cookies['user_id'];
  urlDatabase[generateRandomString()] = urlObj;
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {  // sends us to the longURL
  // const longURL = ...s
  const shortUrl = req.params.shortURL;

  res.redirect(urlDatabase[shortUrl]);
});

app.post("/urls/:shortURL/edit", (req, res) => {  // edit -> to render urls_show
  let obj = urlDatabase[req.params.shortURL]; 
  templateVars = { shortURL: req.params.shortURL, longURL: obj['longURL'], user_id: req.cookies['user_id']};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {  // delete
  let newArr = urlsForUser(req.cookies['user_id'], urlDatabase);  //creates the arr
  if (newArr.length === 0) {   // if arr is empty, then the user is not logged in or has nothing stored in
    res.redirect("/login");  //redirect to log in
  } else {
    if (newArr.indexOf(req.params.shortURL) > -1) {  // checks if the item to delete is inside the arr
      delete urlDatabase[req.params.shortURL];  // deletes if its in
    }
    res.redirect("/urls");  // redirects back to main page
  }
});

app.post("/urls/:id", (req, res) => {  // edit
  let newArr = urlsForUser(req.cookies['user_id'], urlDatabase);  //creates the arr
  if (newArr.length === 0) {   // if arr is empty, then the user is not logged in or has nothing stored in
    res.redirect("/login");  //redirect to log in
  } else {
    let obj = urlDatabase[req.params.id];   // updates the database with new longURL
    urlDatabase[req.params.id] = {longURL: obj['longURL'], userID: req.cookies['user_id']};
    res.redirect("/urls");
  }
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