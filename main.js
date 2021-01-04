class Todo {
    constructor (description, deadline) {
        this.description = description
        this.deadline = Todo.getDeadlineDate(deadline)
        this.completed = false
    }

    static getDeadlineDate(deadline) {
        if (!deadline)
        return ''

        return new Date(deadline).toLocaleString("lt-LT",
            {
                timeZone: 'Europe/Vilnius',
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
    }

    static getCurrentDate() {
        return new Date().toLocaleString("lt-LT", {timeZone: 'Europe/Vilnius'})
    }
}

class Store {
    static getTodos() {
        let todos = [];

        if (sessionStorage.getItem('todos') !== null)
            todos = JSON.parse(sessionStorage.getItem('todos'))

        return todos
    }

    static addTodo(todo) {
        const todos = Store.getTodos()
        todos.push(todo)
        sessionStorage.setItem('todos', JSON.stringify(todos))
    }

    static deleteTodo(elem) {
        const todos = Store.getTodos()

        todos.forEach((todo, index) => {
            if (todo.description === elem.name)
                todos.splice(index, 1)
        })

        sessionStorage.setItem('todos', JSON.stringify(todos))
        UI.displayTodos()
    }

    static todoExist(description) {
        const todos = Store.getTodos()
        let exist = false

        todos.forEach((todo, index) => {
            if (todo.description === description)
                exist = true
        })

        return exist
    }

    static toggleCompleted(elem) {
        const todos = Store.getTodos()

        todos.forEach((todo, index) => {
            if (todo.description === elem.name)
                if (todos[index].completed)
                    todos[index].completed = false
                else
                    todos[index].completed = Todo.getCurrentDate()
        })

        sessionStorage.setItem('todos', JSON.stringify(todos))
        UI.displayTodos()
    }
}

class UI {
    static displayTodos() {
        const todos = Store.getTodos()
        UI.sortTodos(todos)
        UI.clearTodos()
        todos.forEach(todo => UI.addTodoToList(todo))
    }

    static clearTodos() {
        document.querySelector('#todo-list').innerHTML = ''
    }

    static sortTodos(todos) {
        // Sort items in ascending order by time left till deadline
        todos.sort((a, b) => {
            if (UI.getTimeLeftTillDeadline(a.deadline) < UI.getTimeLeftTillDeadline(b.deadline))
                return -1
        })
    
        // Sort items that do not have deadline to the list's end
        todos.sort((a, b) => {
            if (b.deadline === "")
                return -1
        })

        // Sort items that have been completed to the list's end
        todos.sort((a, b) => {
            if (b.completed)
                return -1
        })

        // Sort completed items in ascending order by time they have been completed
        todos.sort((a, b) => {
            if (a.completed > b.completed)
                return -1
        })

        return todos
    }

    static getTimeLeftTillDeadline(deadline) {
        if (!deadline)
            return ''
    
        let seconds = (new Date(deadline) - new Date()) / 1000
        let days, hours, minutes
        
        if (seconds < 0) {
            return 'Time ended'
        } else {
            days = Math.floor(seconds / (60*60*24))
            seconds -= days * 60 * 60 * 24
            hours = Math.floor(seconds / (60*60)) % 24
            seconds -= hours * 60 * 60
            minutes = Math.floor(seconds / 60) % 60
        }
    
        return `Time left: ${days} days ${hours} hours ${minutes} minutes`
    }

    static addTodoToList(todo) {
        const list = document.querySelector('#todo-list')
        const row = document.createElement('tr')

        row.innerHTML = `
            <td><input type='checkbox' class='check' name='${todo.description}' ${todo.completed ? 'checked' : ''}></td>
            <td class='${todo.completed ? 'completed' : ''}'>${todo.description}</td>
            <td class='${todo.completed ? 'completed' : ''}'>${UI.getTimeLeftTillDeadline(todo.deadline)}</td>
            <td><a href='#' class='delete' name='${todo.description}'>Delete</a></td>
        `

        list.appendChild(row)
    }

    static showAlert(message, className) {
        const div = document.createElement('div')
        div.className = `alert alert-${className}`
        div.appendChild(document.createTextNode(message))
        const formSection = document.querySelector('#form-section')
        const form = document.querySelector('#todo-form')
        formSection.insertBefore(div, form)

        setTimeout(() => {
            document.querySelector('.alert').remove()
        }, 3000);
    }

    static clearForm() {
        document.querySelector('#todo-form').reset()
    }
}

document.addEventListener('DOMContentLoaded', UI.displayTodos)

document.querySelector('#todo-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const description = document.querySelector('#todo-description').value
    const deadline = document.querySelector('#todo-deadline').value

    if (description === '')
        return UI.showAlert('Description is required', 'danger')

    if (Store.todoExist(description))
        return UI.showAlert('To-do item with same description already exists', 'danger')

    const todo = new Todo(description, deadline)

    Store.addTodo(todo)
    UI.displayTodos()
    UI.showAlert('To-do item was added', 'success')
    UI.clearForm()
})

document.querySelector('#todo-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        if (confirm("Are you sure you want to delete this to-do item?")) {
            Store.deleteTodo(e.target)
            UI.showAlert('To-do item was deleted', 'success')
        }
    }

    if (e.target.classList.contains('check'))
        Store.toggleCompleted(e.target)
})