import { describe, expect, it } from 'vitest'

import { formatMinutes, formatTime } from './time'

describe('service-day time formatting', () => {
  it('marks times after midnight as the next day', () => {
    expect(formatTime(86_580)).toBe('00:03 (+1日)')
  })

  it('formats delay seconds as minutes', () => {
    expect(formatMinutes(480)).toBe('8 分钟')
  })
})

