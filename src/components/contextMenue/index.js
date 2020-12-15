import { ContextMenue } from './ContextMenue';
if (!window.customElements.get(ContextMenue.tag)) {
	window.customElements.define(ContextMenue.tag, ContextMenue);
}