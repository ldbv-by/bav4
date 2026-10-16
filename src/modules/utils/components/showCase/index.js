import { ShowCase } from './ShowCase';
import { VectorDataStylingTestPanel } from './testPanels/VectorDataStylingTestPanel';

if (!window.customElements.get(VectorDataStylingTestPanel.tag)) {
	window.customElements.define(VectorDataStylingTestPanel.tag, VectorDataStylingTestPanel);
}
if (!window.customElements.get(ShowCase.tag)) {
	window.customElements.define(ShowCase.tag, ShowCase);
}
