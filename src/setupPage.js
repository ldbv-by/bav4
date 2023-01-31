// initialize DI
import './injection/config';
// register global i18n
import './i18n';

import { QueryParameters } from './domain/queryParameters';

// set global css
import globalCss from './main.css';
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

window.ba_enableTestIds = new URLSearchParams(window.location.search).get(QueryParameters.T_ENABLE_TEST_IDS) === 'true';
