import { describe, expect, it } from 'vitest'

import { buildUsageSeries } from './reports'

describe('buildUsageSeries', () => {
  it('aggregates spent credits by day and fills missing days with zeroes', () => {
    const now = new Date('2026-04-06T12:00:00.000Z')

    const series = buildUsageSeries(
      [
        { createdAt: new Date('2026-04-06T09:00:00.000Z'), amount: -120 },
        { createdAt: new Date('2026-04-06T11:00:00.000Z'), amount: -80 },
        { createdAt: new Date('2026-04-05T10:00:00.000Z'), amount: 5000 },
        { createdAt: new Date('2026-04-03T15:00:00.000Z'), amount: -300 },
      ],
      7,
      now,
    )

    expect(series).toEqual([
      { date: 'Mar 31', credits: 0 },
      { date: 'Apr 1', credits: 0 },
      { date: 'Apr 2', credits: 0 },
      { date: 'Apr 3', credits: 300 },
      { date: 'Apr 4', credits: 0 },
      { date: 'Apr 5', credits: 0 },
      { date: 'Apr 6', credits: 200 },
    ])
  })
})
