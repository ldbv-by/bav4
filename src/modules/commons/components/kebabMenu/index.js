import { KebabMenu } from './KebabMenu';
if (!window.customElements.get(KebabMenu.tag)) {
    window.customElements.define(KebabMenu.tag, KebabMenu);
}
