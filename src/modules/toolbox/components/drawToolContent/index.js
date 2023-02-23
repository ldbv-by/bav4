import { DrawToolContent } from './DrawToolContent';

if (!window.customElements.get(DrawToolContent.tag)) {
	window.customElements.define(DrawToolContent.tag, DrawToolContent);
}
