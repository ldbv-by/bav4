import { GuiSwitch } from './Toggle2';
if (!window.customElements.get(GuiSwitch.tag)) {
	window.customElements.define(GuiSwitch.tag, GuiSwitch);
}
