import { IframeGenerator } from './IframeGenerator';

if (!window.customElements.get(IframeGenerator.tag)) {
	window.customElements.define(IframeGenerator.tag, IframeGenerator);
}
