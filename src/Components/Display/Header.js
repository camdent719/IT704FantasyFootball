import React, {Component, Fragment} from 'react'
import { Typography, Grid, Paper, AppBar, Toolbar, IconButton, Button } from 'material-ui'

export default props =>
  <AppBar position="static">
    <Toolbar>
      <IconButton color="inherit" aria-label="Menu">
      </IconButton>
      <Typography variant="title" color="inherit">
        Fantasy Football App
      </Typography>
      <Button color="inherit">Login</Button>
    </Toolbar>
  </AppBar>
