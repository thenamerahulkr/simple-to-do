document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');
    const todoList = document.getElementById('todo-list');
    const tasksCounter = document.getElementById('tasks-counter');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const sortPriorityBtn = document.getElementById('sort-priority');
    
    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const editPriority = document.getElementById('edit-priority');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    // App State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentEditId = null;
    let sortByPriority = false;
    
    // Priority values for sorting
    const priorityValues = {
        'high': 3,
        'medium': 2,
        'low': 1
    };
    
    // Render todos and update counter
    function renderTodos() {
        todoList.innerHTML = '';
        
        // Sort todos if needed
        const sortedTodos = [...todos];
        if (sortByPriority) {
            sortedTodos.sort((a, b) => {
                return priorityValues[b.priority] - priorityValues[a.priority];
            });
        }
        
        sortedTodos.forEach((todo) => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item', `priority-${todo.priority}`);
            if (todo.completed) {
                todoItem.classList.add('completed');
            }
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <span class="todo-text">${todo.text}</span>
                    <span class="todo-priority priority-${todo.priority}">
                        ${capitalizeFirstLetter(todo.priority)} Priority
                    </span>
                </div>
                <div class="todo-actions">
                    <button class="action-btn edit-btn">Edit</button>
                    <button class="action-btn delete-btn">Delete</button>
                </div>
            `;
            
            todoItem.dataset.id = todo.id;
            todoList.appendChild(todoItem);
        });
        
        updateTasksCounter();
        saveTodos();
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Update tasks counter
    function updateTasksCounter() {
        const totalTasks = todos.length;
        const completedTasks = todos.filter(todo => todo.completed).length;
        
        tasksCounter.textContent = totalTasks === 1 
            ? '1 task' 
            : `${totalTasks} tasks`;
            
        if (completedTasks > 0) {
            tasksCounter.textContent += ` (${completedTasks} completed)`;
        }
    }
    
    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Add new todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const todoText = todoInput.value.trim();
        if (todoText === '') return;
        
        const newTodo = {
            id: generateId(),
            text: todoText,
            priority: prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(newTodo);
        
        todoInput.value = '';
        renderTodos();
    });
    
    // Handle todo item interactions
    todoList.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const todoId = todoItem.dataset.id;
        const todoIndex = todos.findIndex(todo => todo.id === todoId);
        
        if (todoIndex === -1) return;
        
        // Handle checkbox click
        if (e.target.classList.contains('todo-checkbox')) {
            todos[todoIndex].completed = e.target.checked;
            todoItem.classList.toggle('completed', e.target.checked);
            updateTasksCounter();
            saveTodos();
        }
        
        // Handle edit button click
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(todoId);
        }
        
        // Handle delete button click
        if (e.target.classList.contains('delete-btn')) {
            todos.splice(todoIndex, 1);
            renderTodos();
        }
    });
    
    // Open edit modal
    function openEditModal(todoId) {
        const todo = todos.find(todo => todo.id === todoId);
        if (!todo) return;
        
        currentEditId = todoId;
        editInput.value = todo.text;
        editPriority.value = todo.priority;
        
        editModal.classList.add('active');
    }
    
    // Save edited todo
    saveEditBtn.addEventListener('click', () => {
        if (!currentEditId) return;
        
        const todoIndex = todos.findIndex(todo => todo.id === currentEditId);
        if (todoIndex === -1) return;
        
        const newText = editInput.value.trim();
        if (newText === '') return;
        
        todos[todoIndex].text = newText;
        todos[todoIndex].priority = editPriority.value;
        
        closeEditModal();
        renderTodos();
    });
    
    // Close edit modal
    function closeEditModal() {
        editModal.classList.remove('active');
        currentEditId = null;
    }
    
    // Cancel edit
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Clear completed todos
    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        renderTodos();
    });
    
    // Sort by priority
    sortPriorityBtn.addEventListener('click', () => {
        sortByPriority = !sortByPriority;
        sortPriorityBtn.textContent = sortByPriority ? 'Sort by Date' : 'Sort by Priority';
        renderTodos();
    });
    
    // Initial render
    renderTodos();
});