import { WcEvents } from './domain/wcEvents';
// register required modules (same as for iframe)
import './embed';

import { PublicComponent } from './modules/public/components/PublicComponent';

// load the configuration script
const scriptEl = document.createElement('script');
scriptEl.setAttribute('src', '../config.js');
document.body.appendChild(scriptEl);

scriptEl.addEventListener('load', () => {
	if (!customElements.get(PublicComponent.tag)) {
		window.customElements.define(PublicComponent.tag, PublicComponent);
	}
	window.dispatchEvent(new CustomEvent(WcEvents.LOAD));
});
