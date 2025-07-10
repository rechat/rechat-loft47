import Ui from '@libs/material-ui'

interface Props {
  hooks: EntryProps['hooks']['wizard']
  Wizard: CoreComponents['Wizard']
}

export function GenderQuestion({ Wizard, hooks: { useWizardContext } }: Props) {
  const wizard = useWizardContext()

  const handleNext = () => {
    wizard.next()
  }

  return (
    <Wizard.QuestionSection>
      <Wizard.QuestionTitle>What's your gender?</Wizard.QuestionTitle>
      <Wizard.QuestionForm>
        <Ui.TextField
          fullWidth
          variant="outlined"
          placeholder="Enter your gender"
        />

        <Ui.Box display="flex" justifyContent="flex-end" my={2}>
          <Ui.Button variant="contained" color="primary" onClick={handleNext}>
            Continue
          </Ui.Button>
        </Ui.Box>
      </Wizard.QuestionForm>
    </Wizard.QuestionSection>
  )
}
