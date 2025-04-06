import React, { useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useMutation,
  gql,
} from '@apollo/client';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

const GET_TODOS = gql`
  query GetTodos($filter: TodoFilter) {
    getTodos(filter: $filter) {
      id
      task
      completed
      priority
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($input: TodoInput!) {
    addTodo(input: $input) {
      id
      task
      completed
      priority
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;

function TodoList() {
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_TODOS, {
    variables: { filter },
  });
  const [addTodo] = useMutation(ADD_TODO);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);

  const handleAddTodo = async () => {
    if (!task.trim()) return;
    await addTodo({
      variables: {
        input: {
          task: task.trim(),
          priority,
        },
      },
    });
    setTask('');
    refetch();
  };

  const handleToggleTodo = async (id) => {
    await toggleTodo({ variables: { id } });
    refetch();
  };

  const handleDeleteTodo = async (id) => {
    await deleteTodo({ variables: { id } });
    refetch();
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h3" gutterBottom align="center" color="primary">
        GraphQL Todo App
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="New Task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleAddTodo}
            startIcon={<AddIcon />}
            sx={{ height: 56 }}
          >
            Add
          </Button>
        </Box>

        <Button
          startIcon={<FilterAltIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filter.completed || 'all'}
                onChange={(e) => handleFilterChange('completed', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value={false}>Active</MenuItem>
                <MenuItem value={true}>Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filter.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <List>
          {data?.getTodos?.map((todo) => (
            <ListItem
              key={todo.id}
              sx={{
                borderLeft: 4,
                borderColor: todo.priority === 'high' ? 'error.main' :
                           todo.priority === 'medium' ? 'warning.main' : 'success.main',
                mb: 1,
                bgcolor: todo.completed ? 'action.selected' : 'background.paper',
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteTodo(todo.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id)}
              />
              <ListItemText
                primary={todo.task}
                secondary={`Priority: ${todo.priority}`}
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? 'text.secondary' : 'text.primary',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <TodoList />
    </ApolloProvider>
  );
}