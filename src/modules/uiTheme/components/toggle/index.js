import { ThemeToggle } from './ThemeToggle';
if (!window.customElements.get(ThemeToggle.tag)) {
	window.customElements.define(ThemeToggle.tag, ThemeToggle);
}
