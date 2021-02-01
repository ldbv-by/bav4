import { Icon } from './Icon';
if (!window.customElements.get(Icon.tag)) {
	window.customElements.define(Icon.tag, Icon);
}