const express = require('express');
const bcrypt = require('bcrypt');

const generateRandomString = function() {  // generates a randon string, I use this for both
  let shortUrl = '';                       // shortURL and id
  let string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    let place = string.charAt(Math.floor(Math.random() * (string.length - 1)));
    shortUrl += place;
  }
  return shortUrl;
};

const getUserByEmail = function(email, userData) {  //takes in email and user database
  let user = "";
  for (let shortKey in userData) {    // looping through each object
    let obj = userData[shortKey];
    if (obj['email'] === email) {  // compares emails
      user = shortKey;            // gets id which is the same as the key
    }
  }
  return user;                     // returns id
};

const urlsForUser = function(id, urlData) {  // checks if userID matches inside urlDatabase and returns
  let arr = [];                             // array of short urls
  for (let item in urlData) {
    let obj = urlData[item];
    if (obj['userID'] === id) {
      arr.push(item);
    }
  }
  return arr;
};

const checkPass = function(str, pass, users) {  // checks the password and returns true if pass match
  for (let userId in users) {
    let obj = users[userId];
    if (obj['email'] === str && bcrypt.compareSync(pass, obj['password'])) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkPass };