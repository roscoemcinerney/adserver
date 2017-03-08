import React from 'react';
import ReactDOM from 'react-dom';

import SJTest, {assert} from 'sjtest';
import _ from 'lodash';
import printer from '../utils/printer.js';
import C from '../C.js';
import {Button,FormGroup,FormControl,Checkbox,HelpBlock,ControlLabel,Grid,Row,Col} from 'react-bootstrap';
import DataStore from '../plumbing/DataStore';
import ActionMan from '../plumbing/ActionMan';
import ServerIO from '../plumbing/ServerIO';
import NGO from '../data/NGO';
import Misc from './Misc.jsx';

// TODO Advertiser support as opposed to Advert

class AdvertiserPage extends React.Component {

	componentWillMount() {
		// better fetch some data
		ServerIO.search(C.TYPES.Advert)
		.then(DataStore.updateFromServer.bind(DataStore));
	}

    render() {	
		let advertId = DataStore.appstate.focus.Advert;
		let advert = advertId && DataStore.getData(C.TYPES.Advert, advertId);
        return (
            <div className=''>
                <h2>Advert Page</h2>
				{advertId? null : <RegisterNewAdvert />}
				<EditAdvert advert={advert} />
				<ListAdverts />				
            </div>
        );
    }
}

const RegisterNewAdvert = ({}) => {
	let blank = {id: C.newId, charities:[{},{},{}]};
	return (<div><h3>RegisterNewAdvert</h3>
			<EditAdvertForm advert={blank} />
		</div>);
};

const EditAdvert = ({advert}) => {
	if ( ! advert) return null;
	return (<div><h3>EditAdvert</h3>
			<EditAdvertForm advert={advert} />
		</div>);
};

const EditAdvertForm = ({advert}) => {
	const pub = advert;
	let path = [C.TYPES.Advert, advert.id];
	return (<div className='form'>
		ID <input value={pub.id} readOnly /> <br/>
		On? <Misc.PropControl prop='active' type='Checkbox' path={path} item={pub} /> <br/>
		Name <FormControl name='name' value={pub.name} onChange={e => ActionMan.setDataValue(_.concat(path, 'name'), e)} /> <br/>
		Target url <FormControl name='url' value={pub.url} onChange={e => ActionMan.setDataValue(_.concat(path, 'url'), e)} /> <br/>
		Max Bid <Misc.PropControl type='MonetaryAmount' prop='maxBid' path={path} item={pub} /> <br/>
		<SiteThumbnail url={pub.url} />
		Campaign <FormControl value={pub.campaign} onChange={e => ActionMan.setDataValue(_.concat(path, 'campaign'), e)} /> <br/>
		Video <Misc.PropControl prop='video' path={path} item={pub} /> <br/>
		<VideoThumbnail url={pub.video} />
		Mobile Video <FormControl name='mobileVideo' value={pub.mobileVideo} onChange={e => ActionMan.setDataValue(_.concat(path, 'mobileVideo'), e)} /> <br/>
		Keywords (all must match) <FormControl value={pub.keywords} onChange={e => ActionMan.setDataValue(_.concat(path, 'keywords'), e)} /> <br/>

		<Button className='btn btn-primary' onClick={() => ActionMan.saveAdvert(advert.id)}>Save</Button>
	</div>);
};

const SiteThumbnail = ({url}) => url? <iframe style={{width:'200px',height:'150px'}} src={url} /> : null;

const VideoThumbnail = ({url}) => url? <video width={200} height={150} src={url} controls /> : null;

const ListAdverts = ({}) => {
	let pubs = _.map(_.values(DataStore.appstate.data.Advert), pub => <ListAdvertItem key={pub.id} advert={pub} /> );
	return (<div><h3>List Adverts</h3>
			{pubs}
		</div>);
};

const ListAdvertItem = ({advert}) => {
	return (
		<div className='well'>
			<button className={advert.active? 'btn btn-success' : 'btn btn-warning'} onClick={() => ActionMan.setFocus(C.TYPES.Advert, advert.id)} >
				ID: {advert.id} Name: {advert.name} Active: {advert.active? 'Yes' : 'No'}
			</button>
		</div>
	);
};

export default AdvertiserPage;
