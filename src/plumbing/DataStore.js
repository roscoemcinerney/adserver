
import C from '../C.js';

const DataStore = {};
export default DataStore;
// accessible to debug
if (typeof(window) !== 'undefined') window.DataStore = DataStore;

/**
 * Store all the state in one big object??
 */
DataStore.state = {};