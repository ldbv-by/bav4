import { FullScreenProvider } from './FullScreenProvider';
if (!window.customElements.get(FullScreenProvider.tag)) {
	window.customElements.define(FullScreenProvider.tag, FullScreenProvider);
}
