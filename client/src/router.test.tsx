import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Group, Project } from '#src/api/types.ts'
import { renderApp } from '#src/test/renderApp.tsx'

const family: Group = {
  id: 'family',
  name: 'Family',
  participants: [
    { id: 'alice', name: 'Alice', exclusions: [] },
    { id: 'bob', name: 'Bob', exclusions: ['alice'] },
  ],
}

const pageHeading = (name: string) =>
  screen.findByRole('heading', { level: 1, name })

describe('groups list', () => {
  it('redirects / to the groups list', async () => {
    const { router } = renderApp('/', { groups: [family] })

    await pageHeading('Groups')
    const list = screen.getByRole('list', { name: 'Groups' })
    expect(within(list).getByRole('link', { name: /Family/ })).toHaveAttribute(
      'href',
      '/groups/family',
    )
    expect(within(list).getByTestId('group-participant-count')).toHaveTextContent(
      '2 participants',
    )
    expect(router.state.location.pathname).toBe('/groups')
  })

  it('shows an empty state when there are no groups', async () => {
    renderApp('/groups')

    expect(await screen.findByText('No groups yet')).toBeInTheDocument()
  })
})

describe('creating a group', () => {
  it('opens the dialog directly from its URL and shows the new group', async () => {
    const { router, user } = renderApp('/groups/new')

    const dialog = await screen.findByRole('dialog', { name: 'New group' })
    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Friends')
    await user.click(within(dialog).getByRole('button', { name: 'Create' }))

    await pageHeading('Friends')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/groups/group-1')
  })

  it('shows the server failure reason', async () => {
    const { user } = renderApp('/groups')

    await user.click(await screen.findByRole('link', { name: 'New group' }))
    const dialog = await screen.findByRole('dialog', { name: 'New group' })
    await user.click(within(dialog).getByRole('button', { name: 'Create' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Group name cannot be empty',
    )
  })
})

describe('group detail', () => {
  it('shows the participants and their exclusions', async () => {
    renderApp('/groups/family', { groups: [family] })

    await pageHeading('Family')
    const list = screen.getByRole('list', { name: 'Participants' })
    const bob = within(list)
      .getAllByRole('listitem')
      .find((item) => within(item).queryByText('Bob'))
    expect(bob).toHaveTextContent('Not matched with:Alice')
  })

  it('renames the group from a deep link', async () => {
    const { router, user } = renderApp('/groups/family/edit', { groups: [family] })

    const dialog = await screen.findByRole('dialog', { name: 'Rename group' })
    const name = within(dialog).getByRole('textbox', { name: 'Name' })
    expect(name).toHaveValue('Family')
    await user.clear(name)
    await user.type(name, 'Extended family')
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))

    await pageHeading('Extended family')
    expect(router.state.location.pathname).toBe('/groups/family')
  })

  it('deletes the group after confirmation', async () => {
    const { api, router, user } = renderApp('/groups/family', { groups: [family] })

    await user.click(await screen.findByRole('button', { name: 'Delete group' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Family?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await pageHeading('Groups')
    expect(screen.getByText('No groups yet')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/groups')
    expect(api.groups).toEqual([])

    await act(() => router.navigate('/groups/family'))
    await pageHeading('Group not found')
  })

  it('shows not found for an unknown group', async () => {
    renderApp('/groups/missing')

    await pageHeading('Group not found')
    expect(screen.getByRole('link', { name: 'Back to groups' })).toHaveAttribute(
      'href',
      '/groups',
    )
  })
})

describe('participants', () => {
  it('adds a participant with an exclusion', async () => {
    const { api, user } = renderApp('/groups/family', { groups: [family] })

    await user.click(await screen.findByRole('link', { name: 'Add participant' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add participant' })
    await user.type(within(dialog).getByRole('textbox', { name: 'Name' }), 'Carol')
    await user.click(within(dialog).getByRole('combobox', { name: 'Exclusions' }))
    await user.click(await screen.findByRole('option', { name: 'Alice' }))
    await user.click(within(dialog).getByRole('button', { name: 'Add' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const list = screen.getByRole('list', { name: 'Participants' })
    expect(within(list).getByText('Carol')).toBeInTheDocument()
    expect(api.groups[0].participants.at(-1)).toMatchObject({
      name: 'Carol',
      exclusions: ['alice'],
    })
  })

  it('opens the edit dialog prefilled from a deep link', async () => {
    renderApp('/groups/family/participants/bob/edit', { groups: [family] })

    const dialog = await screen.findByRole('dialog', { name: 'Edit participant' })
    expect(within(dialog).getByRole('textbox', { name: 'Name' })).toHaveValue('Bob')
    expect(within(dialog).getByRole('button', { name: 'Alice' })).toBeInTheDocument()
  })

  it('shows not found for an unknown participant', async () => {
    renderApp('/groups/family/participants/zed/edit', { groups: [family] })

    await pageHeading('Participant not found')
  })

  it('deletes a participant after confirmation', async () => {
    const { user } = renderApp('/groups/family', { groups: [family] })

    await user.click(await screen.findByRole('button', { name: 'Delete Alice' }))
    const dialog = await screen.findByRole('dialog', { name: 'Delete Alice?' })
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    const list = screen.getByRole('list', { name: 'Participants' })
    expect(within(list).queryByText('Alice')).not.toBeInTheDocument()
    expect(within(list).getByText('No exclusions')).toBeInTheDocument()
  })
})

it('shows not found for an unknown route', async () => {
  renderApp('/nowhere')

  await pageHeading('Page not found')
})

const furnace: Project = {
  id: 'furnace',
  name: 'Furnace install',
  status: 'quoted',
  dueDate: '2026-10-01',
  address: {
    street: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
  },
  advisorId: 'advisor-1',
}

const heatPump: Project = {
  id: 'heat-pump',
  name: 'Heat pump',
  status: 'lead',
  dueDate: '2026-12-01',
  address: {
    street: '456 Oak Ave',
    city: 'Dallas',
    state: 'TX',
    postalCode: '75201',
  },
  advisorId: 'advisor-2',
}

describe('projects list', () => {
  it('shows project cards with name, status, and due date', async () => {
    renderApp('/projects', { projects: [furnace, heatPump] })

    await pageHeading('Projects')
    const furnaceCard = await screen.findByRole('article', {
      name: 'Furnace install',
    })
    expect(within(furnaceCard).getByText('Quoted')).toBeInTheDocument()
    expect(within(furnaceCard).getByText(/Due/)).toBeInTheDocument()
    expect(
      screen.getByRole('article', { name: 'Heat pump' }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no projects', async () => {
    renderApp('/projects')

    expect(await screen.findByText('No projects yet')).toBeInTheDocument()
  })

  it('filters by status and advisor and sorts by due date via the URL', async () => {
    const { router, user } = renderApp('/projects', {
      projects: [furnace, heatPump],
    })

    await pageHeading('Projects')

    await user.click(screen.getByRole('combobox', { name: 'Status' }))
    await user.click(await screen.findByRole('option', { name: 'Quoted' }))
    // Close the multi-select menu so the page is interactive again.
    await user.keyboard('{Escape}')

    const advisorField = screen.getByRole('textbox', { name: 'Advisor ID' })
    await user.type(advisorField, 'advisor-1')
    await user.tab()

    await user.click(screen.getByRole('combobox', { name: 'Sort' }))
    await user.click(
      await screen.findByRole('option', { name: 'Due date (latest)' }),
    )

    await waitFor(() => {
      expect(router.state.location.search).toContain('status=quoted')
      expect(router.state.location.search).toContain('advisorId=advisor-1')
      expect(router.state.location.search).toContain('sort=-dueDate')
    })

    expect(
      await screen.findByRole('article', { name: 'Furnace install' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('article', { name: 'Heat pump' }),
    ).not.toBeInTheDocument()
  })

  it('loads filtered results from a deep link', async () => {
    renderApp('/projects?status=quoted&advisorId=advisor-1&sort=-dueDate', {
      projects: [furnace, heatPump],
    })

    expect(
      await screen.findByRole('article', { name: 'Furnace install' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('article', { name: 'Heat pump' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Advisor ID' })).toHaveValue(
      'advisor-1',
    )
  })

  it('links to projects from the primary nav', async () => {
    const { user } = renderApp('/groups', { groups: [family] })

    await pageHeading('Groups')
    await user.click(
      within(screen.getByRole('navigation', { name: 'Primary' })).getByRole(
        'link',
        { name: 'Projects' },
      ),
    )

    await pageHeading('Projects')
  })
})
