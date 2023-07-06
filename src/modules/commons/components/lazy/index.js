import { LazyLoadWrapper } from './LazyLoadWrapper';
if (!window.customElements.get(LazyLoadWrapper.tag)) {
	window.customElements.define(LazyLoadWrapper.tag, LazyLoadWrapper);
}
