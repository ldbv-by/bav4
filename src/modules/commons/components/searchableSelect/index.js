import { SearchableSelect } from './SearchableSelect';
if (!window.customElements.get(SearchableSelect.tag)) {
	window.customElements.define(SearchableSelect.tag, SearchableSelect);
}
