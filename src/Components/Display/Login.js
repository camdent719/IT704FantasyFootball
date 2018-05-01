import React, {Component, Fragment} from 'react'
import { Typography, Button } from 'material-ui'

export default class Login extends Component {
  
  
  unsupported() {
    window.alert("This fantasy provider is not supported at this time.");
  }

  render() {
    return (
      <div>
        <Typography variant="headline">Login with a Fantasy Football Provider to Add a Team</Typography>
        <p><Button onClick={location.href='../../server.js/auth/test'}>Add Yahoo Team</Button></p>
        <p><Button onClick={() => this.unsupported()} style={{color: '#bbbbbb'}}>Add NFL Team</Button></p>
        <p><Button onClick={() => this.unsupported()} style={{color: '#bbbbbb'}}>Add CBS Team</Button></p>
        <p><Button onClick={() => this.unsupported()} style={{color: '#bbbbbb'}}>Add ESPN Team</Button></p>     
      </div>
    );
  }
}
  
