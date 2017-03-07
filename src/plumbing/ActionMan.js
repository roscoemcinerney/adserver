
import DataStore from './DataStore';
import ServerIO from './ServerIO';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import C from '../C.js';

const ActionMan = {};

ActionMan.setFocus = (prop, id) => {
	let newFocus = {};
	assert(C.TYPES.has(prop), prop);
	newFocus[prop] = id;
	DataStore.update({focus: newFocus});
};

ActionMan.setDataValue = (path, valueOrEvent) => {
	let value = valueOrEvent.target? valueOrEvent.target.value : valueOrEvent;	
	assert(_.isArray(path), path);
	assert(C.TYPES.has(path[0]), path);
	// console.log('ActionMan.setValue', path, value);

	let newState = {};
	let tip = newState;	
	for(let pi=0; pi < path.length; pi++) {
		let pkey = path[pi];
		if (pi === path.length-1) {
			tip[pkey] = value;
			break;
		}
		// When to make an array? Let's leave that for the server to worry about.
		// Javascript is lenient on array/object for key->value access.
		let newTip = {};
		tip[pkey] = newTip;
		tip = newTip;
	}

	DataStore.update({data: newState});
};

ActionMan.showLogin = () => {
	DataStore.setShow(C.show.LoginWidget, true);
};

ActionMan.savePublisher = (pubId) => {
	assMatch(pubId, String);
	let publisher = DataStore.getData(C.TYPES.Publisher, pubId);
	if ( ! publisher.id) {
		assert(pubId==='new');
		publisher.id = pubId;
	}
	ServerIO.savePublisher(publisher)
	.then(DataStore.updateFromServer);
};

ActionMan.saveAdvert = (pubId) => {
	assMatch(pubId, String);
	let publisher = DataStore.getData(C.TYPES.Advert, pubId);
	if ( ! publisher.id) {
		assert(pubId==='new');
		publisher.id = pubId;
	}
	ServerIO.saveAdvert(publisher)
	.then(DataStore.updateFromServer);
};

export default ActionMan;
