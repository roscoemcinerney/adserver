
import DataStore from './DataStore';
import ServerIO from './ServerIO';
import _ from 'lodash';
import {assert, assMatch} from 'sjtest';
import C from '../C.js';
import Login from 'hooru';

const ActionMan = {};

ActionMan.setFocus = (prop, id) => {
	let newFocus = {};
	assert(C.TYPES.has(prop), prop);
	newFocus[prop] = id;
	DataStore.update({focus: newFocus});
};

/**
 * @deprecated Convenience: Set a DataStore state.data value.
 * @see ActionMan.setValue() instead
 */
ActionMan.setDataValue = (path, valueOrEvent) => {
	assert(C.TYPES.has(path[0]), path);
	path = ["data"].concat(path);
	ActionMan.setValue(path, valueOrEvent);
};
/**
 * Set a DataStore state value (might be anything)
 */
ActionMan.setValue = (path, valueOrEvent) => {
	let value = valueOrEvent.target? valueOrEvent.target.value : valueOrEvent;
	assert(_.isArray(path), path);	
	DataStore.setValue(path, value);
};

ActionMan.showLogin = () => {
	DataStore.setShow(C.show.LoginWidget, true);
};

ActionMan.socialLogin = (service) => {
	assMatch(service, String);
	Login.auth(service);
};
ActionMan.emailLogin = (email, password) => {
	assMatch(email, String, password, String);
	Login.login(email, password)
	.then(function(res) {
		console.warn("login", res);
		// poke React
		DataStore.update({});	
	});
};
// Trigger react updates on login change
Login.change(function() {
	DataStore.update({misc: {userId: Login.getId()}});
});

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
