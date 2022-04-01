import globalCss from './main.css';

//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

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
import './modules/help';
import './modules/dndImport';

if ('serviceWorker' in navigator) {

	(async () => {
		await navigator
			.serviceWorker
			.register('sw.js');
		// eslint-disable-next-line no-console
		console.log('SW registration successful');
	})();
}
