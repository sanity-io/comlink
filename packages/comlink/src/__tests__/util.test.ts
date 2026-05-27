import {describe, expect, it} from 'vitest'
import {createPromiseWithResolvers} from '../util'

describe('createPromiseWithResolvers', () => {
  it('returns an object with promise, resolve, and reject', () => {
    const result = createPromiseWithResolvers()
    expect(result).toHaveProperty('promise')
    expect(result).toHaveProperty('resolve')
    expect(result).toHaveProperty('reject')
    expect(result.promise).toBeInstanceOf(Promise)
    expect(typeof result.resolve).toBe('function')
    expect(typeof result.reject).toBe('function')
  })

  it('resolves with the provided value', async () => {
    const {promise, resolve} = createPromiseWithResolvers<string>()
    resolve('test-value')
    await expect(promise).resolves.toBe('test-value')
  })

  it('rejects with the provided reason', async () => {
    const {promise, reject} = createPromiseWithResolvers<string>()
    reject(new Error('test-error'))
    await expect(promise).rejects.toThrow('test-error')
  })

  it('resolves with a complex object', async () => {
    const {promise, resolve} = createPromiseWithResolvers<{foo: string; bar: number}>()
    const value = {foo: 'hello', bar: 42}
    resolve(value)
    await expect(promise).resolves.toEqual(value)
  })

  it('resolves with undefined', async () => {
    const {promise, resolve} = createPromiseWithResolvers<undefined>()
    resolve(undefined)
    await expect(promise).resolves.toBeUndefined()
  })
})
