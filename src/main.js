import globalCss from './main.css';

//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

if (process.env.LOAD_EXTERNAL_CONFIG === 'true') {
	//load external config that sets a global config object
	const configScript = document.createElement('script');
	configScript.src = './config.js';
	configScript.defer = true;
	document.head.appendChild(configScript);
}

window.enableTestIds = new URLSearchParams(window.location.search).get(QueryParameters.T_ENABLE_TEST_IDS) === 'true';

// eslint-disable-next-line no-unused-vars
import * as config from './injection/config';

// register modules
import './modules/header';
import './modules/footer';
import './modules/map';
import './modules/menu';
import './modules/toolbox';
import './modules/commons';
import './modules/search';
import './modules/topics';
import './modules/utils';
import './modules/iframe';
import './modules/uiTheme';
import './modules/modal';
import './modules/baseLayer';
import './modules/layerManager';
import './modules/notifications';
import './modules/examples';
import './modules/featureInfo';
import './modules/iconSelect';
import './modules/geoResourceInfo';
import './modules/survey';
import './modules/dndImport';
import { QueryParameters } from './services/domain/queryParameters';
