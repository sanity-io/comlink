import {describe, expect, it, vi} from 'vitest'
import {createActor} from 'xstate'
import {cleanupConnection, createConnection, createConnectionMachine} from '../connection'
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

describe('createConnectionMachine', () => {
  it('creates a machine definition', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    expect(machine).toBeDefined()
    expect(machine.id).toBe('connection')
  })

  it('initializes context from input', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {
        name: 'test-connection',
        connectTo: 'remote-node',
        targetOrigin: '*',
      },
    })
    actor.start()

    const snapshot = actor.getSnapshot()
    expect(snapshot.context.name).toBe('test-connection')
    expect(snapshot.context.connectTo).toBe('remote-node')
    expect(snapshot.context.domain).toBe('sanity/comlink')
    expect(snapshot.context.targetOrigin).toBe('*')
    expect(snapshot.context.buffer).toEqual([])
    expect(snapshot.context.requests).toEqual([])
    expect(snapshot.context.heartbeat).toBe(false)

    actor.stop()
  })

  it('accepts a custom domain', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {
        name: 'test',
        connectTo: 'remote',
        targetOrigin: '*',
        domain: 'custom/domain',
      },
    })
    actor.start()

    expect(actor.getSnapshot().context.domain).toBe('custom/domain')

    actor.stop()
  })

  it('starts in idle state', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {
        name: 'test',
        connectTo: 'remote',
        targetOrigin: '*',
      },
    })
    actor.start()

    expect(actor.getSnapshot().value).toBe('idle')

    actor.stop()
  })

  it('uses provided id or generates one', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {
        name: 'test',
        connectTo: 'remote',
        targetOrigin: '*',
        id: 'custom-id',
      },
    })
    actor.start()

    expect(actor.getSnapshot().context.id).toBe('custom-id')

    actor.stop()
  })

  it('enables heartbeat when configured', () => {
    const machine = createConnectionMachine<TestSends, TestReceives>()
    const actor = createActor(machine, {
      input: {
        name: 'test',
        connectTo: 'remote',
        targetOrigin: '*',
        heartbeat: true,
      },
    })
    actor.start()

    expect(actor.getSnapshot().context.heartbeat).toBe(true)

    actor.stop()
  })
})

describe('createConnection', () => {
  it('creates a connection with the expected interface', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test-connection',
      connectTo: 'remote-node',
      targetOrigin: '*',
    })

    expect(connection).toHaveProperty('actor')
    expect(connection).toHaveProperty('connect')
    expect(connection).toHaveProperty('disconnect')
    expect(connection).toHaveProperty('id')
    expect(connection).toHaveProperty('name')
    expect(connection).toHaveProperty('machine')
    expect(connection).toHaveProperty('on')
    expect(connection).toHaveProperty('onStatus')
    expect(connection).toHaveProperty('post')
    expect(connection).toHaveProperty('setTarget')
    expect(connection).toHaveProperty('start')
    expect(connection).toHaveProperty('stop')

    expect(connection.name).toBe('test-connection')
    expect(typeof connection.connect).toBe('function')
    expect(typeof connection.disconnect).toBe('function')
    expect(typeof connection.on).toBe('function')
    expect(typeof connection.onStatus).toBe('function')
    expect(typeof connection.post).toBe('function')
    expect(typeof connection.setTarget).toBe('function')
    expect(typeof connection.start).toBe('function')
    expect(typeof connection.stop).toBe('function')
  })

  it('uses provided id', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
      id: 'custom-id',
    })

    expect(connection.id).toBe('custom-id')
  })

  it('generates id from name when not provided', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })

    expect(connection.id).toMatch(/^test-/)
  })

  it('start returns a stop function', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })

    const stop = connection.start()
    expect(typeof stop).toBe('function')
    stop()
  })

  it('on returns an unsubscribe function', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })
    connection.start()

    const handler = vi.fn()
    const unsub = connection.on('test/receive', handler)
    expect(typeof unsub).toBe('function')

    unsub()
    connection.stop()
  })

  it('onStatus emits idle on start', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })

    const statuses: string[] = []
    connection.onStatus((status) => statuses.push(status))
    connection.start()

    expect(statuses).toContain('idle')
    connection.stop()
  })

  it('onStatus filters by status', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })

    const statuses: string[] = []
    connection.onStatus((status) => statuses.push(status), 'connected')
    connection.start()

    // Should not include 'idle' since we're filtering for 'connected'
    expect(statuses).not.toContain('idle')
    connection.stop()
  })

  it('buffers post messages when in idle state', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })
    connection.start()

    connection.post('test/send', {value: 'hello'})

    const snapshot = connection.actor.getSnapshot()
    expect(snapshot.context.buffer).toHaveLength(1)
    connection.stop()
  })

  it('accepts a custom machine', () => {
    const customMachine = createConnectionMachine<TestSends, TestReceives>()
    const connection = createConnection<TestSends, TestReceives>(
      {name: 'test', connectTo: 'remote', targetOrigin: '*'},
      customMachine,
    )

    expect(connection.machine).toBe(customMachine)
  })

  it('target getter returns undefined initially', () => {
    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })
    connection.start()

    expect(connection.target).toBeUndefined()
    connection.stop()
  })
})

describe('cleanupConnection', () => {
  it('calls disconnect and schedules stop', () => {
    vi.useFakeTimers()

    const connection = createConnection<TestSends, TestReceives>({
      name: 'test',
      connectTo: 'remote',
      targetOrigin: '*',
    })
    connection.start()

    const stopSpy = vi.spyOn(connection, 'stop')
    const disconnectSpy = vi.spyOn(connection, 'disconnect')

    cleanupConnection(connection)

    expect(disconnectSpy).toHaveBeenCalled()
    expect(stopSpy).not.toHaveBeenCalled()

    vi.runAllTimers()
    expect(stopSpy).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
