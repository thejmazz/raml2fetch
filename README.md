# raml2fetch

![fetch](https://cloud.githubusercontent.com/assets/1270998/16381488/df1afb3c-3c4a-11e6-9aa2-218e11cb56e5.gif)

raml2fetch is an attempt *to make fetch happen*.

Given a [raml document](https://github.com/thejmazz/raml2fetch/blob/master/test/todos/todos.raml):

```yaml
#%RAML 1.0
title: todos

types:
  Todo:
    properties:
      content: string
      completed: boolean
      id: number
    example:
      content: "Make lunch"
      completed: true
      id: 2


/todos:
  post:
    body:
      application/json:
        properties:
          content: string
        example:
          content: "Buy eggs"
    responses:
      200:
        body:
          application/json:
            type: Todo
```

You provide it to raml2fetch, with an optional overwriting `baseURL`:

```js
const api = raml2fetch(path.resolve(__dirname, 'todos.raml'), BASE_URL)
```

Then `api` has an object for each route, with functions on each method. It will verify the body schema matches the RAML spec, check if the response code has an entry in RAML, and verify if the response body matches the its schema as well. Each of these can be configured by turning on *ignore-x* flags.

```js
// Will reject b/c no body provided
api['/todos'].post()

// Will reject b/c schema types do not match
api['/todos'].post({ content: 42} )

// Will work. Also checks response schema types
api['/todos'].post({ content: 'Buy eggs' })

// Will reject b/c no need for body with GET
api['/todos/all'].get({ foo: 'bar' })

// Will work. Verifies response schema is as expected
api['/todos/all'].get()
```



## Why

- keep API and front end in sync - changes in URI parameters or body schemas will have an immediate effect and notify front end developer of errors
- autogenerate an API for a given RAML document

## Todos

- URI parameters
- options

## License

MIT [http://jmazz.mit-license.org/](http://jmazz.mit-license.org/)
