import * as MuiCore from '@material-ui/core'
import { SnackbarCloseReason } from '@material-ui/core/Snackbar'  

const MaterialUi = window.libs.MaterialUi as typeof MuiCore & { SnackbarCloseReason: SnackbarCloseReason }
export default MaterialUi
