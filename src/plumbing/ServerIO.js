/** 
 * Wrapper for server calls.
 *
 */
import _ from 'lodash';
import $ from 'jquery';
import {SJTest, assert, assMatch} from 'sjtest';
import C from '../C.js';
import DataStore from './DataStore';
import Login from 'hooru';
import {XId} from 'wwutils';

const ServerIO = {};
export default ServerIO;

// for debug
window.ServerIO = ServerIO;
const BURL = '/';

ServerIO.getPublisher = function(id) {
	assMatch(id, String);
	return ServerIO.load('/publisher/'+id+'.json');
};
ServerIO.savePublisher = function(publisher) {
	let params = {
		method: 'POST',
		data: {
			action: 'save',			
			publisher: JSON.stringify(publisher)
		}
	};
	return ServerIO.load('/publisher/'+publisher.id+'.json', params);
};
ServerIO.saveAdvert = function(publisher) {
	let params = {
		method: 'POST',
		data: {
			action: 'save',			
			vert: JSON.stringify(publisher)
		}
	};
	// "advert"" can fall foul of adblocker!
	return ServerIO.load('/vert/'+publisher.id+'.json', params);
};

const getServlet = (type) => {
	type = type.toLowerCase();
	if (type==='advert') return 'vert';
	return type;
};

ServerIO.search = function(type, filter) {
	assert(C.TYPES.has(type), type);
	let servlet = getServlet(type);
	let url = '/'+servlet+'/list.json';
	let params = {
		data: {}
	};
	if (filter) params.data.filter = JSON.stringify(filter);	
	return ServerIO.load(url, params);
};

/**
 * Submits an AJAX request. This is the key base method
 *
 * @param {String} url The url to which the request should be made.
 *
 * @param {Object} [params] Optional map of settings to modify the request.
 * See <a href="http://api.jquery.com/jQuery.ajax/">jQuery.ajax</a> for details.
 * IMPORTANT: To specify form data, use params.data
 *
 * To swallow any messages returned by the server - use params.swallow=true
 *
 * @returns A <a href="http://api.jquery.com/jQuery.ajax/#jqXHR">jqXHR object</a>.
**/
ServerIO.load = function(url, params) {
	assMatch(url,String);
	console.log("ServerIO.load", url, params);
	params = ServerIO.addDefaultParams(params);
	if ( ! params.data) params.data = {};
	// sanity check: no Objects except arrays
	_.values(params.data).map(
		v => assert( ! _.isObject(v) || _.isArray(v), v)
	);
	// add the base
	if (url.substring(0,4) !== 'http' && ServerIO.base) {
		url = ServerIO.base + url;
	}
	params.url = url;
	// send cookies
	params.xhrFields = {withCredentials: true};
	// add auth
	if (Login.isLoggedIn()) {
		params.data.as = Login.getId();
		params.data.jwt = Login.getUser().jwt;
	}
	// debug: add stack
	if (window.DEBUG) {
		try {
			const stack = new Error().stack;			
			// stacktrace, chop leading "Error at Object." bit
			params.data.stacktrace = (""+stack).replace(/\s+/g,' ').substr(16);
		} catch(error) {
			// oh well
		}
	}
	// Make the ajax call
	let defrd = $.ajax(params); // The AJAX request.
	if (params.swallow) {
		// no message display
		return defrd;
	}
	defrd = defrd
			.then(ServerIO.handleMessages)
			.fail(function(response, huh, bah) {
				console.error('fail',url,params,response,huh,bah);
				// ServerIO.ActionMan.perform({
				// 	verb:C.action.notify,
				// 	messages:[{
				// 		type:'error',
				// 		text:'Failed to load: '+url
				// 	}]
				// });
				return response;
			}.bind(this));
	return defrd;
};

ServerIO.post = function(url, data) {
	return ServerIO.load(url, {data, method:'POST'});
};

ServerIO.handleMessages = function(response) {
	console.log('handleMessages',response);
	const newMessages = response && response.messages;
	if ( ! newMessages || newMessages.length===0) {
		return response;
	}
	ServerIO.ActionMan.perform({verb:C.action.notify, messages:newMessages});
	return response;
};

ServerIO.addDefaultParams = function(params) {
	if ( ! params) params = {};
	if ( ! params.data) params.data = {};
	return params;
};
