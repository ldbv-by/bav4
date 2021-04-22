import { AutocompleteSearch } from './components/AutocompleteSearch';
if (!window.customElements.get(AutocompleteSearch.tag)) {
	window.customElements.define(AutocompleteSearch.tag, AutocompleteSearch);
}
import { SearchContentPanel } from './components/menu/SearchContentPanel';
if (!window.customElements.get(SearchContentPanel.tag)) {
	window.customElements.define(SearchContentPanel.tag, SearchContentPanel);
}