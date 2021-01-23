import { ShowCase } from './ShowCase';
if (!window.customElements.get(ShowCase.tag)) {
	window.customElements.define(ShowCase.tag, ShowCase);
}