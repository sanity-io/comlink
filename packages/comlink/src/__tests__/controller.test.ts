import {describe, expect, it, vi} from 'vitest'
import {createController} from '../controller'
import type {Message} from '../types'

interface TestSends extends Message {
  type: 'test/send'
  data: {value: string}
  response: undefined
}

interface TestReceives extends Message {
  type: 'test/receive'
  data: {payload: string}
  response: {result: string}
}

describe('createController', () => {
  it('creates a controller with the expected interface', () => {
    const controller = createController({targetOrigin: '*'})

    expect(controller).toHaveProperty('addTarget')
    expect(controller).toHaveProperty('createChannel')
    expect(controller).toHaveProperty('destroy')
    expect(typeof controller.addTarget).toBe('function')
    expect(typeof controller.createChannel).toBe('function')
    expect(typeof controller.destroy).toBe('function')
  })

  it('createChannel returns a channel instance', () => {
    const controller = createController({targetOrigin: '*'})
    const channel = controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    expect(channel).toHaveProperty('on')
    expect(channel).toHaveProperty('onInternalEvent')
    expect(channel).toHaveProperty('onStatus')
    expect(channel).toHaveProperty('post')
    expect(channel).toHaveProperty('start')
    expect(channel).toHaveProperty('stop')

    expect(typeof channel.on).toBe('function')
    expect(typeof channel.onInternalEvent).toBe('function')
    expect(typeof channel.onStatus).toBe('function')
    expect(typeof channel.post).toBe('function')
    expect(typeof channel.start).toBe('function')
    expect(typeof channel.stop).toBe('function')

    controller.destroy()
  })

  it('channel start returns a stop function', () => {
    vi.useFakeTimers()

    const controller = createController({targetOrigin: '*'})
    const channel = controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    const stop = channel.start()
    expect(typeof stop).toBe('function')
    stop()

    vi.runAllTimers()
    vi.useRealTimers()

    controller.destroy()
  })

  it('addTarget returns a cleanup function when no targets exist', () => {
    vi.useFakeTimers()

    const controller = createController({targetOrigin: '*'})
    const mockTarget = {} as MessageEventSource

    const cleanup = controller.addTarget(mockTarget)
    expect(typeof cleanup).toBe('function')

    cleanup()

    vi.runAllTimers()
    vi.useRealTimers()

    controller.destroy()
  })

  it('addTarget returns noop when same target is added twice', () => {
    const controller = createController({targetOrigin: '*'})
    const mockTarget = {} as MessageEventSource

    controller.addTarget(mockTarget)
    const secondCleanup = controller.addTarget(mockTarget)

    // Should be a noop
    expect(typeof secondCleanup).toBe('function')
    secondCleanup()

    controller.destroy()
  })

  it('channel on returns an unsubscribe function', () => {
    const controller = createController({targetOrigin: '*'})
    const channel = controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    const handler = vi.fn()
    const unsub = channel.on('test/receive', handler)
    expect(typeof unsub).toBe('function')

    unsub()
    controller.destroy()
  })

  it('channel onStatus returns an unsubscribe function', () => {
    const controller = createController({targetOrigin: '*'})
    const channel = controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    const handler = vi.fn()
    const unsub = channel.onStatus(handler)
    expect(typeof unsub).toBe('function')

    unsub()
    controller.destroy()
  })

  it('channel onInternalEvent returns an unsubscribe function', () => {
    const controller = createController({targetOrigin: '*'})
    const channel = controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    const handler = vi.fn()
    const unsub = channel.onInternalEvent('buffer.added', handler)
    expect(typeof unsub).toBe('function')

    unsub()
    controller.destroy()
  })

  it('destroy can be called safely', () => {
    const controller = createController({targetOrigin: '*'})
    controller.createChannel<TestSends, TestReceives>({
      name: 'test-channel',
      connectTo: 'remote',
    })

    expect(() => controller.destroy()).not.toThrow()
  })

  it('destroy can be called multiple times', () => {
    const controller = createController({targetOrigin: '*'})

    expect(() => controller.destroy()).not.toThrow()
    expect(() => controller.destroy()).not.toThrow()
  })
})
