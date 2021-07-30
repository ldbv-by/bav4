import { GeolocationButton } from './GeolocationButton';
if (!window.customElements.get(GeolocationButton.tag)) {
	window.customElements.define(GeolocationButton.tag, GeolocationButton);
}
