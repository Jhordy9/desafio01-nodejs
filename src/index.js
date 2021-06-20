const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { request } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return res.status(400).json({ error: "User not exist" });
  }

  req.user = user;

  return next();
}

function checkExistTodo(req, res, next) {
  const { id } = req.params;
  const { user } = req;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  req.todo = todo;

  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const checkUserExist = users.some(user => user.username === username);

  if (checkUserExist) {
    return res.status(400).json({ error: 'User exist' })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return res.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { title, deadline } = req.body;
  const { todo } = req;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { todo } = req;

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checkExistTodo, (req, res) => {
  const { todo, user } = req;

  user.todos.splice(todo, 1);

  return res.status(204).json(user.todos);
});

module.exports = app;