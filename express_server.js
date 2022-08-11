const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const PORT = 8080;
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const scanEmail = function(email, users) {
  for (const key in users) {
    if (email === users[key].email) {
      return true;
    };
  }
};

const passwordCheck = function(password, users) {
  for (const key in users) {
    if (password === users[key].password) {
      return true;
    };
  }
};

app.set('view engine', 'ejs');

const users = {
  userID: {
    id: 'userID',
    email: 'user@example.com',
    password: 'thisisapassword',
  },
  userID2: {
    id: 'userID2',
    email: 'user2@example.com',
    password: 'thisisstillapassword'
  },
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.post('/urls/:key/delete', (req, res) => {
  console.log('delete route key:', req.params.key);
  delete urlDatabase[req.params.key];
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const id = req.cookies['user_id']
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = { id, email, password };

  if (!scanEmail(email, users)) {
    res.status(403).send('No such email is registered.  Please register!');
    return;
  } else if (!passwordCheck(password, users)) {
    res.status(403).send('Email and/or password is incorrect, please try again!');
    return;
  } else {
    users[id] = user;
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortID] = longURL;
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post('/urls', (req, res) => {
  const id = generateRandomString();
  console.log(req.body, req.params); // Log the POST request body to the console
  urlDatabase[id] = req.body.longURL;
  res.redirect(`urls/${id}`);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const user = { id, email, password };

  if (email === '' || password === '') {
    res.status(400).send('Email and Password must be filled in');
    return;
  } else if (scanEmail(email, users)) {
    res.status(400).send('Email already exists, please log in');
    return;
  } else {
    users[id] = user;
  };
  res.cookie('user_id', id);
  console.log(users);
  res.redirect('/urls');
});

app.get('*', (req, res) => {
  res.status(404).send('This is not the page you are looking for');
}); // added this because I learned it in lecture and would like to test it!

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});