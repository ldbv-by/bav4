import { Spinner } from './Spinner';
if (!window.customElements.get(Spinner.tag)) {
	window.customElements.define(Spinner.tag, Spinner);
}
