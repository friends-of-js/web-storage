export class WebStorage<V> implements Iterable<[V, string]>, AsyncIterable<[V, string]> {
  private storage: Storage
  private currentNamespace: string | null
  [index: string]: any

  /**
   * Constructor that return Proxy for object access.
   * You can access stored items like this:
   * Get item: storage.anyKey or storage['anyKey']
   * Set item storage.anyKey = 'value' or storage.anyKey = 'value'
   * Check if item exists: ('anyKey' in storage)
   * Delete item: delete storage.anyKey or delete storage['anyKey']
   * Storage keys: Object.getOwnPropertyNames(storage) or Object.keys(storage) returns keys only for instance namespace.
   *
   * @param {Storage} storage
   * @param {string} namespace
   */
  public constructor (storage: Storage, namespace?: string) {
    this.storage = storage
    this.currentNamespace = namespace || null

    return this.createProxy()
  }

  /**
   * Determine if current instance have namespace.
   *
   * @return {boolean}
   */
  public hasNamespace () {
    return this.namespace !== null
  }

  /**
   * Returns namespace of current storage instance.
   *
   * @return {string}
   */
  public get namespace (): string | null {
    return this.currentNamespace
  }

  /**
   * Get number of elements in storage. If namespace were passed when storage instance was created, return only
   * items with this namespace.
   *
   * @return {number}
   */
  public get length () {
    return this.getStorageKeys().length
  }

  /**
   * Get item from storage by it`s key, if no item with given key present, return defaultValue.
   *
   * @param {string} key
   * @param defaultValue
   * @return {Promise<any>}
   */
  public async get (key: string, defaultValue: any = undefined): Promise<V> {
    if (this.storage.getItem(this.keyWithNamespace(key)) !== null) {
      return JSON.parse(this.storage.getItem(this.keyWithNamespace(key)) as string)
    } else {
      return defaultValue
    }
  }

  /**
   * Get key by it`s index. The order of keys is user-agent defined, so you should not rely on it.
   *
   * @param {number} index
   * @return {Promise<any>}
   */
  public async key (index: number): Promise<string | null> {
    return this.getStorageKeys()[index]
  }

  /**
   * Get keys. The order of keys is user-agent defined, so you should not rely on it.
   *
   * @return {Promise<string[]>}
   */
  public async keys (): Promise<string[]> {
    return this.getStorageKeys()
  }

  /**
   * Determine if item with given key present in storage.
   *
   * @param {string} key
   * @return {Promise<any>}
   */
  public async has (key: string): Promise<boolean> {
    return this.storage.getItem(this.keyWithNamespace(key)) !== null
  }

  /**
   * Set item with given key to storage.
   *
   * @param {string} key
   * @param value
   * @return {Promise<WebStorage>}
   */
  public async set (key: string, value: any): Promise<boolean> {
    try {
      this.storage.setItem(this.keyWithNamespace(key), JSON.stringify(value))
      return true
    } catch (exception) {
      return false
    }
  }

  /**
   * Remove item with given key from storage.
   *
   * @param {string} key
   * @return {Promise<WebStorage>}
   */
  public async delete (key: string): Promise<boolean> {
    try {
      this.storage.removeItem(this.keyWithNamespace(key))
      return true
    } catch (exception) {
      return false
    }
  }

  /**
   * Clear storage.
   *
   * @return {Promise<WebStorage>}
   */
  public async clear (): Promise<void> {
    for (const key of this.getStorageKeys()) {
      this.storage.removeItem(this.keyWithNamespace(key))
    }
  }

  /**
   * Iterator.
   *
   * @return {Iterator<[V, string]>}
   */
  public * [Symbol.iterator] (): Iterator<[V, string]> {
    const keys = this.getStorageKeys()
    for (const key of keys) {
      yield [this[key], key]
    }
  }

  /**
   * Async iterator.
   * You should provide a polyfill for Symbol.asyncIterator:
   * if (!('asyncIterator' in Symbol)) {
   *   Object.defineProperty(Symbol, 'asyncIterator', {
   *     get () {
   *       return Symbol.for('Symbol.asyncIterator')
   *     }
   *   })
   * }
   *
   * @return {AsyncIterableIterator<[V, string]>}
   */
  public async * [Symbol.asyncIterator] (): AsyncIterableIterator<[V, string]> {
    const keys = this.getStorageKeys()
    for (const key of keys) {
      yield [this[key], key]
    }
  }

  /**
   * Return key with current namespace.
   * @private
   * @param {string} key
   *
   * @return {string}
   */
  private keyWithNamespace (key: string) {
    if (this.hasNamespace()) {
      return `${this.namespace}/${key}`
    }

    return key
  }

  /**
   * Returns storage keys only for storage instance namespace.
   * @private
   *
   * @return {string[]}
   */
  private getStorageKeys (): string[] {
    const keys = []
    for (let index = 0; index < this.storage.length; index++) {
      const key = this.storage.key(index) as string
      if (this.namespace !== null && key.startsWith(`${this.namespace}/`)) {
        const resultKey = key.substr(this.namespace.length + 1)
        keys.push(resultKey)
      } else if (this.namespace === null && !new RegExp('.+\\/.+').test(key)) {
        keys.push(key)
      }
    }

    return keys
  }

  /**
   * Return a proxy object for synchronous api.
   * @private
   *
   * @return {Proxy}
   */
  private createProxy () {
    return new Proxy<WebStorage<V>>(this, {
      get (target: WebStorage<V>, key: string | symbol): any {
        if (!(key in target) && (typeof key !== 'symbol')) {
          return JSON.parse(target.storage.getItem(target.keyWithNamespace(key)) as string)
        }

        return target[key]
      },
      set (target, key: string, data: any): boolean {
        if (!(key in target)) {
          target.storage.setItem(target.keyWithNamespace(key), JSON.stringify(data))
          return true
        } else {
          return (target[key] = data)
        }
      },
      has (target, key: string): boolean {
        if (!(key in target)) {
          return target.storage.getItem(target.keyWithNamespace(key)) !== null
        }

        return true
      },
      deleteProperty (target, key: string): boolean {
        if (!(key in target)) {
          target.storage.removeItem(target.keyWithNamespace(key))
        }

        return true
      },
      ownKeys (target): string[] {
        return target.getStorageKeys()
      }
    })
  }
}
