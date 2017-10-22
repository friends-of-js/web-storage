// Polyfill for Symbol.asyncIterator
if (!('asyncIterator' in Symbol)) {
  Object.defineProperty(Symbol, 'asyncIterator', {
    get () {
      return Symbol.for('Symbol.asyncIterator')
    }
  })
}
