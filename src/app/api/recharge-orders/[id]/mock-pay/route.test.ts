import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'

describe('mock-pay route', () => {
  it('route file does not exist (deleted for security)', () => {
    const routePath = path.resolve(
      __dirname,
      'route.ts',
    )
    expect(existsSync(routePath)).toBe(false)
  })
})
