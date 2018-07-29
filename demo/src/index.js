import React, {Component} from 'react'
import {render} from 'react-dom'

import Highlight from 'react-highlight'
//import '../../node_modules/react'
import {
  DLCSImageSelector,
  DLCSImageThumbnail
} from '../../src/index'
import './index.scss'

class Demo extends Component {
  render() {
    return <div className="demo">
      <link href="https://fonts.googleapis.com/css?family=Crimson+Text|Julius+Sans+One" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/vs2015.min.css" rel="stylesheet" />
      <h1>React DLCS Panel Demo</h1>

      <article className="demo-container">
        <section className="demo-container__column">
          <h2>Basic Example</h2>
          <Highlight className="jsx">
          {
'<DLCSImageSelector \n\
  endpoint="https://api.dlc.services" \n\
  customer={5} \n\
  imageOnClick={(ev, image)=>{ \n\
    ev.preventDefault(); \n\
    alert(JSON.stringify(image, null, 2)); \n\
  }} \n\
/> \n\
'
          }
          </Highlight>
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
          <Highlight className="jsx">
          {
'<DLCSImageSelector \n\
  endpoint="https://api.dlc.services" \n\
  customer={5} \n\
> \n\
  {(image, index)=> \n\
    <div className="custom-item"> \n\
      <DLCSImageThumbnail image={image}/> \n\
      <span>{image.width} X {image.height}</span><br/> \n\
      <a href={image[\'@id\']} target="_blank">Info</a> \n\
    </div> \n\
  } \n\
</DLCSImageSelector> \n\
'
          }
          </Highlight>

          <DLCSImageSelector
            endpoint="https://api.dlc.services"
            customer={5}
          >
            {(image, index)=>
              <div className="custom-item">
                <DLCSImageThumbnail image={image}/>
                <span>{image.width} X {image.height}</span><br/>
                <a href={image['@id']} target="_blank">Info ({index})</a>
              </div>
            }
          </DLCSImageSelector>
        </section>
      </article>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
