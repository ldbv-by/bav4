// set global css
import './injection/config.globe';
import globalCss from './main.css';
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

// register required modules
import './modules/csMap';
