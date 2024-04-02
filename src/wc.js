// register required modules (same as for iframe)
import './embed';

import { BvvComponent } from './modules/wc/components/BvvComponent';

if (!customElements.get(BvvComponent.tag)) {
	window.customElements.define(BvvComponent.tag, BvvComponent);
}
