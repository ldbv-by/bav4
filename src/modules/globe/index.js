import { Globe } from './Globe';

if (!window.customElements.get(Globe.tag)) {
	window.customElements.define(Globe.tag, Globe);
}
