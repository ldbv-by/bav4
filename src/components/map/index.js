import { OlMapElement } from './OlMapElement';
if (!window.customElements.get(OlMapElement.tag)) {
    window.customElements.define(OlMapElement.tag, OlMapElement);
}
