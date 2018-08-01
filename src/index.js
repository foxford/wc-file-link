import { LitElement, html } from '@polymer/lit-element'
import prettyBytes from 'pretty-bytes'
import mime from 'mime'

class FileLink extends LitElement {
  static get properties () {
    return {
      url: String,
      label: String
    }
  }
  constructor () {
    super()

    this.checking = false
    this.data = null
  }
  _formatSize (value) {
    return prettyBytes(value)
  }
  _getUrl (method) {
    return Promise.resolve(this._getProperty('url'))
  }
  _checkUrl (url) {
    return fetch(url, {
      method: 'HEAD',
    }).then((response) => {
      if (!response.ok) {
        throw Error(`${response.status}: ${response.statusText}`)
      }

      const headers = response.headers

      return {
        size: parseInt(headers.get('content-length')),
        type: mime.getExtension(headers.get('content-type'))
      }
    })
  }
  _handleClick () {
    const w = window.open('')

    this._getUrl('GET').then((url) => {
      if (url) {
        w.location = url
        w.focus()
      }
    })
  }
  _propertiesChanged (props, changedProps, prevProps) {
    super._propertiesChanged(props, changedProps, prevProps)

    if (changedProps && changedProps.url !== undefined) {
      this.checking = true
      this.data = null

      this.requestRender()

      this._getUrl('HEAD')
        .then(this._checkUrl)
        .then((data) => {
          this.data = data
        }).catch((e) => {
          this.data = null
        }).then(() => {
          this.checking = false
          this.requestRender()
        })
    }
  }
  _render (props) {
    const { label } = props
    const extension = this.checking
      ? '...'
      : this.data && this.data.type
        ? this.data.type
        : 'n/a'
    const size = this.checking
      ? '...'
      : this.data && this.data.size
        ? this._formatSize(this.data.size)
        : 'n/a'

    return html`
      <div class="wrapper" on-click="${(e) => this._handleClick()}">
        <div class="row">
          <div class="info">
            <div class="icon">
              <div class="extension">${extension}</div>
            </div>
            <div class="data">
              <div class="name">${label}</div>
              <div class="size">${size}</div>
            </div>
          </div>
          <div class="download"></div>
        </div>
      </div>
    `
  }
}

function withStyles (baseClass, styles) {
  return class extends baseClass {
    _renderStyles () {
      return html`<style>${styles}</style>`
    }
    _render (props) {
      return html`
        ${this._renderStyles()}
        ${super._render(props)}
      `
    }
  }
}

function withUrlTransformer (baseClass, urlTransformer) {
  return class extends baseClass {
    _getUrl (method) {
      return super._getUrl(method).then((url) => urlTransformer(url, method))
    }
  }
}

export {
  FileLink,
  withStyles,
  withUrlTransformer
}
