import React, {Component} from 'react'
import {render} from 'react-dom'

import DLCSImageSelector from '../../src/index'
import './index.scss'

class Demo extends Component {
  render() {
    return <div>
      <link href="https://fonts.googleapis.com/css?family=Crimson+Text|Julius+Sans+One" rel="stylesheet" />
      <h1>react-dlcs-panel Demo</h1>
      <DLCSImageSelector />
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
