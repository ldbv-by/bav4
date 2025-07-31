// initialize DI
import './injection/config.admin';
// register global i18n
import './i18n';

// set global css
import globalCss from './main.css';
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

// register required modules here:
