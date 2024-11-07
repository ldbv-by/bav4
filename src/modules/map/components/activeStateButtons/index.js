import { ActiveStateButtons } from './ActiveStateButtons';
if (!window.customElements.get(ActiveStateButtons.tag)) {
	window.customElements.define(ActiveStateButtons.tag, ActiveStateButtons);
}
