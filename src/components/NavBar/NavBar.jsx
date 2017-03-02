import React, { PropTypes } from 'react';
import _ from 'lodash';

import AccountMenu from '../AccountMenu';

const NavBar = ({page}) => {
	console.log('NavBar', page);
	let pageLinks = _.map(['dashboard', 'publisher', 'advertiser'], 
		p => <li key={'li_'+p} className={page === p? 'active' : ''}><a className="nav-item nav-link" href={'#'+p}>{p}</a></li>);
	return (
		<nav className="navbar navbar-fixed-top navbar-inverse">
			<div className="container">
				<div className="navbar-header" title="Dashbrd">
					<button
						type="button"
						className="navbar-toggle collapsed"
						data-toggle="collapse"
						data-target="#navbar"
						aria-expanded="false"
						aria-controls="navbar"
					>
						<span className="sr-only">Toggle navigation</span>
						<span className="icon-bar" />
						<span className="icon-bar" />
						<span className="icon-bar" />
					</button>
					<a className="" href="#dashboard">
						<img alt="Good-Loop logo" style={{maxWidth:'100px',maxHeight:'50px'}} src="img/logo.png" />
					</a>
				</div>
				<div id="navbar" className="navbar-collapse collapse">
					<ul className="nav navbar-nav">
						{pageLinks}
					</ul>
					<div>
						<AccountMenu active={page === 'account'} />
					</div>
				</div>
			</div>
		</nav>
	);
};
// ./NavBar

NavBar.propTypes = {
	page: PropTypes.string.isRequired,
};

export default NavBar;
