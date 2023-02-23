import { IFrameGenerator } from './IFrameGenerator';

if (!window.customElements.get(IFrameGenerator.tag)) {
	window.customElements.define(IFrameGenerator.tag, IFrameGenerator);
}
