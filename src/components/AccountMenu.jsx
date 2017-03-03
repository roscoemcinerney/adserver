import React from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import C from '../C';
// import {XId,yessy,uid} from '../js/util/orla-utils.js';

import Misc from './Misc';
import ActionMan from '../plumbing/ActionMan';

/*
The top-right menu
*/
const AccountMenu = ({user, pending, active, doLogout}) => {
	if (pending) return <Misc.Loading />;

	if ( ! user) {
		return (
			<ul id='top-right-menu' className="nav navbar-nav navbar-right">
				<li>
					<a href='#' onClick={ActionMan.showLogin}>
						Login or Register
					</a>
				</li>
			</ul>
		);
	}

	return (
		<ul id='top-right-menu' className="nav navbar-nav navbar-right">
			<li className={'dropdown' + (active? ' active' : '')}>
				<a className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
					{ user.name || user.xid }&nbsp;
					<span className="caret" />
				</a>
				<ul className="dropdown-menu">
					<li><a href="#account">Account</a></li>
					<li role="separator" className="divider" />
					<li><a href="#dashboard" onClick={() => doLogout()}>Log out</a></li>
				</ul>
			</li>
		</ul>
	);
};


export default AccountMenu;
