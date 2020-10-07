import { Header } from './Header';
if (!window.customElements.get(Header.tag)) {
	window.customElements.define(Header.tag, Header);
}
