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

const RegisterNewPublisher = ({}) => {
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
		On? <Checkbox checked={pub.active} onChange={e => ActionMan.setDataValue(_.concat(path, 'active'), e.target.value && true)} /> <br/>
		Name <FormControl value={pub.name} onChange={e => ActionMan.setDataValue(_.concat(path, 'name'), e)} /> <br/>
		Website <FormControl value={pub.url} onChange={e => ActionMan.setDataValue(_.concat(path, 'url'), e)} /> <br/>
		Owner <FormControl value={pub.owner} onChange={e => ActionMan.setDataValue(_.concat(path, 'owner'), e)} /> <br/>
		Keywords <FormControl value={pub.keywords} onChange={e => ActionMan.setDataValue(_.concat(path, 'keywords'), e)} /> <br/>
		Charities (direct entry for now)	
		<Grid fluid><Row>
			<Col sm={4}><CharityForm publisher={pub} i={0} charity={pub.charity0} /></Col>
			<Col sm={4}><CharityForm publisher={pub} i={1} charity={pub.charity1} /></Col>
			<Col sm={4}><CharityForm publisher={pub} i={2} charity={pub.charity2} /></Col>
		</Row></Grid>

		<button onClick={() => ActionMan.savePublisher(publisher.id)}>Save</button>
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
			ID: <input value={charity.id} onChange={e => ActionMan.setDataValue(_.concat(path, 'id'), e)} /> <br/>
			name: <input value={charity.name} onChange={e => ActionMan.setDataValue(_.concat(path, 'name'), e)} /> <br/>
			url: <input value={charity.url} onChange={e => ActionMan.setDataValue(_.concat(path, 'url'), e)} /> <br/>
			Logo: <input value={charity.logo} onChange={e => ActionMan.setDataValue(_.concat(path, 'logo'), e)} />
			{logo}
		</div>
	);
};

const ListPublishers = ({}) => {
	let pubs = _.map(_.values(DataStore.appstate.data.Publisher), pub => <ListPublisherItem key={pub.id} publisher={pub} /> );
	return (<div><h3>List Publishers</h3>
			{pubs}
		</div>);
};

const ListPublisherItem = ({publisher}) => {
	return (
		<div className='well'>
			<button className='btn btn-default' onClick={() => ActionMan.setFocus(C.TYPES.Publisher, publisher.id)} >
				{publisher.id} {publisher.name}
			</button>
		</div>
	);
};

export default PublisherPage;
