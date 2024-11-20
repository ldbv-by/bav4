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

/**
 * In order to prevent iOS double-tap-to-zoom action we disable the dblclick listener globally.
 * Note: Currently we do not a dblclick listener anywhere, so we can disable it for all Browsers.
 * See also https://gist.github.com/johan/2047491?permalink_comment_id=4089461#gistcomment-4089461
 */
document.addEventListener(
	'dblclick',
	(event) => {
		event.preventDefault();
	},
	{ passive: false }
);

window.ba_enableTestIds = new URLSearchParams(window.location.search).get(QueryParameters.T_ENABLE_TEST_IDS) === 'true';
