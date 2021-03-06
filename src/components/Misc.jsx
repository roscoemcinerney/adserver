import React from 'react';
import ReactDOM from 'react-dom';

import {assert} from 'sjtest';
import _ from 'lodash';

import printer from '../utils/printer.js';
import C from '../C.js';

import {FormControl,Checkbox,Textarea} from 'react-bootstrap';
import ActionMan from '../plumbing/ActionMan';

// console.warn("TODO use i18n", i18n);

const Misc = {};

/**
E.g. "Loading your settings...""
*/
Misc.Loading = ({text}) => (
	<div>
		<span className="glyphicon glyphicon-cd spinning" /> Loading {text || ''}...
	</div>
);


const CURRENCY = {
	"GBP": "£",
	"USD": "$"
};
Misc.Money = ({amount, precision}) => {
	if (_.isNumber(amount) || _.isString(amount)) {
		amount = {value: amount, currency:'GBP'};
	}
	return <span>{CURRENCY[amount.currency] || ''}{printer.prettyNumber(amount.value)}</span>;
};
/**
 * Handle a few formats, inc gson-turned-a-Time.java-object-into-json
 */
Misc.Time = ({time}) => {
	try {
		if (_.isString(time)) {
			return <span>{new Date(time).toLocaleDateString()}</span>;			
		}
		if (time.ut) {
			return <span>{new Date(time.ut).toLocaleDateString()}</span>;
		}
		return <span>{printer.str(time)}</span>;
	} catch(err) {
		return <span>{printer.str(time)}</span>;
	}
};

/** eg a Twitter logo */
Misc.Logo = ({service, size, transparent}) => {
	assert(service);
	let klass = "img-rounded logo";
	if (size) klass += " logo-"+size;
	let file = '/img/'+service+'-logo.svg';
	if (service === 'instagram') file = '/img/'+service+'-logo.png';
	if (service === 'goodloop') {
		file = '/img/logo.png';
		// if (transparent === false) file = '/img/SoGive-Light-70px.png';
	}
	return (
		<img alt={service} data-pin-nopin="true" className={klass} src={file} />
	);
}; // ./Logo

Misc.PropControl = ({prop,path,item, type, bg}) => {
	if ( ! item) item = {};
	const value = item[prop]===undefined? '' : item[prop];
	if (type==='Checkbox') {
		return <Checkbox checked={item[prop]} onChange={e => ActionMan.setDataValue(_.concat(path, prop), e.target.checked)} />;
	}
	if (type==='MonetaryAmount') {
		let v100 = (item[prop] && item[prop].value100) || 0;
		let path2 = path.slice().concat([prop, 'value100']);
		return <FormControl name={prop} value={v100} onChange={e => ActionMan.setDataValue(path2, e)} />;
	}
	const onChange = e => ActionMan.setDataValue(_.concat(path, prop), e);
	if (type==='textarea') {
		return <FormControl componentClass="textarea" name={prop} value={value} onChange={onChange} />;
	}
	if (type==='img') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} />
			<div className='pull-right' style={{background: bg, padding:bg?'20px':'0'}}><Misc.ImgThumbnail url={value} /></div>
			<div className='clearfix' />
		</div>);
	}
	if (type==='url') {
		return (<div>
			<FormControl type='url' name={prop} value={value} onChange={onChange} />
			<div className='pull-right'><Misc.SiteThumbnail url={value} /></div>
			<div className='clearfix' />
		</div>);
	}
	// normal
	return <FormControl name={prop} value={value} onChange={onChange} />;
};

Misc.SiteThumbnail = ({url}) => url? <a href={url} target='_blank'><iframe style={{width:'150px',height:'100px'}} src={url} /></a> : null;

Misc.ImgThumbnail = ({url}) => url? <img className='logo' src={url} /> : null;

export default Misc;
