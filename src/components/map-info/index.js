import { MapInfoElement } from './MapInfoElement';
if (!window.customElements.get(MapInfoElement.tag)) {
    window.customElements.define(MapInfoElement.tag, MapInfoElement);
}
