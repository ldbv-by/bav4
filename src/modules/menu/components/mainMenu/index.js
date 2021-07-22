import { MainMenu } from './MainMenu';
if (!window.customElements.get(MainMenu.tag)) {
	window.customElements.define(MainMenu.tag, MainMenu);
}
