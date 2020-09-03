import { FooterElement } from './FooterElement';
if (!window.customElements.get(FooterElement.tag)) {
    window.customElements.define(FooterElement.tag, FooterElement);
}
