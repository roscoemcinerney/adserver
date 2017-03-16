import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import _ from 'lodash';
import printer from '../utils/printer.js';
import C from '../C.js';
import {FormGroup,FormControl,HelpBlock,ControlLabel,Grid,Row,Col,Checkbox} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import NGO from '../data/NGO';
import Misc from './Misc.jsx';

class PublisherPage extends React.Component {

	componentWillMount() {
		// better fetch some data
		ServerIO.search(C.TYPES.Publisher)
		.then(DataStore.updateFromServer.bind(DataStore));
	}

    render() {	
		let publisherId = DataStore.appstate.focus.Publisher;
		let publisher = publisherId && DataStore.appstate.data.Publisher[publisherId];
        return (
            <div className=''>
                <h2>PublisherPage</h2>
                <p>Publishers are automatically created when they add our tag to their page.</p>
				<EditPublisher publisher={publisher} />
				<ListPublishers />				
            </div>
        );
    }
}

const RegisterNewPublisher = () => {
	let blank = {id: C.newId, charities:[{},{},{}]};
	return (<div><h3>RegisterNewPublisher</h3>
			<EditPublisherForm publisher={blank} />
		</div>);
};

const EditPublisher = ({publisher}) => {
	if ( ! publisher) return null;
	return (<div><h3>EditPublisher</h3>
			<EditPublisherForm publisher={publisher} />
		</div>);
};

const EditPublisherForm = ({publisher}) => {
	const pub = publisher;
	let path = [C.TYPES.Publisher, publisher.id];
	return (<div className='form'>
		ID <input value={pub.id} readOnly /> <br/>
		On? <Misc.PropControl type='Checkbox' item={pub} prop='active' path={path} /> <br/>
		Name <Misc.PropControl item={pub} path={path} prop='name' /> <br/>
		Website <Misc.PropControl type='url' item={pub} path={path} prop='url' /> <br/>
		Owner <Misc.PropControl item={pub} path={path} prop='owner' /> <br/>
		Keywords <Misc.PropControl item={pub} path={path} prop='keywords' /> <br/>
		Charities (direct entry for now)	
		<Grid fluid><Row>
			<Col sm={4}><CharityForm publisher={pub} i={0} charity={pub.charity0} /></Col>
			<Col sm={4}><CharityForm publisher={pub} i={1} charity={pub.charity1} /></Col>
			<Col sm={4}><CharityForm publisher={pub} i={2} charity={pub.charity2} /></Col>
		</Row></Grid>

		<FormGroup>
			Optional Backfill
			<small>
				If we don't have an advert, then the backfill code will be inserted. This lets
				bloggers setup a waterfall of ad-providers. E.g. Good-Loop (high-value, high-quality) can pass control to AdSense (more coverage).
			</small>
			<Misc.PropControl type='textarea' item={pub} prop='backfill' path={path} /> <br/>
		</FormGroup>
		<FormGroup>
			Backfill trigger price (backfill if we can't beat this value) - 0 is the default for backfill when we have no advert, -1 will switch backfill off.
			<Misc.PropControl type='MonetaryAmount' item={pub} prop='backfillPrice' path={path} /> <br/>
		</FormGroup>
		<Misc.PropControl type='url' item={pub} prop='moreInfo' path={path} /> <br/>

		<button className='btn btn-primary' onClick={() => ActionMan.savePublisher(publisher.id)}>Save</button>
	</div>);
};

// //	{id:'Battersea Dogs & Cats Home', name:'Battersea Dogs & Cats Home', url:'https://www.battersea.org.uk/', logo: BURL+"mock-server/battersea-square-logo.png"},
const CharityForm = ({publisher, i, charity}) => {
	assert(publisher);
	if ( ! charity) charity = {};
	let path = [C.TYPES.Publisher, publisher.id, 'charity'+i];
	let logo = charity.logo? <img className='logo' src={charity.logo} /> : null;
	return (
		<div className='well'>
			<h4>Charity {i}</h4>
			ID: <Misc.PropControl item={charity} path={path} prop='id' /> <br/>
			name: <Misc.PropControl item={charity} path={path} prop='name' /> <br/>
			url: <Misc.PropControl item={charity} path={path} prop='url' /> <br/>
			Logo: <Misc.PropControl item={charity} path={path} prop='logo' /> />
			{logo}
		</div>
	);
};

const ListPublishers = () => {
	let pubs = _.map(_.values(DataStore.appstate.data.Publisher), pub => <ListPublisherItem key={pub.id} publisher={pub} /> );
	return (<div><h3>List Publishers</h3>
			{pubs}
		</div>);
};

const ListPublisherItem = ({publisher}) => {
	return (
		<div className='well'>
			<button className={publisher.active? 'btn btn-success' : 'btn btn-warning'} onClick={() => ActionMan.setFocus(C.TYPES.Publisher, publisher.id)} >
				<code>{publisher.id}</code> {publisher.name}
			</button>
		</div>
	);
};

export default PublisherPage;
