# Frontend Instructions

## Overview
The frontend is a React application that provides a user interface for the TODO application. It's built with Webpack and uses modern React patterns.

## Architecture Guidelines

### File Structure
- `frontend/src/App.js`: Main application component with todo management logic
- `frontend/src/index.js`: React DOM rendering and app mounting
- `frontend/src/components/`: Reusable React components
- `frontend/webpack.config.js`: Build configuration
- `static/`: Built assets served by the backend

### Key Patterns to Follow

#### Component Structure
```jsx
// Use functional components with hooks
const ComponentName = () => {
    const [state, setState] = useState(initialValue);
    
    useEffect(() => {
        // Side effects
    }, [dependencies]);
    
    const handleEvent = () => {
        // Event handling
    };
    
    return (
        <div className="component-class">
            {/* JSX content */}
        </div>
    );
};
```

#### API Integration
```jsx
// Use fetch for API calls
const fetchTodos = async () => {
    try {
        const response = await fetch('/api/todos');
        const todos = await response.json();
        setTodos(todos);
    } catch (error) {
        setError('Failed to fetch todos');
    }
};

// POST request example
const createTodo = async (todoData) => {
    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todoData),
        });
        if (response.ok) {
            const newTodo = await response.json();
            setTodos([...todos, newTodo]);
        }
    } catch (error) {
        setError('Failed to create todo');
    }
};
```

#### State Management
```jsx
// Use useState for component state
const [todos, setTodos] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Use useEffect for data fetching
useEffect(() => {
    fetchTodos();
}, []); // Empty dependency array for mount-only effect
```

## CSS and Styling

### Existing CSS Classes
- `.app`: Main application container
- `.add-todo`: Form for adding new todos
- `.todo-list`: Container for todo items
- `.todo-item`: Individual todo item container
- `.todo-item.completed`: Completed todo styling
- `.todo-content`: Todo text content area
- `.todo-actions`: Button container for todo actions
- `.loading`: Loading state indicator
- `.error`: Error message styling
- `.empty-state`: Empty list message

### Styling Guidelines
- Use existing CSS class patterns
- Maintain consistent spacing and colors
- Follow the established design system
- Use flexbox for layout (already established)

## API Integration Patterns

### Endpoints Used
```javascript
// GET all todos
fetch('/api/todos')

// POST new todo
fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
})

// PUT update todo
fetch(`/api/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
})

// DELETE todo
fetch(`/api/todos/${id}`, { method: 'DELETE' })
```

### Data Types
```javascript
// Todo object structure
const todo = {
    id: "uuid-string",
    title: "Todo title",
    description: "Optional description or null",
    completed: false,
    created_at: "2024-01-01T12:00:00Z"
};
```

## Development Workflow

### Building and Testing
```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Production build (outputs to ../static/)
npm run build

# Verify build
cd .. && cargo run
# Visit http://localhost:3030
```

### Code Style
- Use const/let instead of var
- Prefer arrow functions for consistency
- Use template literals for string interpolation
- Handle async operations with try/catch

## Common Modifications

### Adding New Todo Fields
1. Update form inputs in `App.js`
2. Modify state management for new fields
3. Update API calls to include new data
4. Adjust styling as needed

### Adding New Components
1. Create component file in `src/components/`
2. Export component from file
3. Import and use in `App.js` or other components
4. Add necessary CSS classes

### Modifying Styles
1. Update embedded CSS in `static/index.html`
2. Follow existing class naming patterns
3. Test responsiveness and accessibility
4. Rebuild with `npm run build`

## Build Configuration

### Webpack Setup
- Entry point: `src/index.js`
- Output: `../static/bundle.js`
- Babel transpilation for ES6+ and JSX
- CSS loading and processing
- HTML plugin for template generation

### Environment Variables
The build process doesn't currently use environment variables, but API calls use relative paths (`/api/todos`) which work with the backend server.

## Debugging Tips

### Common Issues
- **API errors**: Check browser network tab for failed requests
- **Build errors**: Check terminal output for Webpack errors
- **Runtime errors**: Use browser developer console
- **Styling issues**: Inspect elements in browser dev tools

### Development Mode
```bash
# Run in development with hot reload
cd frontend
npm run dev
# Visit http://localhost:8080 (frontend only)

# For full-stack development:
# Terminal 1: npm run dev (frontend)
# Terminal 2: cargo run (backend)
```

## Performance Considerations
- Use React's built-in optimizations (useState, useEffect)
- Avoid unnecessary re-renders
- Keep API calls efficient
- Use loading states for better UX