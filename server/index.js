const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');

let todos = [
  { id: '1', task: 'Coding', completed: false, priority: 'high' },
  { id: '2', task: 'Assignments', completed: false, priority: 'medium' },
  { id: '3', task: 'Trekking', completed: true, priority: 'low' },
];

const schema = buildSchema(`
  enum Priority {
    high
    medium
    low
  }

  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: Priority!
  }

  input TodoInput {
    task: String!
    priority: Priority = medium
  }

  input TodoFilter {
    completed: Boolean
    priority: Priority
  }

  type Query {
    getTodos(filter: TodoFilter): [Todo]
  }

  type Mutation {
    addTodo(input: TodoInput!): Todo
    deleteTodo(id: ID!): Boolean
    toggleTodo(id: ID!): Todo
  }
`);

const root = {
  getTodos: ({ filter = {} }) => {
    if (Object.keys(filter).length === 0) return todos;
    return todos.filter(todo => {
      let matches = true;
      if (filter.completed !== undefined) {
        matches = matches && todo.completed === filter.completed;
      }
      if (filter.priority !== undefined) {
        matches = matches && todo.priority === filter.priority;
      }
      return matches;
    });
  },
  addTodo: ({ input }) => {
    const newTodo = {
      id: Date.now().toString(),
      task: input.task,
      completed: false,
      priority: input.priority,
    };
    todos.push(newTodo);
    return newTodo;
  },
  deleteTodo: ({ id }) => {
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== id);
    return todos.length !== initialLength;
  },
  toggleTodo: ({ id }) => {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) throw new Error('Todo not found');
    todo.completed = !todo.completed;
    return todo;
  },
};

const app = express();
app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/graphql`);
});