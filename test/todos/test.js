'use strict'

const path = require('path')
const raml2fetch = require('../..')
const assert = require('chai').assert

const ramlPath = path.resolve(__dirname, 'todos.raml')
console.log(ramlPath)

const api = raml2fetch(ramlPath)

console.log(api)

// api['/todos'].post()
// api['/todos/all'].get()
// api['/todos/{id}'].get()
// api['/todos/{id}'].put()
// api['/todos/{id}'].delete()

describe('raml2fetch', function() {
  describe('before fetch', function() {
    it('Should reject when a body is not provided', function(done) {
      api['/todos'].post()
        .catch(err => done())
    })

    it('Should reject when a body is unnecesarily provided', function(done) {
      api['/todos/all'].get({ foo: 'bar' })
        .catch(err => done())
    })

    it('Should reject if provided body does not match schema', function(done) {
      api['/todos'].post({ content: 42} )
        .then(() => done(new Error('Should not have resolved')))
        .catch(err => done())
    })

    it('Should pass schema', function(done) {
      api['/todos'].post({ content: 'Buy eggs' })
        .then(() => done())
        .catch(done)
    })

    // it('Should reject if url params do not match schema', function(done) {
    //   done(new Error('TODO'))
    // })
  })
})

// console.log(JSON.stringify(api, null, 2))
