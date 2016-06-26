'use strict'

const raml2obj = require('raml2obj')
const fetch = require('isomorphic-fetch')

const makeApi = (source) => {
  const apiObj = raml2obj.parse(source, { logging: false })
  let fetchObj = {}

  // Each endpoint (route@method) becomes a Promise that
  // 1. Checks types of URI params and body to be correct
  // 2. Calls fetch with proper headers, method, body. Can pass in opts for this
  // 3. Checks response types match
  // 4. Resolves to response payload
  for (let route in apiObj) {
    fetchObj[route] = {}

    for (let method in apiObj[route].methods) {
      const endpoint = apiObj[route].methods[method]

      fetchObj[route][method] = (body) => new Promise((resolve, reject) => {
        const expectedBody = endpoint.body

        // Reject if they unnecesarily provided a body (e.g. for get)
        if (body !== undefined && expectedBody === undefined) {
          return reject('Unnecesarily provided a body')
        }
        // Reject if they did not provide a body
        if (body === undefined) {
          // TODO give body schema in error message
          return reject('Did not provide any body')
        }

        const contentType = Object.keys(expectedBody)[0]
        const bodySchema = expectedBody[contentType]

        // console.log('body: ', body)
        // console.log('bodySchema: ', bodySchema)

        for (let key in body) {
          // TODO handle more than just primitives
          // TODO handle nested objects
          if (typeof(body[key]) !== bodySchema[key]) {
            reject(`Types for ${key} did not match, expected ${bodySchema[key]} but got ${typeof(body[key])}`)
          }
        }

        resolve('DATUMS')
      })
    }
  }

  return fetchObj
}

module.exports = makeApi
