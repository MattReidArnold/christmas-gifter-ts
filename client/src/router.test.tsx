import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Group } from '#src/api/types.ts'
import { ownerMember } from '#src/test/fakeApi.ts'
import { renderApp } from '#src/test/renderApp.tsx'

const family: Group = {
  id: 'family',
  name: 'Family',
  members: [ownerMember],
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

describe('sign in', () => {
  it('shows the Google sign-in button', async () => {
    renderApp('/login', { signedIn: false })

    expect(
      await screen.findByRole('button', { name: 'Sign in with Google' }),
    ).toBeInTheDocument()
  })

  it('sends a signed-out visitor to the login page', async () => {
    const { router } = renderApp('/groups', { signedIn: false })

    expect(
      await screen.findByRole('button', { name: 'Sign in with Google' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('sends a signed-in visitor away from the login page', async () => {
    const { router } = renderApp('/login')

    await pageHeading('Groups')
    expect(router.state.location.pathname).toBe('/groups')
  })

  it('signs out and returns to the login page', async () => {
    const { user, router } = renderApp('/groups')

    await user.click(await screen.findByRole('button', { name: 'Sign out' }))

    expect(
      await screen.findByRole('button', { name: 'Sign in with Google' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })
})
