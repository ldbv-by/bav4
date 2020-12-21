import { Header } from './components/Header';
if (!window.customElements.get(Header.tag)) {
	window.customElements.define(Header.tag, Header);
}
