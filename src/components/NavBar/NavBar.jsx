import React, { PropTypes } from 'react';

import AccountMenu from '../AccountMenu';

const NavBar = ({page}) => {
	console.log('NavBar', page);
	let pageLinks = _.map([], p => <li className={page === p? 'active' : ''}><a className="nav-item nav-link" href={'#'+p}>{p}</a></li>);
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
						<img alt="SoGive logo" style={{maxWidth:'100px',maxHeight:'50px'}} src="img/logo.png" />
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

SoGiveNavBar.propTypes = {
	page: PropTypes.string.isRequired,
};

export default SoGiveNavBar;
