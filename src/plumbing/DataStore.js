
import C from '../C.js';
import _ from 'lodash';
import {getType} from '../data/DataClass';
import {assert,assMatch} from 'sjtest';

/**
 * Hold data in a simple json tree, and provide some utility methods to update it - and to attach a listener.
 * E.g. in a top-of-the-app React container, you might do `DataStore.addListener((mystate) => this.setState(mystate));`
 */
class Store {	

	constructor() {
		this.callbacks = [];
		this.appstate = {data:{}, focus:{}, show:{}, misc:{}};
	}

	addListener(callback) {
		this.callbacks.push(callback);
	}

	update(newState) {
		console.log('update', newState);
		_.merge(this.appstate, newState);
		this.callbacks.forEach(fn => fn(this.appstate));
	}

	/**
	 * Convenience for getting from the data sub-node (as opposed to e.g. focus or misc) of the state tree.
	 * type, id
	 * @returns a "data-item", such as a person or document, or undefined.
	 */
	getData(type, id) {
		assert(C.TYPES.has(type));
		assert(id, type);
		return this.appstate.data[type][id];
	}

	/**
	 * Update a single path=value
	 * @param {String[]} path 
	 * @param {*} value 
	 */
	setValue(path, value) {
		assert(_.isArray(path), path);
		assert(this.appstate[path[0]], 
			path[0]+" is not a node in appstate - As a safety check against errors, the root node must already exist to use setValue()");
		console.log('DataStore.setValue', path, value);
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
		// update
		DataStore.update(newState);
	}

	setShow(thing, showing) {
		assMatch(thing, String);
		let s = {show: {}};
		s.show[thing] = showing;
		this.update(s);
	}

	updateFromServer(res) {
		console.log("updateFromServer", res);
		let hits = res.cargo && res.cargo.hits;
		if ( ! hits) return;
		let itemstate = {data:{}};
		hits.forEach(item => {
			try {
				let type = getType(item);
				if ( ! type) {
					// skip
					return;
				}
				assert(C.TYPES.has(type), item);
				let typemap = itemstate.data[type];
				if ( ! typemap) {
					typemap = {};
					itemstate.data[type] = typemap;
				}
				if (item.id) {
					typemap[item.id] = item;
				} else {
					console.warn("No id?!", item, "from", res);
				}
			} catch(err) {
				// swallow and carry on
				console.error(err);
			}
		});
		this.update(itemstate);
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
		Publisher: {},			
		Charity: {},
		Advert: {},
		Advertiser: {},
		Person: {},
		User: {}
	},
	focus: {
		Publisher: null,
		Advertiser: null,
		Charity: null,
		Person: null,
		User: null,
	},	
	show: {
	},
	widget: {},
	misc: {
	}
});
