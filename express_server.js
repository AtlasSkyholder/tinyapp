const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');

const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const { getUserByEmail, generateRandomString, urlsForUser, checkPass } = require("./helpers.js");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['mangaisgreat']
}));

//////////////////////////////////
// URL and User Databases
//////////////////////////////////

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
};

let templateVars = {};

app.set("view engine", "ejs");

//////////////////////////////////
// renders the root page
//////////////////////////////////

app.get("/", (req, res) => {
  if(JSON.stringify(req.session) === "{}") {
    res.redirect("/login");
  }  else  {
    res.redirect("/urls");
  }
});

//////////////////////////////////
// renders the register page
//////////////////////////////////

app.get("/register", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("urls_register", templateVars);
});

//////////////////////////////////
// renders the main page
//////////////////////////////////

app.get("/urls", (req, res) => {
    templateVars = { urls: urlDatabase, user_id: req.session.user_id };
    res.render("urls_index", templateVars);
});

//////////////////////////////////
// renders create TinyURL page
//////////////////////////////////

app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

//////////////////////////////////
// renders the edit page
//////////////////////////////////

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    let obj = urlDatabase[req.params.shortURL];
    urlDatabase[req.params.shortURL] = {longURL: obj['longURL'], userID: req.session.user_id};
    templateVars = { urls: urlDatabase, shortURL: req.params.shortURL, longURL: obj['longURL'],  user_id: req.session.user_id};
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//////////////////////////////////
// renders the login page
//////////////////////////////////

app.get("/login", (req, res) => {
  templateVars = { urls: urlDatabase, user_id: req.session.user_id };
  res.render("urls_login", templateVars);
});

//////////////////////////////////////////////////////
//Updates the Database after creating a new TinyURL
//////////////////////////////////////////////////////


app.post("/urls", (req,res) => { // main page
  let urlObj = {};
  urlObj['longURL'] = req.body['longURL'];
  urlObj['userID'] = req.session.user_id;
  urlDatabase[generateRandomString()] = urlObj;
  res.redirect("/urls");
});

//////////////////////////////////////////
//This was to manually test the shortURL
//////////////////////////////////////////

app.get("/u/:shortURL", (req, res) => {  // sends us to the longURL
  // const longURL = ...s
  const shortUrl = req.params.shortURL;
  if(urlDatabase[shortUrl]){
    res.redirect(urlDatabase[shortUrl].longURL);
  } else {
    res.sendStatus(404);
  }
});

//////////////////////
//Go to Edit page
//////////////////////

app.post("/urls/:shortURL/edit", (req, res) => {  // edit -> to render urls_show
  let database = urlDatabase[req.params.shortURL];
  templateVars = { shortURL: req.params.shortURL, longURL: database['longURL'], user_id: req.session.user_id};
  res.render("urls_show", templateVars);
});

/////////////////////////////
// Delete
/////////////////////////////

app.post("/urls/:shortURL/delete", (req, res) => {  // delete
  let arrayOfUrls = urlsForUser(req.session.user_id, urlDatabase);  //creates the arr
  if (arrayOfUrls.length === 0) {   // if arr is empty, then the user is not logged in or has nothing stored in
    res.redirect("/login");  //redirect to log in
  } else {
    if (arrayOfUrls.indexOf(req.params.shortURL) > -1) {  // checks if the item to delete is inside the arr
      delete urlDatabase[req.params.shortURL];  // deletes if its in
    }
    res.redirect("/urls");  // redirects back to main page
  }
});

//////////////////////////////////////
//Update edited info into database
//////////////////////////////////////

app.post("/urls/:id", (req, res) => {  // edit
  let arrayOfUrls = urlsForUser(req.session.user_id, urlDatabase); //creates the arr
  if (arrayOfUrls.length === 0) {   // if arr is empty, then the user is not logged in or has nothing stored in
    res.redirect("/login");  //redirect to log in
  } else {
    let longUrl = req.body['longURL'];   // updates the database with new longURL
    urlDatabase[req.params.id] = {longURL: longUrl, userID: req.session.user_id};
    res.redirect("/urls");
  }
});

/////////////////////////
//Login
/////////////////////////

app.post("/login", (req, res) => {
  let email = req.body['email'];
  let pass = req.body['password'];
  let comparedUser = getUserByEmail(email, users);  //gets id from users
  let userObject = users[comparedUser];
  let userId;
  if (userObject === undefined) {     // if email is wrong, send 404
    res.sendStatus(404);
  }
  if (userObject['email'] === email && checkPass(email, pass, users)) { // email is right and pass are right
    userId = email;             // login, if either is wrong then send 404
  } else {
    res.sendStatus(404);
  }
  req.session.user_id = userId;
  res.redirect("/urls");
});

///////////////////////
//Logout
///////////////////////

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});

///////////////////////
//Register
///////////////////////

app.post("/register", (req, res) => {
  let idObj = {};
  let user = generateRandomString();  // generates a new userId
  idObj['id'] = user;
  idObj['email'] = req.body['email'];
  const password = req.body['password']; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  idObj['password'] = hashedPassword;
  if (req.body['email'] === "" || req.body['password'] === "") {   // checks if email or pass is empty
    res.sendStatus(404);
  }
  let compareE = getUserByEmail(req.body['email'], users); //gets id from users
  let obj = users[compareE];
  if (obj === undefined) {  // checks if emails already exist
    users[user] = idObj;
  } else if (obj['email'] === req.body['email']) {
    res.sendStatus(404);
    return;
  }
  req.session.user_id =  idObj['email'];  // when logging in through register, it creates a cookie
  res.redirect("/urls");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//////////////////////////////
// Server
//////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});