export class MemoryStorage implements Storage {
  [index: string]: any
  private internalItems: Map<string, string>

  /**
   * Constructor that return Proxy for object access.
   * You can access stored items like this:
   * Get item: storage.anyKey or storage['anyKey']
   * Set item storage.anyKey = 'value' or storage.anyKey = 'value'
   * Check if item exists: ('anyKey' in storage)
   * Delete item: delete storage.anyKey or delete storage['anyKey']
   */
  public constructor (items: { [index: string]: string } = {}) {
    this.internalItems = new Map<string, string>(Object.entries(items))
    return this.createProxy()
  }

  public get length (): number {
    return this.internalItems.size
  }

  public get items (): Map<string, string> {
    return this.internalItems
  }

  /**
   * Clear memory storage.
   *
   * @return {void}
   */
  public clear (): void {
    this.internalItems.clear()
  }

  /**
   * Determine if storage has item with given key.
   *
   * @param {string} key
   * @return {boolean}
   */
  public hasItem (key: string): boolean {
    return this.internalItems.has(key)
  }

  /**
   * Get item from memory storage by key.
   *
   * @param {string} key
   * @return {string}
   */
  public getItem (key: string): string | null {
    if (this.internalItems.has(key)) {
      return this.internalItems.get(key) as string
    }

    return null
  }

  /**
   * Find key by index.
   *
   * @param {number} index
   * @return {string}
   */
  public key (index: number): string | null {
    return Array.from(this.internalItems.keys())[index] || null
  }

  /**
   * Delete item from memory storage.
   *
   * @param {string} key
   */
  public removeItem (key: string): void {
    this.internalItems.delete(key)
  }

  /**
   * Set item to memory storage.
   *
   * @param {string} key
   * @param {string} value
   */
  public setItem (key: string, value: string): void {
    this.internalItems.set(key, value)
  }

  /**
   * Proxy for object access.
   * @private
   *
   * @return {any}
   */
  private createProxy () {
    return new Proxy<MemoryStorage>(this, {
      get (target, key: string): string | null {
        if (!(key in target)) {
          return target.getItem(key)
        }

        return target[key]
      },
      set (target, key: string, data: string): boolean {
        if (!(key in target)) {
          target.setItem(key, data)
          return true
        } else {
          target[key] = data
          return true
        }
      },
      has (target, key: string): boolean {
        if (!(key in target)) {
          return target.hasItem(key)
        }

        return true
      },
      deleteProperty (target, key: string): boolean {
        if (!target.hasOwnProperty(key)) {
          target.removeItem(key)
        }

        return true
      }
    })
  }
}
