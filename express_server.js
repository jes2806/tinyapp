const cookieSession = require('cookie-session');
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
const helpers = require('./helpers.js')
const getUserByEmail = helpers.getUserByEmail;
const urlsForUser = helpers.urlsForUser;
const generateRandomString = helpers.generateRandomString;


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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'cookiesess',
  keys: ['secret key', 'different secret key']
}));

app.post('/urls/:key/delete', (req, res) => {
  const shortIDs = Object.keys(urlsForUser(req.session.userId, urlDatabase));
  if (!urlDatabase[req.params.key]) {
    res.send('You have entered an invalid id!');
    return;
  }
  if (!req.session.userId) {
    res.send('You must be logged in to do this!');
    return;
  }
  if (!shortIDs.includes(req.params.key)) {
    res.send('You do not have access to this shortned URL, please access your urls: <a href="/urls">here</a>');
    return;
  }
  delete urlDatabase[req.params.key];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const shortID = req.params.id;
  const longURL = req.body.longURL;
  const shortIDs = Object.keys(urlsForUser(req.session.userId, urlDatabase));
  if (!shortIDs.includes(req.params.id)) {
    res.send('You do not have access to this shortned URL, please access your urls: <a href="/urls">here</a>');
    return;
  }
  if (!urlDatabase[req.params.id]) {
    res.send('You have entered an invalid id!');
    return;
  }
  if (!req.session.userId) {
    res.send('You must be logged in to do this!');
    return;
  }
  urlDatabase[shortID] = { longURL, userID: req.session['userId'] };
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const id = req.session['userId'];
  if (!id) {
    res.send('You must login in order to view shortened URLS: <br> <a href= "/login">Login</a> <br><a href= "/register">Register</a>');
    return;
  } else {
    const templateVars = { urls: urlsForUser(id, urlDatabase), user: users[id] };
    res.render('urls_index', templateVars);
  }
});

app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

app.get('/urls/new', (req, res) => {
  if (!req.session.userId) {
    res.redirect('/login');
    return;
  }
  const templateVars = { urls: urlDatabase, user: users[req.session['userId']] };
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
    return;
  }
  const templateVars = { urls: urlDatabase, user: users[req.session['userId']] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    res.redirect('/urls');
    return;
  }
  const templateVars = { urls: urlDatabase, user: users[req.session['userId']] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  console.log(user);
  if (!getUserByEmail(email, users)) {
    res.status(403).send('No such email is registered.  Please register!');
    return;
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Email and/or password is incorrect, please try again!');
    return;
  }
  req.session.userId = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.get('/urls/:id', (req, res) => {
  if (!req.session.userId) {
    res.send('You must be <a href= "/login"> Logged in </a> in order to view this page.');
    return;
  }
  const shortIDs = Object.keys(urlsForUser(req.session.userId, urlDatabase));
  if (!shortIDs.includes(req.params.id)) {
    res.send('You do not have access to this shortned URL, please access your urls: <a href="/urls">here</a>');
    return;
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session["userId"]] };
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    return res.status(404).send('You have entered an invalid shortened URL');
  }
  res.redirect(longURL.longURL);
});

app.post('/urls', (req, res) => {
  if (!req.session.userId) {
    res.send('You must login in order to shorten URLS');
    return;
  }
  const id = generateRandomString();
  console.log(req.body, req.params); // Log the POST request body to the console
  urlDatabase[id] = { longURL: req.body.longURL, userID: req.session.userId };
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
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('Email already exists, please log in');
    return;
  } else {
    bcrypt.genSalt(10)
      .then((salt) => {
        return bcrypt.hash(password, salt);
      })
      .then((hash) => {
        users[id] = {
          id,
          email,
          password: hash
        };
        console.log(users);
        req.session.userId = id;
        res.redirect('/urls');

      });
  }
});

app.get('*', (req, res) => { 
  res.status(404).send('This is not the page you are looking for');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});