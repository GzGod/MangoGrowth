import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TableShell } from './surface'

describe('TableShell', () => {
  it('renders a custom empty state node when provided', () => {
    render(
      <TableShell
        columns={['名称']}
        rows={[]}
        emptyState={<div>自定义空状态</div>}
      />,
    )

    expect(screen.getByText('自定义空状态')).toBeInTheDocument()
  })
})
