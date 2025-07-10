import { App } from './App'
import { createComponents } from './core/utils/create-components'

export default function Bootstrap({ Components, ...props }: EntryProps) {
  return <App Components={createComponents(Components)} {...props} />
}
