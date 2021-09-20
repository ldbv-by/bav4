import { MvpCounter } from './MvpCounter';
if (!window.customElements.get(MvpCounter.tag)) {
	window.customElements.define(MvpCounter.tag, MvpCounter);
}
import { MvuCounter } from './MvuCounter';
if (!window.customElements.get(MvuCounter.tag)) {
	window.customElements.define(MvuCounter.tag, MvuCounter);
}
