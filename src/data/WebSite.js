// https://schema.org/WebSite

import _ from 'lodash';
import {isa} from './DataClass';

const WebSite = {};
export default WebSite;


WebSite.isa = (site) => isa(site, 'WebSite');

/** Schema.org */
WebSite.publisher = (site) => isa(site, 'WebSite') && site.publisher;

/** Non Standard */
WebSite.domain = (site) => isa(site, 'WebSite') && site.domain;

