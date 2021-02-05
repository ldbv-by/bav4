import './i18n';
import './components/zoomButtons';
import './components/infoButton';
import './components/extentButton';
import { OlMap } from './components/OlMap';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}
