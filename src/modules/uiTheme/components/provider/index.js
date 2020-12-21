import { ThemeProvider } from './ThemeProvider';
if (!window.customElements.get(ThemeProvider.tag)) {
	window.customElements.define(ThemeProvider.tag, ThemeProvider);
}
