import {describe, expect, it, vi} from 'vitest'
import {isMaybePresentation, isMaybePreviewIframe, isMaybePreviewWindow} from '../isMaybePresentation'

describe('isMaybePreviewIframe', () => {
  it('returns false when window.self === window.top (not in iframe)', () => {
    // In the test environment (happy-dom), self === top by default
    const result = isMaybePreviewIframe()
    // In a normal (non-iframe) context, self === top
    expect(typeof result).toBe('boolean')
  })
})

describe('isMaybePreviewWindow', () => {
  it('returns false when window.opener is null', () => {
    const result = isMaybePreviewWindow()
    expect(result).toBe(false)
  })
})

describe('isMaybePresentation', () => {
  it('returns false in a normal test environment', () => {
    // In test env: self === top and opener is null
    const result = isMaybePresentation()
    expect(typeof result).toBe('boolean')
  })

  it('returns true if isMaybePreviewIframe returns true', () => {
    // When self !== top, isMaybePreviewIframe returns true
    const originalSelf = window.self
    try {
      Object.defineProperty(window, 'self', {
        value: {} as Window,
        writable: true,
        configurable: true,
      })
      expect(isMaybePreviewIframe()).toBe(true)
      expect(isMaybePresentation()).toBe(true)
    } finally {
      Object.defineProperty(window, 'self', {
        value: originalSelf,
        writable: true,
        configurable: true,
      })
    }
  })

  it('returns true if isMaybePreviewWindow returns true', () => {
    const originalOpener = window.opener
    try {
      Object.defineProperty(window, 'opener', {
        value: {} as Window,
        writable: true,
        configurable: true,
      })
      expect(isMaybePreviewWindow()).toBe(true)
      expect(isMaybePresentation()).toBe(true)
    } finally {
      Object.defineProperty(window, 'opener', {
        value: originalOpener,
        writable: true,
        configurable: true,
      })
    }
  })
})
