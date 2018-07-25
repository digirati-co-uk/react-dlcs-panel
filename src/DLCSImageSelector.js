import React from 'react';
import './DLCSImageSelector.scss';


function getAuthHeader(session) {
  const headers = new Headers();
  headers.append('Authorization', 'Basic ' + session.auth);
  return headers;
}

function qclone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
      if(!response ||
        response.success === "false" ||
        response.success === false) {
        self.setState({error: "Invalid credentials"});
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
    .catch(err=>{
      self.setState({error: err})
    } );
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

const DEFAULT_SPACE_NAME = 'New Space';

class DLCSNewSpaceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      session: this.props.session,
      newSpaceName: DEFAULT_SPACE_NAME,
      newSpaceError: null,
    }
    this.newSpaceNameChanged = this.newSpaceNameChanged.bind(this);
    this.onAddNewSpace = this.onAddNewSpace.bind(this);
  }
  
  newSpaceNameChanged(ev) {
    this.setState({
      newSpaceName: ev.target.value
    });
  }

  onAddNewSpace(ev) {
    const self = this;
    const { newSpaceName, session } = self.state;
    ev.preventDefault();
    if (newSpaceName && newSpaceName.length > 0) {
      let headers = getAuthHeader(session);
      fetch(session.dlcs_url + '/spaces',{
        method: "POST",
        headers: headers,
        body: JSON.stringify({name: newSpaceName})
      }).then(response=>response.json())
      .then(response=>{
        if (response.hasOwnProperty('message')) {
          throw response.message;
        }
        self.setState({
          newSpaceName: DEFAULT_SPACE_NAME,
          newSpaceError: null,
        })
        if (self.props.callback) {
          self.props.callback(response);
        }
      })
      .catch(err=> self.setState({
        newSpaceError: err
      }));
    }
  }

  render () {
    return (
      <form style={this.props.style || {}}onSubmit={this.onAddNewSpace}>
        <label>DLCS Space Name</label>
        <input type="text" name="new_space_name" value={this.state.newSpaceName} onChange={this.newSpaceNameChanged}/>
        <input type="submit" value="Add New Space" />
        { this.state.newSpaceError ? <div>{this.state.newSpaceError}</div> : '' }
      </form>
    )
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
      images: [],
      imageSearch: {
        string1: '',
        string2: '',
        string3: '',
        number1: 0,
        number2: 0,
        number3: 0,
      },
      addNewSpaceActive: false,
      searchActive: false,
    }
    this.sessionAcquiredCallback = this.sessionAcquiredCallback.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onSelectedSpace = this.onSelectedSpace.bind(this);
    this.searchFormChange = this.searchFormChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.loadImages = this.loadImages.bind(this);
    this.toggleAddNewSpace = this.toggleAddNewSpace.bind(this);
    this.toggleSearchPanel = this.toggleSearchPanel.bind(this);
    this.addNewSpaceCallback = this.addNewSpaceCallback.bind(this);
  }
  
  sessionAcquiredCallback(session) {
    let self = this;
    fetch(session.dlcs_url + '/spaces', {
      method: 'GET',
      headers: getAuthHeader(session)
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
      images: [],
    })
  }

  loadImages(targetSpace,qs) {
    let self = this;
    fetch(targetSpace + '/images' + (qs ? `?${qs}` : ''), {
      method: 'GET',
      headers: getAuthHeader(self.state.session)
    }).then(response => response.json())
    .then(response => {
      self.setState({
        images: response.member,
        selectedSpace: targetSpace
      })
    })
    .catch(err=>alert(err))
  }
    
  onSelectedSpace(ev) {
    this.loadImages(ev.target.value);
  }

 
  searchFormChange(ev) {
    let imageSearch = this.state.imageSearch;
    imageSearch[ev.target.name] = ev.target.value;
    this.setState({ imageSearch });
  }

  onSearch(ev) {
    ev.preventDefault();
    const queryString = Object.entries(this.state.imageSearch||{}).reduce(
      (acc, [name, value])=> {
        if (value !== '' && value !== 0) {
          acc.push(encodeURIComponent(name) + "=" + encodeURIComponent(value))
        }
        return acc;
      },[]).join('&')
    this.loadImages(
      this.state.selectedSpace,
      queryString ? queryString : undefined
    );
  }

  toggleAddNewSpace() {
    this.setState({
      addNewSpaceActive: !this.state.addNewSpaceActive,
      searchActive: false
    });
  }

  toggleSearchPanel() {
    this.setState({
      searchActive: !this.state.searchActive,
      addNewSpaceActive: false
    })
  }

  addNewSpaceCallback(newSpace) {
    let newSpaces = qclone(this.state.spaces);
    newSpaces.push(newSpace);
    this.setState({
      spaces: newSpaces,
      selectedSpace: newSpace['@id'],
      addNewSpaceActive: false
    });
    this.loadImages(newSpace['@id']);
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
              <select onChange={this.onSelectedSpace} value={this.state.selectedSpace}>
                <option key="" value="">Select Space</option>
                {(this.state.spaces || []).map(
                  space=>(
                    <option key={space['@id']} value={space['@id']}>
                    {space.name} - {space.approximateNumberOfImages}
                    </option>
                  )
                )}
              </select>
              <button 
                className={'dlcs-image-panel__search-button' + (this.state.searchActive ? ' active' :'')  } 
                onClick={this.toggleSearchPanel}
              >Search</button>
              <button 
                className={'dlcs-image-panel__add-new-space' + (this.state.addNewSpaceActive ? ' active' :'')  } 
                onClick={this.toggleAddNewSpace}
              >Add New Space</button>
              <DLCSNewSpaceForm 
                style={{display: this.state.addNewSpaceActive? 'block': 'none' }}
                session={this.state.session}
                callback={this.addNewSpaceCallback}
              />
              <form style={{display: this.state.searchActive? 'block': 'none' }} onSubmit={this.onSearch}>
                <label>String1</label>
                <input 
                  type="text"
                  name="string1"
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.string1}
                />
                <label>String2</label>
                <input 
                  type="text" 
                  name="string2" 
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.string2}
                />
                <label>String3</label>
                <input 
                  type="text" 
                  name="string3"
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.string3}
                />
                <label>Number1</label>
                <input 
                  type="number"
                  name="number1"
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.number1}
                />
                <label>Number2</label>
                <input 
                  type="number"
                  name="number2"
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.number2}
                />
                <label>Number3</label>
                <input 
                  type="number"
                  name="number3"
                  onChange={this.searchFormChange}
                  value={this.state.imageSearch.number3}
                />
                <input type="submit" value="Search" />
              </form>
            </div> 
            <div className="dlcs-image-panel__list">
              {(self.state.images || []).map(
                image=>{
                  return !self.props.children  ? (
                  <DLCSImageThumbnail key={image['@id']} image={image} imageOnClick={
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