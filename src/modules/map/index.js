import './i18n';
import './components/zoomButtons';
import './components/layerManager';

import { OlMap } from './components/OlMap';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}