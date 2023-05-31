import './i18n';
import './components/coordinateSelect';
import './components/mapInfo';
import './components/baseLayerInfo';
import './components/privacyPolicy';
import { Footer } from './components/Footer';
if (!window.customElements.get(Footer.tag)) {
	window.customElements.define(Footer.tag, Footer);
}
