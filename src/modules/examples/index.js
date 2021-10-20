import { MvuCounterList } from './components/MvuCounterList';
import { MvuCounter } from './components/MvuCounter';
import { MvuTopicItem } from './components/MvuTopicItem';
if (!window.customElements.get(MvuCounter.tag)) {
	window.customElements.define(MvuCounter.tag, MvuCounter);
}
if (!window.customElements.get(MvuTopicItem.tag)) {
	window.customElements.define(MvuTopicItem.tag, MvuTopicItem);
}
if (!window.customElements.get(MvuCounterList.tag)) {
	window.customElements.define(MvuCounterList.tag, MvuCounterList);
}

