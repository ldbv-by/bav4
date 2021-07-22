import { ContextMenue } from './components/ContextMenue';
if (!window.customElements.get(ContextMenue.tag)) {
	window.customElements.define(ContextMenue.tag, ContextMenue);
}
