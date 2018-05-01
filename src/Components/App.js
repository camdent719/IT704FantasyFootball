import React, {Component, Fragment} from 'react'
import { Grid, AppBar, Toolbar, Typography, IconButton, Button } from 'material-ui'
import GameCard from './Display/GameCard'
import Header from './Display/Header'
import Login from './Display/Login'
import Error from './Display/Error'
import Test from './Display/Test'
import Expanded from './Display/Expanded'

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: false,
    };
  }

  // function frontPage(props) {
  //   const isLoggedIn = props.isLoggedIn;
  //   if (isLoggedIn) {
  //     return(
  //       <Fragment>
  //         <Header />
  //         <GameCard />
  //       </Fragment>
  //     );
  //   }else{
  //     return(
  //       <Fragment>
  //         <Header />
  //         <Expanded />
  //       </Fragment>
  //     );
  //   }
  // }


  //For some reason, whether 'loggedIn' is false or true it returns the GameCards
  render() {
    var isLogged = this.state.loggedIn
    console.log(typeof isLogged)
    console.log(isLogged)
    if ({isLogged}) {
      return <Fragment>
        <Header />
        <GameCard />
      </Fragment>
    } else {
      return <Fragment>
        <Header />
        <Expanded />
      </Fragment>
    }
  }
}
