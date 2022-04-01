import globalCss from './main.css';
//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);
