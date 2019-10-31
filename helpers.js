const express = require('express');

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

module.exports = { getUserByEmail };