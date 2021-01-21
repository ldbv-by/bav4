import './i18n';
import './components/zoomButtons';
import './components/layerManager';
import { OlMap } from './components/OlMap';
if (!window.customElements.get(OlMap.tag)) {
	window.customElements.define(OlMap.tag, OlMap);
}
// fixme: to get temporary layers, while store is not connected to backend-data
/* import { addLayer } from './store/layers/layers.action';

addLayer('layer1', {
	label: 'LayerOne',
	visible: true,
	zIndex: 1,
	opacity: 1
});
addLayer('layer2', {
	label: 'LayerTwo',
	visible: false,
	zIndex: 2,
	opacity: 1
});

addLayer('layer3', {
	label: 'LayerThree',
	visible: true,
	zIndex: 3,
	opacity: 1
}); */