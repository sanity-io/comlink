import {describe, expect, it} from 'vitest'
import {eventToMessage, listenFilter, listenInputFromContext} from '../common'
import type {ListenInput, ProtocolMessage} from '../types'

const createMessageEvent = (
  data: Partial<ProtocolMessage>,
  source?: MessageEventSource | null,
): MessageEvent<ProtocolMessage> => {
  const fullData: ProtocolMessage = {
    id: 'msg-1',
    channelId: 'chn-1',
    domain: 'sanity/comlink',
    from: 'source',
    to: 'target',
    type: 'test/message',
    ...data,
  }
  const event = new MessageEvent('message', {data: fullData, source})
  return event
}

describe('listenFilter', () => {
  const baseInput: ListenInput = {
    domain: 'sanity/comlink',
    from: 'source',
    to: 'target',
    include: [],
    exclude: [],
    responseType: 'message.received',
    target: undefined,
  }

  it('passes a message matching domain, from, and to', () => {
    const filter = listenFilter(baseInput)
    const event = createMessageEvent({})
    expect(filter(event)).toBe(true)
  })

  it('rejects a message with wrong domain', () => {
    const filter = listenFilter(baseInput)
    const event = createMessageEvent({domain: 'other/domain'})
    expect(filter(event)).toBe(false)
  })

  it('rejects a message with wrong from', () => {
    const filter = listenFilter(baseInput)
    const event = createMessageEvent({from: 'wrong-source'})
    expect(filter(event)).toBe(false)
  })

  it('rejects a message with wrong to', () => {
    const filter = listenFilter(baseInput)
    const event = createMessageEvent({to: 'wrong-target'})
    expect(filter(event)).toBe(false)
  })

  it('filters by include list', () => {
    const filter = listenFilter({...baseInput, include: ['test/message']})
    const matching = createMessageEvent({type: 'test/message'})
    const nonMatching = createMessageEvent({type: 'other/message'})
    expect(filter(matching)).toBe(true)
    expect(filter(nonMatching)).toBe(false)
  })

  it('filters by exclude list', () => {
    const filter = listenFilter({...baseInput, exclude: ['test/excluded']})
    const matching = createMessageEvent({type: 'test/message'})
    const excluded = createMessageEvent({type: 'test/excluded'})
    expect(filter(matching)).toBe(true)
    expect(filter(excluded)).toBe(false)
  })

  it('applies both include and exclude lists', () => {
    const filter = listenFilter({
      ...baseInput,
      include: ['test/a', 'test/b'],
      exclude: ['test/b'],
    })
    const a = createMessageEvent({type: 'test/a'})
    const b = createMessageEvent({type: 'test/b'})
    const c = createMessageEvent({type: 'test/c'})
    expect(filter(a)).toBe(true)
    expect(filter(b)).toBe(false)
    expect(filter(c)).toBe(false)
  })

  it('checks target source when target is set', () => {
    const channel = new MessageChannel()
    const mockTarget = channel.port1 as unknown as MessageEventSource
    const filter = listenFilter({...baseInput, target: mockTarget})
    const matchingEvent = createMessageEvent({}, mockTarget)
    const nonMatchingEvent = createMessageEvent({}, channel.port2 as unknown as MessageEventSource)
    expect(filter(matchingEvent)).toBe(true)
    expect(filter(nonMatchingEvent)).toBe(false)
  })

  it('skips target source check when target is undefined', () => {
    const channel = new MessageChannel()
    const filter = listenFilter({...baseInput, target: undefined})
    const event = createMessageEvent({}, channel.port1 as unknown as MessageEventSource)
    expect(filter(event)).toBe(true)
  })
})

describe('listenInputFromContext', () => {
  const context = {
    domain: 'sanity/comlink',
    connectTo: 'remote-node',
    name: 'local-node',
    target: undefined as MessageEventSource | undefined,
  }

  it('creates listen input with include as string', () => {
    const fn = listenInputFromContext({include: 'comlink/handshake/syn'})
    const result = fn({context})
    expect(result).toEqual({
      count: undefined,
      domain: 'sanity/comlink',
      from: 'remote-node',
      include: ['comlink/handshake/syn'],
      exclude: [],
      responseType: 'message.received',
      target: undefined,
      to: 'local-node',
    })
  })

  it('creates listen input with include as array', () => {
    const fn = listenInputFromContext({include: ['type-a', 'type-b']})
    const result = fn({context})
    expect(result.include).toEqual(['type-a', 'type-b'])
    expect(result.exclude).toEqual([])
  })

  it('creates listen input with exclude as string', () => {
    const fn = listenInputFromContext({exclude: 'comlink/heartbeat'})
    const result = fn({context})
    expect(result.include).toEqual([])
    expect(result.exclude).toEqual(['comlink/heartbeat'])
  })

  it('creates listen input with exclude as array', () => {
    const fn = listenInputFromContext({exclude: ['type-a', 'type-b']})
    const result = fn({context})
    expect(result.include).toEqual([])
    expect(result.exclude).toEqual(['type-a', 'type-b'])
  })

  it('uses custom responseType', () => {
    const fn = listenInputFromContext({
      include: 'test',
      responseType: 'handshake.syn',
    })
    const result = fn({context})
    expect(result.responseType).toBe('handshake.syn')
  })

  it('defaults responseType to message.received', () => {
    const fn = listenInputFromContext({include: 'test'})
    const result = fn({context})
    expect(result.responseType).toBe('message.received')
  })

  it('passes count through', () => {
    const fn = listenInputFromContext({include: 'test', count: 1})
    const result = fn({context})
    expect(result.count).toBe(1)
  })

  it('includes target from context', () => {
    const mockTarget = {} as MessageEventSource
    const fn = listenInputFromContext({include: 'test'})
    const result = fn({context: {...context, target: mockTarget}})
    expect(result.target).toBe(mockTarget)
  })
})

describe('eventToMessage', () => {
  it('wraps a MessageEvent in an object with the given type', () => {
    const event = createMessageEvent({type: 'test/msg'})
    const transform = eventToMessage('custom.type')
    const result = transform(event)
    expect(result).toEqual({
      type: 'custom.type',
      message: event,
    })
  })

  it('preserves the original event reference', () => {
    const event = createMessageEvent({})
    const result = eventToMessage('test')(event)
    expect(result.message).toBe(event)
  })
})
