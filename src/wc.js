// register required modules (same as for iframe)
import { WcEvents } from './domain/wcEvents';
import './embed';

import { PublicComponent } from './modules/public/components/PublicComponent';

if (!customElements.get(PublicComponent.tag)) {
	window.customElements.define(PublicComponent.tag, PublicComponent);
}
window.dispatchEvent(new CustomEvent(WcEvents.LOAD));
