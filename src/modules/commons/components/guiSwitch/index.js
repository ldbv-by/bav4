import { GuiSwitch } from './GuiSwitch';
if (!window.customElements.get(GuiSwitch.tag)) {
	window.customElements.define(GuiSwitch.tag, GuiSwitch);
}
