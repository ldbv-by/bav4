import { ChipsContainer } from './components/chipsContainer/ChipsContainer';
if (!window.customElements.get(ChipsContainer.tag)) {
	window.customElements.define(ChipsContainer.tag, ChipsContainer);
}
import { AssistChips } from './components/assistChips/AssistChips';
if (!window.customElements.get(AssistChips.tag)) {
	window.customElements.define(AssistChips.tag, AssistChips);
}
