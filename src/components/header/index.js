import { HeaderElement } from './HeaderElement';
if (!window.customElements.get(HeaderElement.tag)) {
    window.customElements.define(HeaderElement.tag, HeaderElement);
}
