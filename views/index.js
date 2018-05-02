import React from 'react';
import ReactDOM from 'react-dom';
import './client/src/index.css';
import App from './client/src/Components/App';
import registerServiceWorker from './client/src/registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
