import { SearchContentPanel } from './components/menu/SearchContentPanel';
if (!window.customElements.get(SearchContentPanel.tag)) {
	window.customElements.define(SearchContentPanel.tag, SearchContentPanel);
}