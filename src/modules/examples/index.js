import { MvuList } from './components/MvuList';
import { MvuCounter } from './components/MvuCounter';
import { MvuListItem } from './components/MvuListItem';
if (!window.customElements.get(MvuCounter.tag)) {
	window.customElements.define(MvuCounter.tag, MvuCounter);
}
if (!window.customElements.get(MvuListItem.tag)) {
	window.customElements.define(MvuListItem.tag, MvuListItem);
}
if (!window.customElements.get(MvuList.tag)) {
	window.customElements.define(MvuList.tag, MvuList);
}
