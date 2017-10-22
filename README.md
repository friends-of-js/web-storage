## Usage

# Create storage instance
```js
import { WebStorage } from 'web-storage-api'
// or
const WebStorage = require('web-storage-api').WebStorage
```

Create instance for work with localStorage:
```js
const storage = new WebStorage(localStorage)
```

Create instance for work with sessionStorage. All data would be deleted when window closed.
```js
const storage = new WebStorage(sessionStorage)
```

Instance for working with MemoryStorage. All data would be deleted when window closed.
```js
import {WebStorage, MemoryStorage } from 'web-storage-api'
const storage = new WebStorage(new MemoryStorage())
```

WebStorage can be initialized with any object that implements Storage interface:
```typescript
interface Storage {
    readonly length: number;
    clear(): void;
    getItem(key: string): string | null;
    key(index: number): string | null;
    removeItem(key: string): void;
    setItem(key: string, data: string): void;
    [key: string]: any;
    [index: number]: string;
}
```

## Namespace support
When your create WebStorage instance, as second parameter your can pass namespace, and then you will work only with data in given namespace
```js
const storage = new WebStorage(localStorage, 'my-namespace')
```

## Api
```js
import { WebStorage } from 'web-storage-api'

const storage = new WebStorage(localStorage)

// Determine if storage have namespace.
storage.hasNamespace()

// Get storage namespace.
// If storage have not namespace, null would be returned
storage.namespace

// Get number of elements in storage.
// If storage have namespace, only length of items with this namespace would be return.
// If storage have not namespace, only number of items without namespace would be returned,
// not all items in localStorage
storage.length
```

### Asynchronous api
```js
import { WebStorage } from 'web-storage-api'

const storage = new WebStorage(localStorage)

// Get item by key
storage.get('yourkey')
// If no item with given key exists, 'default' would be returned
storage.get('anotherkey', 'default')

// Get key name by it`s index.
// The order of keys is user-agent defined, so you should not rely on it.
storage.key(0)

// Return Promise with array of storage keys.
// The order of keys is user-agent defined, so you should not rely on it.
storage.keys()

// Determine if item with given key exists in storage
storage.has('yourkey')

// Set item to storage. Item would be converted to json automatically and then saved
storage.set('yourkey', {key: 'value'})

// Delete item from storage
storage.delete('yourkey')

// Clear storage. If storage has namespace only keys with this namespace would be removed.
// If storage hasn`t namespace only keys without namespace would be removed
storage.clear()

// Your can asynchronous iterate over storage
for await (const [value, key] of storage) {
  // do something with key and value
}

// If your need only value for iteration:
for await (const [value] of storage) {
  // do something with key and value
}

// If your need only keys for iteration:
for await (const [, key] of storage) {
  // do something with key and value
}
```
### Synchronous api
```js
import { WebStorage } from 'web-storage-api'

const storage = new WebStorage(localStorage)
// Your can use namespace, it would be added to keys automatically
const storage = new WebStorage(localStorage, 'namespace')

// Set item to storage
storage.yourkey = { objectKey: 'value' } // or
storage['yourkey'] = { objectKey: 'value' }

// Get item from storage
const value = storage.yourkey // or
const value = storage['yourkey']

// Check if item exists in storage
const exists = 'yourkey' in storage

// Delete item from storage
delete storage.yourkey // or
delete storage['yourkey']

// Get keys from storage. Return array of keys
const keys = Object.getOwnPropertyNames(storage)

// Your can synchronous iterate over storage
for (const [value, key] of storage) {
  // do something with key and value
}

// If your need only value for iteration:
for (const [value] of storage) {
  // do something with key and value
}

// If your need only keys for iteration:
for (const [, key] of storage) {
  // do something with key and value
}
```
