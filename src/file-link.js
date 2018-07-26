import {
  FileLink,
  withStyles
} from './index'
import css from './styles.css'

window.customElements.define('file-link', withStyles(FileLink, css))
