const express = require("express");
const app = express();
const PORT = 8080;
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get(`/u/:id`, (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  console.log(req.body, req.params); // Log the POST request body to the console
  urlDatabase[id] = req.body.longURL;
  res.redirect(`urls/${id}`);
});

app.get("*", (req, res) => {
  res.status(404).send("This is not the page you are looking for");
}); // added this because I learned it in lecture and would like to test it!

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});