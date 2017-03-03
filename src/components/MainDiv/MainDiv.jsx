import React, { Component } from 'react';
import Login from 'hooru';
import { assert } from 'sjtest';
import { getUrlVars } from 'wwutils';

// Plumbing
import DataStore from '../../plumbing/DataStore';

// Templates
import MessageBar from '../MessageBar';
import NavBar from '../NavBar/NavBar';
import LoginWidget from '../LoginWidget/LoginWidget';
// Pages
import DashboardPage from '../DashboardPage';
import PublisherPage from '../PublisherPage';
import AdvertiserPage from '../AdvertiserPage';
import AccountPage from '../AccountPage';

// Actions

const PAGES = {
	advertiser: AdvertiserPage,
	dashboard: DashboardPage,
	account: AccountPage,
	publisher: PublisherPage,	
};

const DEFAULT_PAGE = 'publisher';


/**
		Top-level: tabs
*/
class MainDiv extends Component {
	constructor(props) {
		super(props);
		this.state = this.decodeHash(window.location.href);
	}

	componentWillMount() {		
		DataStore.addListener((mystate) => this.setState(mystate));

		// Set up login watcher here, at the highest level
		Login.change(() => {
			this.setState({});
		});

		// trigger change to make sure we're up to date. ??
		// Login.change();
	}

	componentDidMount() {
		window.addEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	componentWillUnmount() {
		window.removeEventListener('hashchange', ({newURL}) => { this.hashChanged(newURL); });
	}

	hashChanged(newURL) {
		this.setState(
			this.decodeHash(newURL)
		);
	}

	decodeHash(url) {
		const hashIndex = url.indexOf('#');
		const hash = (hashIndex >= 0) ? url.slice(hashIndex + 1) : '';
		const page = hash.split('?')[0] || DEFAULT_PAGE;
		const pageProps = getUrlVars(hash);
		return { page, pageProps };
	}

	render() {
		const { page, pageProps } = this.state;
		assert(page, this.props);
		const Page = PAGES[page];
		assert(Page, (page, PAGES));
		let showLogin = DataStore.appstate.show && DataStore.appstate.show.LoginWidget;
		return (
			<div>
				<NavBar page={page} />
				<div className="container avoid-navbar">
					<MessageBar />
					<div id={page}>
						<Page {...pageProps} />
					</div>
				</div>
				<LoginWidget showDialog={showLogin} />
			</div>
		);
	}
}

export default MainDiv;
