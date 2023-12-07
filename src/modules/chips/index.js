import './i18n';
import './components/assistChips';
import { ChipsContainer } from './components/chipsContainer/ChipsContainer';
if (!window.customElements.get(ChipsContainer.tag)) {
	window.customElements.define(ChipsContainer.tag, ChipsContainer);
}
