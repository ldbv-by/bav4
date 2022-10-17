import { QueryParameters } from './domain/queryParameters';
import globalCss from './main.css';

//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

window.ba_enableTestIds = new URLSearchParams(window.location.search).get(QueryParameters.T_ENABLE_TEST_IDS) === 'true';

// eslint-disable-next-line no-unused-vars
import * as config from './injection/config';

// register modules
import './modules/header';
import './modules/footer';
import './modules/map';
import './modules/olMap';
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
import './modules/auth';

