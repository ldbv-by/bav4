import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { BaElement } from '../../BaElement';
import { debounced } from '../../../utils/timer';
import css from './autocompleteSearch.css';

/**
 * Configurable Attributes:
 * 
 * Observed Attributes:
 * 
 * Configurable Properties:
 * - `provider` (SearchResult provider function)
 * - `onSelect() (callback function)`
 * 
 * Observed Properties:
 * 
 * @class
 * @author aul
 */
export class AutocompleteSearch extends BaElement {

	constructor() {
		super();

		this._candidates = [];
		this._currentFocus = -1;
		// this._provider = async () =>  [];
		this._provider = null;
	}

	/**
	 * @private
	 */
	_updateCandidates(candidates) {
		this._candidates = candidates;
		this.render();
	}

	/**
	 * @private
	 */
	_clearCandidates() {
		this._currentFocus = -1;
		this._updateCandidates([]);
	}

	/**
	 * @private
	 */
	_setSearchValue(value) {
		const input = this._root.querySelector('#autoComplete');
		input.value = value;
	}

	/** 
	 * @override
	 */
	onAfterRender(firsttime) {
		if (firsttime) {
			document.addEventListener('click', () => {
				this._clearCandidates();
			});
		}
	}

	/**
	 * @override
	 */
	createView() {
		// let inputText = this._onSelect.label ? this._onSelect.label : '';
		const requestData = (e) => {
			const val = e.target.value;
			if (this.provider) {
				if (val.trim().length > 2) {
					this.provider(val)
						.then(data => {
							if (data) {
								this._updateCandidates(data);
							}
						}, reason => {
							this._clearCandidates();
							console.warn(reason);
						});
				}
			}
			else {
				console.warn('No SearchResult provider found.');
			}

		};

		const addActive = (x) => {
			/*a function to classify an item as "active":*/
			if (!x || x.length < 1) {
				return false;
			}
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (this._currentFocus >= x.length) {
				this._currentFocus = 0;
			}
			if (this._currentFocus < 0) {
				this._currentFocus = (x.length - 1);
			}
			/*add class "autocomplete-active":*/
			x[this._currentFocus].classList.add('autocomplete-active');
		};
		const removeActive = (x) => {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (let i = 0; i < x.length; i++) {
				x[i].classList.remove('autocomplete-active');
			}
		};

		const onInput = (e) => debounced(200, requestData(e));
		const onClick = (candidate) => {
			this.onSelect(candidate);
			this._setSearchValue(candidate.label);
			this._clearCandidates();
		};

		const onKeyDown = (e) => {
			let x = this._root.querySelector('#autocomplete-list');
			if (x) {
				x = x.querySelectorAll('div');
			}
			if (e.keyCode === 40) {
				/*If the arrow DOWN key is pressed,
				increase the currentFocus variable:*/
				this._currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode === 38) { //up
				/*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
				this._currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode === 13) {
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				e.preventDefault();
				if (this._currentFocus > -1) {
					/*and simulate a click on the "active" item:*/
					if (x) {
						x[this._currentFocus].click();
					}
				}
			}
		};

		return html`
		 <style>${css}</style>
		 <div class="autocomplete">
			<input id='autoComplete'  @input=${onInput} @keydown=${onKeyDown}/>
			${html`<div id='autocomplete-list' class='autocomplete-items'>${repeat(this._candidates, (candidate) => candidate.id, (candidate, index) => html`
			<div index=${index} @click=${() => onClick(candidate)} >${unsafeHTML(candidate.labelFormated)}</div>
		  `)}</div>`} 
		 </div>
		`;
	}

	static get tag() {
		return 'ba-autocomplete-search';
	}
}