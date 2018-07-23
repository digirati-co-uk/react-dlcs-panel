import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import DLCSImageSelector from 'src/'

describe('DLCSImageSelector', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('display login form if the not logged in', () => {
    render(<DLCSImageSelector/>, node, () => {
      expect(node.innerHTML).toContain('dlcs_login_form');
    })
  });
  //TODO:
  // it('loads the list if available spaces after received the session variables')
  // it('loads the the list of images if a space selected')
  // it('deletes the session if the login button pressed')
});
