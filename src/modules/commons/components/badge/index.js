import { Badge } from './Badge';
if (!window.customElements.get(Badge.tag)) {
	window.customElements.define(Badge.tag, Badge);
}
