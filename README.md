# react-offline-first-helpers

React Hooks to make it easy to add local caching with background sync to any app

[![NPM](https://img.shields.io/npm/v/react-offline-first-helpers.svg)](https://www.npmjs.com/package/react-offline-first-helpers) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-offline-first-helpers
```

## Usage

```tsx
import React from 'react'

import { useCachedUpdater, useSubscribedGetter } from 'react-offline-first-helpers'

// This could be any function that makes an API request to fetch some data
async function getTodos () {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos')
  return await response.json()
}

// Separately, you will have a function that updates the same set of data
async function createTodo (data) {
  await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  })
}

function OfflineFirstTodos({ currentUserId }) {
  const [
    createTodoWrapped,
    syncingTodos,
    updateSyncingTodos
  ] = useCachedUpdater(
    createTodo,
    {
      initialCacheValue: [],
      onFunctionCall: (cache, todo) => {
        const newCache = [ ...cache, todo ]
        return newCache
      }
    }
  )

  const persistedTodos = useSubscribedGetter(getTodos, {
    initialValue: [],
    onUpdate: newPersistedTodos => {
      const persistedIDs = newPersistedTodos.map(todo => todo.id)
      const newSyncingTodos = syncingTodos.filter(todo => persistedIDs.includes(todo.id))
      updateSyncingTodos(newSyncingTodos)
    }
  })

  return (
    <>
      <form onSubmit={e => {
        e.preventDefault()
        const { title, body } = e.target.elements
        createTodoWrapped({
          title: title.value,
          body: body.value,
          userId: currentUserId,
        })
        title.value = ''
        body.value = ''
        title.focus()
      }}>
        <input id="title" />
        <input id="body" />
      </form>

      {persistedTodos.map(todo => (
        <p key={todo.id}>{todo.title}: {todo.body}</p>
      ))}

      {syncingTodos.map(todo => (
        <p key={todo.id} style={{color: 'gray'}}>{todo.title}: {todo.body}</p>
      ))}
    </>
  )
}
```

## License

MIT © [chadoh](https://github.com/chadoh)
