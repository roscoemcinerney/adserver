
import C from '../C.js';
import _ from 'lodash';

class Store {	

	constructor() {
		this.callbacks = [];
		this.appstate = {data:{}, focus:{}};
	}

	addListener(callback) {
		this.callbacks.push(callback);
	}

	update(newState) {
		console.log('update', newState);
		_.merge(this.appstate, newState);
		this.callbacks.forEach(fn => fn(this.appstate));
	}

	getData(type, id) {
		return this.appstate.data[type][id];
	}

	updateFromServer(res) {
		console.log("updateFromServer", res);
		return res;
	}

} // ./Store

const DataStore = new Store();
export default DataStore;
// accessible to debug
if (typeof(window) !== 'undefined') window.DataStore = DataStore;

/**
 * Store all the state in one big object??
 */
DataStore.update({
	data: {
		publisher: {
			default_publisher: {
				name: 'default',
				id: 'default_publisher',
				charities: [
					{},
					{},
					{}
				]
			}
		},
		charity: {},
		advertiser: {},
		person: {}
	},
	focus: {
		publisher: null,
		advertiser: null,
		charity: null,
		person: null,
	}
});
