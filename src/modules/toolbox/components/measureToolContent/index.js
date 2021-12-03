import { MeasureToolContent } from './MeasureToolContent';
import { ShareMeasureDialog } from './ShareMeasureDialog';
import { ShareButton } from './ShareButton';

if (!window.customElements.get(ShareButton.tag)) {
	window.customElements.define(ShareButton.tag, ShareButton);
}

if (!window.customElements.get(MeasureToolContent.tag)) {
	window.customElements.define(MeasureToolContent.tag, MeasureToolContent);
}
if (!window.customElements.get(ShareMeasureDialog.tag)) {
	window.customElements.define(ShareMeasureDialog.tag, ShareMeasureDialog);
}
