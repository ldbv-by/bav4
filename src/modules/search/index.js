import { AutocompleteSearch } from './components/AutocompleteSearch';
if (!window.customElements.get(AutocompleteSearch.tag)) {
	window.customElements.define(AutocompleteSearch.tag, AutocompleteSearch);
}
