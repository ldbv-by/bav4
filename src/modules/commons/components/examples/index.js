import { MvuCounter } from './MvuCounter';
if (!window.customElements.get(MvuCounter.tag)) {
	window.customElements.define(MvuCounter.tag, MvuCounter);
}
