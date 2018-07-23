import React from 'react';
import './DLCSImageSelector.scss';

/**
 * @private
 * @class DLCSLoginPanel
 * @extends React.Component
 * 
 * This component allows the user to specify the DLCS API credentials.
 * 
 * The login panel meant to be private at the moment. Only DLCSImageSelector 
 * should have access for the DLCSLoginPanel.
 */
class DLCSLoginPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      endpoint: this.props.endpoint || '',
      customer: this.props.customer || '',
      api_id: '',
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
    const url = `${this.state.endpoint}/customers/${this.state.customer}`;
    const auth = btoa(`${this.state.api_id}:${this.state.api_secret}`);
    headers.append(
      'Authorization', 
      `Basic ${auth}`
    );
    fetch(url, {
      method: 'GET',
      headers: headers
    }).then(response => response.json())
    .then(response=> {
      if(!response || response.success === false) {
        self.setState({error: err});
      } else {
        if (self.props.loginCallback) {
          self.props.loginCallback({
            dlcs_url: url,
            auth: auth,
            userName: response.displayName
          })
        }
      }

    })
    .catch(err=> self.setState({error: err}));
  }

  render() {
    return (
      <form id="dlcs_login_form" className="dlcs-login-panel" onSubmit={this.onSubmit}>
        <label>DLCS Endpoint</label>
        <input type="url" name="endpoint" value={this.state.endpoint} onChange={this.onChange}/>
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


/**
 * @class DLCSImageThumbnail
 * @extends React.Component
 * 
 * The components render a dlcs image preview
 */
export class DLCSImageThumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
    }
    this.onImageLoadError = this.onImageLoadError.bind(this);
    this.getPreviewUrl = this.getPreviewUrl.bind(this);
    this.getImageInfoUrl = this.getImageInfoUrl.bind(this);
  }
  
  onImageLoadError() {
    this.setState({
      error: true
    })
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
    let imageInfoUrl = this.getImageInfoUrl(this.props.image);
    let imageOnClick = this.props.imageOnClick ? 
      this.props.imageOnClick : 
      ((ev)=>{ev.preventDefault()});
    let imageLoadError = this.state.error;
    let thumbnailUrl = this.getPreviewUrl(this.props.image);
    const image = this.props.image;
    const imageClickWrap = (ev)=>{imageOnClick(ev, image)};
    return (
      <a href={imageInfoUrl} onClick={imageClickWrap}>
        {
           imageLoadError? 
            <span className="broken-image" title={this.props.image['@id']}></span>
            :
            <img src={thumbnailUrl} onError={this.onImageLoadError} />
        }
      </a>
    );
  }
}



/**
 * @class DLCSImageSelector
 * @extends React.Component
 * 
 * This react component allows the user to list images after selecting DLCS space.
 */
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
  }
    
  sessionAcquiredCallback(session) {
    let self = this;
    let headers = new Headers();
    headers.append('Authorization', 'Basic ' + session.auth);
    fetch(session.dlcs_url + '/spaces', {
      method: 'GET',
      headers: headers
    }).then(response => response.json())
    .then(response => {
      self.setState({
        session: session,
        spaces: response.member
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
    }).then(response => response.json())
    .then(response => {
      console.log(response.member);
      self.setState({
        images: response.member
      })
    })
    .catch(err=>alert(err))
  }

  render() {
    let self = this;
    let { endpoint, customer} = this.props;
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
                  <DLCSImageThumbnail image={image} imageOnClick={
                    self.props.imageOnClick || ((image) => {

                    })
                  }/>
                ) : 
                ( self.props.children(image) )
              })}
            </div>  
          </div>:
          <DLCSLoginPanel 
            loginCallback={this.sessionAcquiredCallback}
            endpoint={endpoint}
            customer={customer}
          />
        }
      </div>
    );
  }
}

export default DLCSImageSelector;