import { MvuCounterList } from './MvuCounterList';
import { MvuCounter } from './MvuCounter';
if (!window.customElements.get(MvuCounter.tag)) {
	window.customElements.define(MvuCounter.tag, MvuCounter);
}
if (!window.customElements.get(MvuCounterList.tag)) {
	window.customElements.define(MvuCounterList.tag, MvuCounterList);
}
