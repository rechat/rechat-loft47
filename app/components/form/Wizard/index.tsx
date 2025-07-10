import { AgeQuestion } from '../steps/AgeQuestion'
import { GenderQuestion } from '../steps/GenderQuestion'
import { NameQuestion } from '../steps/NameQuestion'

interface Props {
  hooks: EntryProps['hooks']['wizard']
  Wizard: CoreComponents['Wizard']
}

export function FormWizard({ Wizard, hooks }: Props) {
  return (
    <Wizard.QuestionWizard onFinish={() => console.log('done')}>
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <NameQuestion Wizard={Wizard} hooks={hooks} />
      <AgeQuestion Wizard={Wizard} hooks={hooks} />
      <GenderQuestion Wizard={Wizard} hooks={hooks} />
    </Wizard.QuestionWizard>
  )
}
