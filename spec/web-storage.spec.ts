import { WebStorage } from 'web-storage-api'
import { expect } from 'chai'

describe('WebStorage class', () => {

  let storage: WebStorage<any>
  let nsStorage: WebStorage<any>
  beforeEach(() => {
    localStorage.setItem('simpleKey', JSON.stringify('value'))
    localStorage.setItem('namespace/nsSimpleKey', JSON.stringify('namespace value'))
    localStorage.setItem('objectKey', JSON.stringify({ key: 'value' }))
    localStorage.setItem('namespace/nsObjectKey', JSON.stringify({ namespaceKey: 'namespace value' }))
    storage = new WebStorage<any>(localStorage)
    nsStorage = new WebStorage<any>(localStorage, 'namespace')
  })

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('constructor', () => {
    it('should create new instance of web storage', () => {
      expect(storage).to.be.instanceOf(WebStorage)
    })

    it('should get item by key in object style', () => {
      expect(storage.simpleKey).to.be.deep.equal('value')
      expect(storage.objectKey).to.be.deep.equal({ key: 'value' })
      expect(nsStorage.nsSimpleKey).to.be.deep.equal('namespace value')
      expect(nsStorage.nsObjectKey).to.be.deep.equal({ namespaceKey: 'namespace value' })
    })

    it('should set item in object style', () => {
      storage.testKey = 'test value'
      nsStorage.testKey = 'namespace test value'
      expect(storage.testKey).to.be.deep.equal('test value')
      expect(nsStorage.testKey).to.be.deep.equal('namespace test value')
    })

    it('should should replace existing property', () => {
      expect(storage.key).to.be.instanceOf(Function);
      (storage as any).key = 'test' as any
      expect(storage.key).to.be.deep.equal('test')
    })

    it('should return true if item exists in storage in object style', () => {
      expect('simpleKey' in storage).to.be.true
      expect('nsSimpleKey' in nsStorage).to.be.true
      expect('notExists' in storage).to.be.false
      expect('notExists' in nsStorage).to.be.false
      expect('get' in storage).to.be.true
    })

    it('should delete item in object style', () => {
      expect('simpleKey' in storage).to.be.true
      expect('nsSimpleKey' in nsStorage).to.be.true
      delete storage['simpleKey']
      delete nsStorage['nsSimpleKey']
      delete storage.get
      expect('simpleKey' in storage).to.be.false
      expect('nsSimpleKey' in nsStorage).to.be.false
      expect('get' in storage)
    })

    it('should return storage keys based on namespace', () => {
      expect(Object.getOwnPropertyNames(storage), 'storage').to.include.members(['simpleKey', 'objectKey'])
      expect(Object.getOwnPropertyNames(nsStorage), 'storage with namespace').to.include.members(['nsSimpleKey', 'nsObjectKey'])
    })
  })

  describe('namespace', () => {
    it('should return storage namespace', () => {
      expect(storage.namespace).to.be.null
      expect(nsStorage.namespace).to.be.deep.equal('namespace')
    })
  })

  describe('length', () => {
    it('should return storage length based on namespace', () => {
      expect(storage.length).to.be.deep.equal(2)
      storage['anotherKey'] = 'another value'
      expect(storage.length).to.be.deep.equal(3)
    })
  })

  describe('get()', () => {
    it('should get item from storage by key', async () => {
      expect(await storage.get('simpleKey')).to.be.deep.equal('value')
      expect(await storage.get('objectKey')).to.be.deep.equal({ key: 'value' })
      expect(await nsStorage.get('nsSimpleKey')).to.be.deep.equal('namespace value')
      expect(await nsStorage.get('nsObjectKey')).to.be.deep.equal({ namespaceKey: 'namespace value' })
    })

    it('should return default value if item with given key doesn`t exists', async () => {
      expect(await storage.get('notExists')).to.be.undefined
      expect(await storage.get('notExists', { key: 'value' })).to.be.deep.equal({ key: 'value' })
    })
  })

  describe('key()', () => {
    it('should return key name by it`s index', async () => {
      expect(await storage.key(0)).to.be.oneOf(['simpleKey', 'objectKey'])
    })
  })

  describe('keys()', () => {
    it('should return storage keys based on namespace', async () => {
      expect(await storage.keys()).to.include.members(['simpleKey', 'objectKey'])
      expect(await nsStorage.keys()).to.include.members(['nsSimpleKey', 'nsObjectKey'])
    })
  })

  describe('has()', () => {
    it('should return true if item with given keys exists in storage', async () => {
      expect(await storage.has('simpleKey')).to.be.true
      expect(await nsStorage.has('nsSimpleKey')).to.be.true
      expect(await storage.has('objectKey')).to.be.true
      expect(await nsStorage.has('nsObjectKey')).to.be.true

      expect(await storage.has('notExists')).to.be.false
      expect(await nsStorage.has('notExists')).to.be.false
    })
  })

  describe('set()', () => {
    it('should set item by key', async () => {
      expect(await storage.set('newKey', [1, 2, 3])).to.be.true
      expect(await storage.get('newKey')).to.be.deep.equal([1, 2, 3])
      expect(await nsStorage.set('nsNewKey', 'new value')).to.be.true
      expect(await nsStorage.get('nsNewKey')).to.be.deep.equal('new value')
    })

    it('should return false if storage space exhausted', async () => {
      let str: string = ''
      for (let i = 0; i < 1000000; i++) {
        str += 'test data '
      }
      expect(await storage.set('longValue', str)).to.be.false
    })
  })

  describe('delete()', () => {
    it('should delete item with given key from storage', async () => {
      expect(await storage.has('simpleKey')).to.be.true
      expect(await storage.delete('simpleKey')).to.be.true
      expect(await storage.has('simpleKey')).to.be.false

      expect(await nsStorage.has('nsSimpleKey')).to.be.true
      expect(await nsStorage.delete('nsSimpleKey')).to.be.true
      expect(await nsStorage.has('nsSimpleKey')).to.be.false
    })
  })

  describe('clear()', () => {
    it('should delete all item from storage based on namespace', async () => {
      expect(await storage.keys()).to.include.members(['simpleKey', 'objectKey'])
      await storage.clear()
      expect(await storage.keys()).to.be.deep.equal([])
    })
  })

  describe('hasNamespace()', () => {
    it('should return true if storage instance has namespace', () => {
      expect(storage.hasNamespace()).to.be.false
      expect(nsStorage.hasNamespace()).to.be.true
    })
  })

  describe('iterator', () => {
    it('should iterate over storage items', async () => {
      for (const [value, key] of storage) {
        expect(key).to.be.oneOf(['simpleKey', 'objectKey'])
        expect(value).to.be.deep.equal(await storage.get(key))
      }

      for (const [value, key] of nsStorage) {
        expect(key).to.be.oneOf(['nsSimpleKey', 'nsObjectKey'])
        expect(value).to.be.deep.equal(await nsStorage.get(key))
      }
    })
  })

  describe('async iterator', () => {
    it('should iterate over storage items using async iterator', async () => {
      for await (const [value, key] of storage) {
        expect(key).to.be.oneOf(['simpleKey', 'objectKey'])
        expect(value).to.be.deep.equal(await storage.get(key))
      }

      for await (const [value, key] of nsStorage) {
        expect(key).to.be.oneOf(['nsSimpleKey', 'nsObjectKey'])
        expect(value).to.be.deep.equal(await nsStorage.get(key))
      }
    })
  })

  /*describe('common api', () => {
    describe('length', () => {
      it('should return length of storage', () => {
        const api = new WebStorage(localStorage)
        const api2 = new WebStorage(localStorage, 'namespace')
        api.set('test1', 123)
        api.set('test2', 234)
        api2.set('test3', 345)
        assert.equal(2, api.length)
      })
    })

    describe('has namespace', () => {
      it('should return true if instance have namespace or false otherwise', () => {
        const api = new WebStorage(localStorage, 'namespace')
        const api2 = new WebStorage(localStorage)
        assert.isTrue(api.hasNamespace())
        assert.isFalse(api2.hasNamespace())
      })
    })

    describe('iterator', () => {
      it('should return iterator', async () => {
        const api = new WebStorage(localStorage)
        api.set('test1', 123)
        api.set('test2', 234)
        api.set('test3', 345)

        assert.isTrue(typeof api[Symbol.iterator] === 'function')

        const values = []
        for (const [val, _key] of api) {
          values.push(val)
        }

        assert.deepEqual([123, 234, 345], values.sort())
      })
    })
  })

  describe('synchronous api', () => {
    describe('set item', () => {
      it('should set new item to localStorage', () => {
        const api = new WebStorage(localStorage)
        const value = { val: 'firstValue', val2: 'secondValue' }
        api['testItem'] = value
        assert.deepEqual<Object>(
          JSON.parse(localStorage.getItem('testItem') as string),
          value
        )
      })
    })

    describe('get item', () => {
      it('should get item from localStorage', () => {
        const api = new WebStorage(localStorage)
        api['testItem'] = { val: 'firstValue', val2: 'secondValue' }
        assert.deepEqual(
          JSON.parse(localStorage.getItem('testItem') as string),
          api['testItem']
        )
      })
    })

    describe('has item', () => {
      it('should return true, if item set to localStorage', () => {
        const api = new WebStorage(localStorage)
        api['testItem'] = 'test value'
        assert.isTrue('testItem' in api)
      })
    })

    describe('delete item', () => {
      it('should delete item from localStorage', () => {
        const api = new WebStorage(localStorage)
        api['testItem'] = 'test value'
        assert.isTrue('testItem' in api)
        delete api['testItem']
        assert.isFalse('testItem' in api)
      })
    })

    describe('get own keys without namespace', () => {
      it('should return keys without namespace from localstorage', () => {
        const api = new WebStorage(localStorage)
        api['item1'] = 'value 1'
        api['item2'] = 'value 2'
        assert.deepEqual(['item1', 'item2'], Object.getOwnPropertyNames(api))
      })
    })

    describe('get own keys with namespace', () => {
      it('should return keys started with given namespace', () => {
        const api = new WebStorage(localStorage, 'namespace')
        api['item1'] = 'value 1'
        api['item2'] = 'value 2'
        const api2 = new WebStorage(localStorage, 'anotherNamespace')
        api2['item3'] = 'value 3'

        assert.deepEqual(
          ['item1', 'item2'],
          Object.getOwnPropertyNames(api).sort()
        )
      })
    })
  })

  describe('asynchronous api', () => {
    describe('return promise', () => {
      it('should return promise for asyncgronous api', () => {
        const api = new WebStorage(localStorage)
        assert.instanceOf(api.set('test1', 123), Promise)
        assert.instanceOf(api.has('test1'), Promise)
        assert.instanceOf(api.get('test1'), Promise)
        assert.instanceOf(api.key(0), Promise)
        assert.instanceOf(api.keys(), Promise)
        assert.instanceOf(api.clear(), Promise)
        assert.instanceOf(api.delete('test1'), Promise)
      })
    })
    describe('set item', () => {
      it('should set item to localStorage', async () => {
        const api = new WebStorage(localStorage, 'namespace')
        await api.set('test', 'test value')

        assert.equal(
          'test value',
          JSON.parse(localStorage.getItem('namespace/test') as string)
        )
      })
    })

    describe('get item', () => {
      it('should get item from localStorage', async () => {
        const api = new WebStorage(localStorage, 'namespace')
        localStorage.setItem('namespace/test', JSON.stringify(123))

        assert.equal(123, await api.get('test'))
      })
    })

    describe('has item', () => {
      it('should return true if instance has item with given key in localStorage, false otherwise', async () => {
        const api = new WebStorage(localStorage)
        const api2 = new WebStorage(localStorage, 'namespace')
        api.set('test1', 123)
        api2.set('test2', 234)

        assert.isTrue(await api.has('test1'))
        assert.isFalse(await api.has('test2'))
      })
    })

    describe('key', () => {
      it('should return key by index', async () => {
        const api = new WebStorage(localStorage)
        api.set('test', 123)

        assert.equal('test', await api.key(0))
      })
    })

    describe('keys', () => {
      it('should return all keys of instance with namespace', async () => {
        const api = new WebStorage(localStorage)
        const api2 = new WebStorage(localStorage, 'namespace')

        api.set('test1', 123)
        api.set('test2', 234)
        api2.set('test3', 345)
        api2.set('test4', 456)

        assert.deepEqual(['test1', 'test2'], (await api.keys()).sort())
        assert.deepEqual(['test3', 'test4'], (await api2.keys()).sort())
      })
    })

    describe('clear', () => {
      it('should delete only own keys by namespace', async () => {
        const api = new WebStorage(localStorage)
        const api2 = new WebStorage(localStorage, 'namespace')
        const api3 = new WebStorage(localStorage, 'another')
        api.set('test1', 123)
        api2.set('test2', 234)
        api3.set('test3', 456)

        await api.clear()
        await api2.clear()

        assert.isNull(localStorage.getItem('test1'))
        assert.isNull(localStorage.getItem('namespace/test2'))
        assert.equal<number>(
          JSON.parse(localStorage.getItem('another/test3') as string),
          456
        )
      })
    })

    describe('delete item', () => {
      it('should delete item from localStorage', async () => {
        const api = new WebStorage(localStorage)
        const api2 = new WebStorage(localStorage, 'namespace')

        api.set('test1', 123)
        api2.set('test1', 234)

        await api.delete('test1')

        assert.isNull(localStorage.getItem('test1'))
        assert.equal(
          JSON.parse(localStorage.getItem('namespace/test1') as string),
          234
        )
      })
    })
  })

  describe('memory storage', () => {
    it('should create instance of web storage based on memory storage', () => {
      const storage = new WebStorage(new MemoryStorage())
      storage.someKey = 'value'
      assert.equal(storage.someKey, 'value')
    })
  })*/
})
