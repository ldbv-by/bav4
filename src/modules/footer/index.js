import './components/coordinateSelect';
import './components/mapInfo';
import { Footer } from './components/Footer';
if (!window.customElements.get(Footer.tag)) {
	window.customElements.define(Footer.tag, Footer);
}
