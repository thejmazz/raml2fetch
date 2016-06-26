'use strict'

const raml2obj = require('raml2obj')
// const fetch = require('isomorphic-fetch')

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
        const bodySchema = endpoint.body

        // Reject if they did not provide a body
        if (body === undefined && bodySchema !== undefined) {
          // TODO give body schema in error message
          reject('Did not provide any body')
        }
        if (body !== undefined && bodySchema === undefined) {
          reject('Unnecesarily provided a body')
        }

        resolve('DATUMS')
      })
    }
  }

  return fetchObj
}

module.exports = makeApi
