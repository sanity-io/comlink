import {describe, expect, it, vi} from 'vitest'
import {createActor} from 'xstate'
import {createNode, createNodeMachine} from '../node'
import type {Message} from '../types'

interface TestSends extends Message {
  type: 'test/send'
  data: {value: string}
  response: {result: string}
}

interface TestReceives extends Message {
  type: 'test/receive'
  data: {payload: string}
  response: undefined
}

describe('createNodeMachine', () => {
  it('creates a machine definition', () => {
    const machine = createNodeMachine<TestSends, TestReceives>()
    expect(machine).toBeDefined()
    expect(machine.id).toBe('node')
  })

  it('initializes context from input', () => {
    const machine = createNodeMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {name: 'test-node', connectTo: 'remote-node'},
    })
    actor.start()

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.name).toBe('test-node')
    expect(snapshot.context.connectTo).toBe('remote-node')
    expect(snapshot.context.domain).toBe('sanity/comlink')
    expect(snapshot.context.buffer).toEqual([])
    expect(snapshot.context.requests).toEqual([])
    expect(snapshot.context.channelId).toBeNull()

    actor.stop()
  })

  it('accepts a custom domain', () => {
    const machine = createNodeMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {name: 'test-node', connectTo: 'remote', domain: 'custom/domain'},
    })
    actor.start()

    expect(actor.getSnapshot().context.domain).toBe('custom/domain')

    actor.stop()
  })

  it('starts in idle state', () => {
    const machine = createNodeMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {name: 'test-node', connectTo: 'remote'},
    })
    actor.start()

    expect(actor.getSnapshot().value).toBe('idle')

    actor.stop()
  })
})

describe('createNode', () => {
  it('creates a node with the expected interface', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })

    expect(node).toHaveProperty('actor')
    expect(node).toHaveProperty('fetch')
    expect(node).toHaveProperty('machine')
    expect(node).toHaveProperty('on')
    expect(node).toHaveProperty('onStatus')
    expect(node).toHaveProperty('post')
    expect(node).toHaveProperty('start')
    expect(node).toHaveProperty('stop')

    expect(typeof node.fetch).toBe('function')
    expect(typeof node.on).toBe('function')
    expect(typeof node.onStatus).toBe('function')
    expect(typeof node.post).toBe('function')
    expect(typeof node.start).toBe('function')
    expect(typeof node.stop).toBe('function')
  })

  it('start returns a stop function', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })

    const stop = node.start()
    expect(typeof stop).toBe('function')
    stop()
  })

  it('accepts a custom machine', () => {
    const customMachine = createNodeMachine<TestSends, TestReceives>()
    const node = createNode<TestSends, TestReceives>(
      {name: 'test-node', connectTo: 'remote-node'},
      customMachine,
    )

    expect(node.machine).toBe(customMachine)
  })

  it('on returns an unsubscribe function', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })
    node.start()

    const handler = vi.fn()
    const unsub = node.on('test/receive', handler)
    expect(typeof unsub).toBe('function')

    unsub()
    node.stop()
  })

  it('onStatus receives status events', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })

    const statuses: string[] = []
    const unsub = node.onStatus((status) => statuses.push(status))

    node.start()
    // After starting, the actor transitions to idle and emits a status event
    expect(statuses).toContain('idle')

    unsub()
    node.stop()
  })

  it('onStatus filters by status when filter provided', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })

    const statuses: string[] = []
    const unsub = node.onStatus((status) => statuses.push(status), 'connected')

    node.start()
    // The handler should not receive 'idle' since we're filtering for 'connected'
    expect(statuses).not.toContain('idle')

    unsub()
    node.stop()
  })

  it('buffers post messages when in idle state', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })
    node.start()

    // Post a message while idle, which should buffer it
    node.post('test/send', {value: 'hello'})

    const snapshot = node.actor.getSnapshot()
    expect(snapshot.context.buffer).toHaveLength(1)
    expect(snapshot.context.buffer[0]!.data).toEqual({type: 'test/send', data: {value: 'hello'}})

    node.stop()
  })

  it('stop can be called safely', () => {
    const node = createNode<TestSends, TestReceives>({
      name: 'test-node',
      connectTo: 'remote-node',
    })
    node.start()
    expect(() => node.stop()).not.toThrow()
  })
})
