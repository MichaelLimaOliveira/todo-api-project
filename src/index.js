const express = require('express');
const cors = require('cors');

const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((user) => user.username === username);

  if(!user) return res.status(404).json({error: "User not found!!"});

  req.user = user;

  return next();
}

function isTodoExists(id, user) {
  console.log(id);
  const todo = user.todos.find((todo) => todo.id === id);
  return todo;
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const cheksUserExistsInUsers = users.find((user) => user.username === username);

  if(cheksUserExistsInUsers) return res.status(400).json({error: "Username in use !!"});

  const user ={
    id: v4(),
    name,
    username,
    todos: []
  };

  users.push(user)

  return res.status(201).json(user);
  
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: v4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
 }; 

  user.todos.push(todo)

 return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = isTodoExists(id, user);
  if(!todo) return res.status(404).json({error: "todo not found"});

  todo.title = title;
  todo.deadline = new Date(deadline);
  

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todo = isTodoExists(id, user);
  if(!todo) return res.status(404).json({error: "todo not found"});

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  if(todoIndex === -1) return res.status(404).json({error: "todo not found"});

  user.todos.splice(todoIndex, 1);

  return res.status(204).json();
});

module.exports = app;