import { MemoryStorage } from 'web-storage-api'
import { expect } from 'chai'

describe('MemoryStorage class', () => {

  let storage: MemoryStorage
  let data: { someKey: string, anotherKey: string }
  beforeEach(() => {
    data = {
      someKey: 'some value',
      anotherKey: 'another value'
    }
    storage = new MemoryStorage(data)
  })

  describe('constructor', () => {
    it('should set items to instance', () => {
      expect(Array.from(storage.items)).to.be.deep.equal(Array.from(Object.entries(data)))
    })

    it('should get item by key in object style', () => {
      expect(storage['someKey']).to.be.equal('some value')
      expect(storage.someKey).to.be.equal('some value')
      expect(storage.key).to.be.instanceOf(Function)
    })

    it('should set item in object style', () => {
      const anotherStorage = new MemoryStorage()
      anotherStorage['anyKey'] = 'any value'
      expect(anotherStorage['anyKey']).to.be.equal('any value')
      anotherStorage.secondKey = 'second value'
      expect(anotherStorage.secondKey).to.be.equal('second value')
    })

    it('should replace existing property', () => {
      const anotherStorage = new MemoryStorage()
      expect(anotherStorage.key).to.be.instanceOf(Function)
      anotherStorage.key = 'test' as any
      expect(anotherStorage.key).to.be.equal('test')
    })

    it('should return true if item exists in storage in object style', () => {
      expect('someKey' in storage).to.be.true
      expect('notExist' in storage).to.be.false
      expect('key' in storage).to.be.true
    })

    it('should delete item in object style', () => {
      delete storage['anyKey']
      delete storage['someKey']
      expect(storage['anyKey']).to.be.null
      expect(storage['someKey']).to.be.null
    })
  })
  describe('setItem', () => {
    it('should set item to memory storage', () => {
      storage.setItem('testKey', 'testValue')
      expect(storage.testKey).to.be.equal('testValue')
    })
  })

  describe('getItem', () => {
    it('should return item by key', () => {
      expect(storage.getItem('someKey')).to.be.equal('some value')
    })
  })

  describe('clear', () => {
    it('should clear all items and set length to 0', () => {
      expect(storage.length).to.be.equal(2)
      storage.clear()
      expect(storage.length).to.be.equal(0)
      expect(Array.from(storage.items)).to.be.deep.equal([])
    })
  })

  describe('key', () => {
    it('should return key by index number', () => {
      expect(storage.key(0)).to.be.equal('someKey')
      expect(storage.key(1)).to.be.equal('anotherKey')
      expect(storage.key(10)).to.be.null
    })
  })

  describe('removeItem', () => {
    it('should remove item by key', () => {
      expect(storage.someKey).to.be.equal('some value')
      storage.removeItem('someKey')
      expect(storage.someKey).to.be.null
    })
  })
})
