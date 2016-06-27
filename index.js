'use strict'

const raml2obj = require('raml2obj')
const fetch = require('isomorphic-fetch')

// TODO use baseURL from RAML, replace with param if provided
const makeApi = (source, baseURL) => {
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

      // TODO use fetch opts
      fetchObj[route][method] = (body, opts) => new Promise((resolve, reject) => {
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

        for (let key in body) {
          // TODO handle more than just primitives
          // TODO handle nested objects
          if (typeof(body[key]) !== bodySchema[key]) {
            return reject(`Types for ${key} did not match, expected ${bodySchema[key]} but got ${typeof(body[key])}`)
          }
        }

        // RAML provides this but we need to be able to choose baseURL for development
        const completeURL = baseURL + route
        const fetchOpts = {}
        fetchOpts.method = method.toUpperCase()
        fetchOpts.headers = {}
        fetchOpts.headers['content-type'] = contentType
        fetchOpts.body = JSON.stringify(body)
        // TODO extend fetchOpts with user provided values
        // TODO hook into security schema to append Authorization: Bearer token

        const request = fetch(completeURL, fetchOpts)

        let status
        let responseSchema

        request
          .then((res) => {
            status = res.status
            const responses = endpoint.responses

            const expectedResponseBody = responses[status]

            if (expectedResponseBody === undefined) {
              // TODO test this
              // TODO enable escaping this reject with an option
              return reject('This response code is not documented')
            }

            // lol how these line up
            const expectedResponseContentType = Object.keys(expectedResponseBody.body)[0]
            const actualResponseContentTypeFull = res.headers._headers['content-type'][0]
            const actualResponseContentType = actualResponseContentTypeFull.split(';')[0]

            if (expectedResponseContentType !== actualResponseContentType) {
              // TODO test this, option to ignore
              reject('Expected a ' + expectedResponseContentType + 'content type, actually got ' + actualResponseContentType)
            }

            responseSchema = expectedResponseBody.body[expectedResponseContentType]

            // Use actual rather than expected content type. Options can enable/disable
            // reaching this point if expected and actual disagree.
            switch(actualResponseContentType) {
              case 'application/json':
                return res.json()
                break
              // TODO handle more
              default:
                return res.json()
            }
          })
          .then((payload) => {
            // TODO handle more/less
            for (let key in payload) {
              if (typeof(payload[key]) !== responseSchema[key]) {
                return reject(`Types for ${key} did not match, expected ${responseSchema[key]} but got ${typeof(payload[key])}`)
              }
            }

            resolve(payload)
          })
          .catch((err) => {
            return reject(err)
          })
      })
    }
  }

  return fetchObj
}

module.exports = makeApi
