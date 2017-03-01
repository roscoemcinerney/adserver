import React from 'react';
import ReactDOM from 'react-dom';

import SJTest from 'sjtest';

import MainDiv from './components/MainDiv/MainDiv';

const store = createStore(reducer);

ReactDOM.render(
	<MainDiv />
	document.getElementById('mainDiv'));
