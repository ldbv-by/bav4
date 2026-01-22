// initialize DI
import './injection/config.admin';
// register global i18n
import './i18n';

// set global css
import globalCss from './main.css?inline';
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

// register required modules here:
import './modules/uiTheme';
import './modules/commons';
import './modules/modal';
import './modules/stackables';
import './modules/admin';
