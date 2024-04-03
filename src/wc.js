// register required modules (same as for iframe)
import './embed';

import { PublicComponent } from './modules/public/components/PublicComponent';

if (!customElements.get(PublicComponent.tag)) {
	window.customElements.define(PublicComponent.tag, PublicComponent);
}
