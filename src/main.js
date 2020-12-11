import globalCss from './main.css';

//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

// eslint-disable-next-line no-unused-vars
import * as config from './injection/config';

import './components/header';
import './components/footer';
import './components/map';
import './components/footer/components/mapInfo';
import './components/toolbox/zoomButtons';
import './components/menue/sidePanel';
import './components/toolbox/button';
import './components/toolbox/search/autocomplete';
import './components/contextMenue/ContextMenue';
