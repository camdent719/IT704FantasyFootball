import React, {Component, Fragment} from 'react'
import { Typography, Button, Grid, Paper } from 'material-ui'

let dataJSON = require('../../Data/sample.json');
console.log(dataJSON.roster[0]);

export default class GameCard extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = { data: dataJSON };
  }

  render(){
    return (
      <div>
        <Paper elevation={4}>
          <Grid container spacing={6}>
            <Grid item xs={2}>
              <Typography variant="subheading" color="textSecondary">
                {this.state.data.team_name}
              </Typography>
              <Typography variant="headline" >
                {this.state.data.matchup.user_score}
              </Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="subheading" color="textSecondary">
                {this.state.data.matchup.opponent_name}
              </Typography>
              <Typography variant="headline" >
                {this.state.data.matchup.opponent_score}
              </Typography>
            </Grid>
          </Grid>
          <Button size="small">See More Detail</Button>
          <Button size="small">View On Yahoo</Button>
        </Paper>
      </div>
    );
  }
}
