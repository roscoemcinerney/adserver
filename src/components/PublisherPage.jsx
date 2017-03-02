import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import _ from 'lodash';
import printer from '../utils/printer.js';
import C from '../C.js';
import {FormGroup,FormControl,HelpBlock,ControlLabel,Grid,Row,Col} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';


class PublisherPage extends React.Component {

    render() {	
		let publisherId = DataStore.appstate.focus.publisher;
		let publisher = publisherId && DataStore.appstate.data.publisher[publisherId];
        return (
            <div className=''>
                <h2>PublisherPage</h2>
				{publisherId? null : <RegisterNewPublisher />}
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
	let path = ['publisher',publisher.id];
	return (<div className='form'>
		ID <input value={pub.id} readOnly /> <br/>
		Name <FormControl value={pub.name} onChange={e => ActionMan.setDataValue(_.concat(path, 'name'), e)} /> <br/>
		Website <input value={pub.url} onChange={e => ActionMan.setDataValue(_.concat(path, 'url'), e)} /> <br/>
		Owner <input value={pub.owner} onChange={e => ActionMan.setDataValue(_.concat(path, 'owner'), e)} /> <br/>
		Keywords <input value={pub.keywords} onChange={e => ActionMan.setDataValue(_.concat(path, 'keywords'), e)} /> <br/>
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
	let path = ['publisher',publisher.id,'charity'+i];
	return (
		<div className='well'>
			<h4>Charity {i}</h4>
			ID: <input value={charity.id} onChange={e => ActionMan.setDataValue(_.concat(path, 'id'), e)} /> <br/>
			name: <input value={charity.name} onChange={e => ActionMan.setDataValue(_.concat(path, 'name'), e)} /> <br/>
			url: <input value={charity.url} onChange={e => ActionMan.setDataValue(_.concat(path, 'url'), e)} /> <br/>
			Logo: <input value={charity.logo} onChange={e => ActionMan.setDataValue(_.concat(path, 'logo'), e)} />
		</div>
	);
};

const ListPublishers = ({}) => {
	let defaultPub = DataStore.appstate.data.publisher.default_publisher;	
	return (<div><h3>List Publishers</h3>
			<ListPublisherItem publisher={defaultPub} />
		</div>);
};

const ListPublisherItem = ({publisher}) => {
	return (
		<div className='well'>
			<button className='btn btn-default' onClick={() => ActionMan.setFocus('publisher', publisher.id)} >{publisher.id} {publisher.name}</button>
		</div>
	);
};

export default PublisherPage;
