import React from 'react';
import './DLCSImageSelector.scss';

class DLCSLoginPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enpoint: 'https://api.dlc.services',
      customer: 5,
      api_id: 'ca1a40af-f071-49c5-914f-46d13e97890a',
      api_secret: '',
      error: ''
    }
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(ev) {
    const newState = {};
    newState[ev.target.name] = ev.target.value;
    this.setState(newState);
  }

  onSubmit(ev) {
    ev.preventDefault();
    const self = this;
    this.setState({
      error: ''
    })
    let headers = new Headers();
    const url = `${this.state.enpoint}/customers/${this.state.customer}`;
    const auth = btoa(`${this.state.api_id}:${this.state.api_secret}`);
    headers.append(
      'Authorization', 
      `Basic ${auth}`
    );
    fetch(url, {
      method: 'GET',
      headers: headers
    }).then(resp=>resp.json())
    .then(resp=> {
      if(!resp || resp.success === false) {
        self.setState({error: err});
      } else {
        if (self.props.loginCallback) {
          self.props.loginCallback({
            dlcs_url: url,
            auth: auth,
            userName: resp.displayName
          })
        }
      }

    })
    .catch(err=> self.setState({error: err}));
  }

  render() {
    return (
      <form id="dlcs_login_form" className="dlcs-login-panel" onSubmit={this.onSubmit}>
        <label>DLCS Enpoint</label>
        <input type="url" name="enpoint" value={this.state.enpoint} onChange={this.onChange}/>
        <label>DLCS Customer Id</label>
        <input type="number" step="1" min="0" name="customer" value={this.state.customer} onChange={this.onChange}/>
        <label>DLCS API ID</label>
        <input type="text" name="api_id" value={this.state.api_id} onChange={this.onChange}/>
        <label>DLCS API Secret</label>
        <input type="text" name="api_secret" value={this.state.api_secret} onChange={this.onChange}/>
        <input type="submit" value="Login" />
        {
          this.state.error !== '' ? (
            <div className="dlcs-login-panel__error">{this.state.error}</div>
          ): ''
        }
      </form>
    );
  }
}

class DLCSImageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session: null,
      spaces: [],
      selectedSpace: null,
      images: []
    }
    this.sessionAcquiredCallback = this.sessionAcquiredCallback.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onSelectedSpace = this.onSelectedSpace.bind(this);
    this.getPreviewUrl = this.getPreviewUrl.bind(this);
    this.getImageInfoUrl = this.getImageInfoUrl.bind(this);
  }
    
  sessionAcquiredCallback(session) {
    let self = this;
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + session.auth);
    fetch(session.dlcs_url + '/spaces', {
      method: 'GET',
      headers: headers
    }).then(resp=>resp.json())
    .then(resp=> {
      self.setState({
        session: session,
        spaces: resp.member
      })
    })
    .catch(err=>alert(err))
  }
    
  onLogout() {
    this.setState({
      session: null,
      spaces: [],
      selectedSpace: null,
      images: []
    })
  }
    
  onSelectedSpace(ev) {
    let self = this;
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + self.state.session.auth);
    fetch(ev.target.value + '/images', {
      method: 'GET',
      headers: headers
    }).then(resp=>resp.json())
    .then(resp=> {
      console.log(resp.member);
      self.setState({
        images: resp.member
      })
    })
    .catch(err=>alert(err))
  }

  getPreviewUrl(image) {
    const iiifInfoUrl = this.getImageInfoUrl(image);
    return `${iiifInfoUrl}/full/!100,100/0/default.jpg`
  }

  getImageInfoUrl(image) {
    return image['@id']
      .replace('api.','')
      .replace('/customers/','/thumbs/')
      .replace('/spaces/','/')
      .replace('/images/','/');
  }

  render() {
    // const childrenWithProps = React.Children.map(this.props.children, child =>
    //     React.cloneElement(child, { doSomething: this.doSomething }));
    
    let self = this;
    return (
      <div className="dlcs-image-panel">
        {
          this.state.session ? 
          <div className="dlcs-image-panel__content">
            <div className="dlcs-image-panel__header">
              <span>{this.state.session.userName}</span>
              <button onClick={this.onLogout}>Logout</button>
              <select onChange={this.onSelectedSpace}>
                <option key="" value="">Select Space</option>
                {(this.state.spaces || []).map(
                  space=>(
                    <option key={space['@id']} value={space['@id']}>
                    {space.name} - {space.approximateNumberOfImages}
                    </option>
                  )
                )}
              </select>
            </div> 
            <div className="dlcs-image-panel__list">
              {(self.state.images || []).map(
                image=>{
                  return !self.props.children  ? (
                  <img src={ this.getPreviewUrl(image) }/>
                ) : 
                ( 
                  self.props.children(
                    image, 
                    this.getPreviewUrl(image), 
                    this.getImageInfoUrl(image)
                  ) 
                )
              })}
            </div>  
          </div>:
          <DLCSLoginPanel loginCallback={this.sessionAcquiredCallback} />
        }
      </div>
    );
  }
}

export default DLCSImageSelector;