import { WebStorage } from 'web-storage'
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
    it('should delete all items from storage based on namespace', async () => {
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
})
