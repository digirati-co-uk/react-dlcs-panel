import React, {Component} from 'react'
import {render} from 'react-dom'

import {
  DLCSImageSelector,
  DLCSImageThumbnail
} from '../../src/index'
import './index.scss'

class Demo extends Component {
  render() {
    return <div className="demo">
      <link href="https://fonts.googleapis.com/css?family=Crimson+Text|Julius+Sans+One" rel="stylesheet" />
      <h1>react-dlcs-panel Demo</h1>

      <article className="demo-container">
        <section className="demo-container__column">
          <h2>Basic Example</h2>
          <DLCSImageSelector
            endpoint="https://api.dlc.services"
            customer={5}
            imageOnClick={(ev, image)=>{
              ev.preventDefault();
              alert(JSON.stringify(image, null, 2));
            }}
          />
        </section>
        <section className="demo-container__column">
          <h2>Custom renderer</h2>
          <DLCSImageSelector
            endpoint="https://api.dlc.services"
            customer={5}
          >
            {(image)=>
              <div className="custom-item">
                <DLCSImageThumbnail image={image}/>
                <span>{image.width} X {image.height}</span><br/>
                <a href={image['@id']} target="_blank">Info</a>
              </div>
            }
          </DLCSImageSelector>
        </section>
      </article>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
