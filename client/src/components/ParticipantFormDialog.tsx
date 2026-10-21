import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useId, useState, type FormEvent } from 'react'

import type { Participant, ParticipantInput } from '#src/api/types.ts'

interface ParticipantFormDialogProps {
  title: string
  submitLabel: string
  // Everyone else in the group; these are the possible exclusions.
  otherParticipants: Participant[]
  initialValues?: ParticipantInput
  pending: boolean
  error: Error | null
  onSubmit: (participant: ParticipantInput) => void
  onClose: () => void
}

export function ParticipantFormDialog({
  title,
  submitLabel,
  otherParticipants,
  initialValues = { name: '', exclusions: [] },
  pending,
  error,
  onSubmit,
  onClose,
}: ParticipantFormDialogProps) {
  const titleId = useId()
  const [name, setName] = useState(initialValues.name)
  const [exclusions, setExclusions] = useState(initialValues.exclusions)

  const excluded = otherParticipants.filter(({ id }) => exclusions.includes(id))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ name, exclusions })
  }

  return (
    <Dialog
      open
      onClose={pending ? undefined : onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id={titleId}>{title}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}
          <TextField
            name="name"
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoFocus
            fullWidth
            margin="dense"
          />
          <Autocomplete
            multiple
            options={otherParticipants}
            value={excluded}
            onChange={(_event, selected) =>
              setExclusions(selected.map(({ id }) => id))
            }
            getOptionLabel={({ name: optionName }) => optionName}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No other participants"
            renderInput={(params) => (
              <TextField
                {...params}
                name="exclusions"
                label="Exclusions"
                helperText="People this participant must not be matched with"
                margin="dense"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={pending}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
