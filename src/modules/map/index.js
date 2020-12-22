import './components/zoomButtons';
import { OlMap } from './components/OlMap';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}
