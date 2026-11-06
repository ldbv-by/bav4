import { CsGlobe } from './components/CsGlobe';

if (!window.customElements.get(CsGlobe.tag)) {
	window.customElements.define(CsGlobe.tag, CsGlobe);
}
