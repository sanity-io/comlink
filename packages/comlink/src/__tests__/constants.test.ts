import {describe, expect, it} from 'vitest'
import {
  DOMAIN,
  FETCH_TIMEOUT_DEFAULT,
  HANDSHAKE_INTERVAL,
  HANDSHAKE_MSG_TYPES,
  HEARTBEAT_INTERVAL,
  INTERNAL_MSG_TYPES,
  MSG_DISCONNECT,
  MSG_HANDSHAKE_ACK,
  MSG_HANDSHAKE_SYN,
  MSG_HANDSHAKE_SYN_ACK,
  MSG_HEARTBEAT,
  MSG_RESPONSE,
  RESPONSE_TIMEOUT_DEFAULT,
} from '../constants'

describe('constants', () => {
  it('exports the expected DOMAIN', () => {
    expect(DOMAIN).toBe('sanity/comlink')
  })

  it('exports the expected timeout defaults', () => {
    expect(RESPONSE_TIMEOUT_DEFAULT).toBe(3_000)
    expect(FETCH_TIMEOUT_DEFAULT).toBe(10_000)
  })

  it('exports the expected interval values', () => {
    expect(HEARTBEAT_INTERVAL).toBe(1000)
    expect(HANDSHAKE_INTERVAL).toBe(500)
  })

  it('exports the expected message type constants', () => {
    expect(MSG_RESPONSE).toBe('comlink/response')
    expect(MSG_HEARTBEAT).toBe('comlink/heartbeat')
    expect(MSG_DISCONNECT).toBe('comlink/disconnect')
    expect(MSG_HANDSHAKE_SYN).toBe('comlink/handshake/syn')
    expect(MSG_HANDSHAKE_SYN_ACK).toBe('comlink/handshake/syn-ack')
    expect(MSG_HANDSHAKE_ACK).toBe('comlink/handshake/ack')
  })

  it('HANDSHAKE_MSG_TYPES contains all handshake message types', () => {
    expect(HANDSHAKE_MSG_TYPES).toEqual([
      MSG_HANDSHAKE_SYN,
      MSG_HANDSHAKE_SYN_ACK,
      MSG_HANDSHAKE_ACK,
    ])
  })

  it('INTERNAL_MSG_TYPES contains all internal message types', () => {
    expect(INTERNAL_MSG_TYPES).toEqual([
      MSG_RESPONSE,
      MSG_DISCONNECT,
      MSG_HEARTBEAT,
      MSG_HANDSHAKE_SYN,
      MSG_HANDSHAKE_SYN_ACK,
      MSG_HANDSHAKE_ACK,
    ])
  })

  it('INTERNAL_MSG_TYPES is a superset of HANDSHAKE_MSG_TYPES', () => {
    for (const type of HANDSHAKE_MSG_TYPES) {
      expect(INTERNAL_MSG_TYPES).toContain(type)
    }
  })
})
