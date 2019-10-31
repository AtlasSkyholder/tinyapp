const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

  it('should return empty user if no email is found', function() {
    const user = getUserByEmail("the@the.com", testUsers);

    assert.equal(user, '');
  });

  it('should return fail when compare the empty user to a real userID', function() {
    const user = getUserByEmail("the@the.com", testUsers);
    const expectedOutput = "userRandomID";

    assert.notEqual(user, expectedOutput);
  });
});