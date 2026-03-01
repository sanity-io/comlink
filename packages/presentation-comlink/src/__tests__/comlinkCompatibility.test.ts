import {describe, expect, it} from 'vitest'
import {createCompatibilityActors} from '../comlinkCompatibility'
import type {Message} from '@sanity/comlink'

describe('createCompatibilityActors', () => {
  it('returns an object with listen and requestMachine actors', () => {
    const actors = createCompatibilityActors<Message>()
    expect(actors).toHaveProperty('listen')
    expect(actors).toHaveProperty('requestMachine')
  })

  it('returns actors that are defined', () => {
    const actors = createCompatibilityActors<Message>()
    expect(actors.listen).toBeDefined()
    expect(actors.requestMachine).toBeDefined()
  })
})
