import React from 'react';

function TodoItem({ todo, onToggle, onDelete }) {
  const handleToggle = () => {
    onToggle(todo.id, !todo.completed);
  };

  const handleDelete = () => {
    onDelete(todo.id);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      <div className="todo-content">
        <div className="todo-title">{todo.title}</div>
        {todo.description && (
          <div className="todo-description">{todo.description}</div>
        )}
      </div>
      <div className="todo-actions">
        <button onClick={handleDelete} className="delete-btn">
          Delete
        </button>
      </div>
    </li>
  );
}

export default TodoItem;