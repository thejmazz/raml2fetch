'use strict'

const koa = require('koa')
const router = require('koa-router')()
const cors = require('kcors')
const bodyParser = require('koa-bodyparser')
const morgan = require('koa-morgan')

const PORT = process.env.NODE_PORT || 3000

// === DATABASE ===
let todos = [{
  content: 'Buy eggs',
  completed: false,
  id: 0
}, {
  content: 'Make lunch',
  completed: false,
  id: 1
}]
let id = 2

// === ROUTING ===
router.post('/todos', function * () {
  let todo = {
    content: this.request.body.content,
    completed: false,
    id: id
  }

  todos.push(todo)

  id++

  this.body = todo
})

router.get('/todos/all', function * () {
  this.body = todos
})

router.get('/todos/:id', function * () {
  const id = parseInt(this.params.id)

  todos.forEach((todo) => {
    if (todo.id === id) this.body = todos[id]
  })
})

router.put('/todos/:id', function * () {
  const id = parseInt(this.params.id)

  todos.forEach((todo) => {
    if (todo.id === id) {
      todo.completed = this.request.body.completed

      this.body = todo
    }
  })
})

router.delete('/todos/:id', function * () {
  const deleteTodo = (id) => {
    const newTodos = []

    todos.forEach((todo) => {
      console.log(todo)
      if (todo.id !== id) {
        newTodos.push(todo)
      }
    })

    return newTodos
  }

  todos = deleteTodo(parseInt(this.params.id))

  this.body = {
    success: true,
    message: `Deleted todo with id ${this.params.id}`
  }
})

// === MIDDLEWARE ===
const app = koa()
app.use(cors())
app.use(morgan.middleware('dev'))
app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(PORT)
console.log(`Koa server listening on port ${PORT}`)
