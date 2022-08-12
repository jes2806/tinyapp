const getUserByEmail = function(email, users) {
  for (const key in users) {
    if (email === users[key].email) {
      return users[key];
    }
  }
};

module.exports = getUserByEmail;