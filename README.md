# react-dlcs-panel

[![Travis Build Status][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coveralls][coveralls-badge]][coveralls]

This library implements a DLCS image lister panel for React.

**Demo:**

[https://react-dlcs-panel.netlify.com/](https://react-dlcs-panel.netlify.com/)

## Installation

```
npm install react-dlcs-panel
```

or 

```
yarn add react-dlcs-panel
```

## Usage

```jsx
import React from 'react'
import { DLCSImageSelector } from 'react-dlcs-panel'

const ImageSelectorDemo = (props) => (
    <div style={{width:'100%', height: '100%'}}>
        <DLCSImageSelector imageOnClick={(ev, image)=>{ 
            alert(image['@id'])
        }/>
    </div>
)
```


**TODO:**

- [ ] Finish Readme.md
- [x] Provide simple example
- [x] Provide complex example with overridden default renderer
- [ ] Add ability to upload image
- [x] Implement default list renderer on click
- [x] Add action button `create new space`
- [ ] Infinite scroll
- [x] Add search by String1-3, Number1-3


[build-badge]: https://travis-ci.com/digirati-co-uk/react-dlcs-panel.svg?token=Jte42dszspRtC2NURDp5&branch=master
[build]: https://travis-ci.com/digirati-co-uk/react-dlcs-panel

[npm-badge]: https://img.shields.io/npm/v/npm-package.png?style=flat-square
[npm]: https://www.npmjs.org/package/npm-package

[coveralls-badge]: https://img.shields.io/coveralls/user/repo/master.png?style=flat-square
[coveralls]: https://coveralls.io/github/user/repo
