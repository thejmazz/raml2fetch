'use strict'

const path = require('path')
const raml2fetch = require('../..')

const api = raml2fetch(path.resolve(__dirname, 'todos.raml'))

console.log(api)

// for (let route in api) {
//   for (let method in api[route]) {
//     const endpoint = api[route][method]
//
//     console.log(method)
//
//     endpoint()
//       .then(data => console.log(data))
//       .catch(err => console.error(err))
//   }
// }

api['/todos'].post()
  .then(data => console.log(data))
  .catch(err => console.error(err))

api['/todos/all'].get()
  .then(data => console.log(data))
  .catch(err => console.error(err))

api['/todos/{id}'].get()
  .then(data => console.log(data))
  .catch(err => console.error(err))

api['/todos/{id}'].put()
  .then(data => console.log(data))
  .catch(err => console.error(err))

api['/todos/{id}'].delete()
  .then(data => console.log(data))
  .catch(err => console.error(err))


// console.log(JSON.stringify(api, null, 2))
