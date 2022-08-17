const getUserByEmail = function(email, users) {
  for (const key in users) {
    if (email === users[key].email) {
      return users[key];
    }
  }
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 6);
};

const urlsForUser = function(id, urlDatabase) {
  const userURL = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };