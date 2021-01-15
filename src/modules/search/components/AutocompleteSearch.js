import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { BaElement } from '../../BaElement';
import { debounced } from '../../../utils/timer';
import { $injector } from '../../../injection';
import css from './autocompleteSearch.css';

/**
 * 
 * @class
 * @author aul
 */
export class AutocompleteSearch extends BaElement {

	constructor() {
		super();
		const { SearchService } = $injector.inject('SearchService');
		this._searchService = SearchService;

		//field '_onSelect' is exposed via getter and setter
		this._onSelect = () => { };
		this._candidates = [];
		this._currentFocus=-1;
	}

	_updateCandidates(candidates) {
		this._candidates = candidates;
		this.render();
	}

	_clearCandidates() {
		this._currentFocus=-1;
		this._updateCandidates([]);
	}

	_setSearchValue(value) {
		const input = this._root.querySelector('#autoComplete');
		input.value = value;
	}

	/**
	 * Ported from https://www.w3schools.com/howto/howto_js_autocomplete.asp
	 * @param {*} input
	 * @param {*} arr 
	 */
	_autocomplete(input) {
		/*the autocomplete function takes two arguments,
		the text field element and an array of possible autocompleted values:*/
		/*execute a function when someone writes in the text field:*/
		//input.addEventListener('input', debounced(200, requestData));
		/*execute a function presses a key on the keyboard:*/
		input.addEventListener('keydown', (e) => {
			// var x = document.getElementById(this.id + 'autocomplete-list');
			let x = this._root.querySelector('#autocomplete-list');
			if (x) {
				x = x.querySelectorAll('div');
			}
			if (e.keyCode == 40) {
				/*If the arrow DOWN key is pressed,
				increase the currentFocus variable:*/
				this._currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode == 38) { //up
				/*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
				this._currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode == 13) {
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				e.preventDefault();
				if (this._currentFocus > -1) {
					/*and simulate a click on the "active" item:*/
					if (x) {
						x[this._currentFocus].click();
					}
				}
			}
		});
		const addActive = (x) => {
			/*a function to classify an item as "active":*/
			if (!x || x.length < 1) {
				return false;
			}
			/*start by removing the "active" class on all items:*/
			removeActive(x);
			if (this._currentFocus >= x.length) {
				this._currentFocus= 0;
			}
			if (this._currentFocus < 0) {
				this._currentFocus= (x.length - 1);
			}
			/*add class "autocomplete-active":*/
			x[this._currentFocus].classList.add('autocomplete-active');
		};
		const removeActive = (x) => {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
				x[i].classList.remove('autocomplete-active');
			}
		};

		document.addEventListener('click', () => {
			this._clearCandidates();
		});
	}


	/**
	 * @override
	 */
	onWindowLoad() {
		this._autocomplete(this._root.querySelector('#autoComplete'));
	}


	/**
	 * @override
	 */
	createView() {
		let inputText = this._onSelect.label ? this._onSelect.label : '';
		const requestData = (e) => {
			let val = e.target.value;
			if (!val) {
				this._clearCandidates();
				return false;
			}

			this._searchService.getData(val)
				.then((data) => {
					if (data) {
						this._updateCandidates(data);
					}
				});
		};
		const onInput = (e) => debounced(200, requestData(e));

		const onClickCandidate = (e) => {
			const selected = this._candidates[e.target.closest('div').getAttribute('index')];
			this._onSelect(selected);
			this._setSearchValue(selected.label);
			this._clearCandidates();
		};
		
		return html`
		 <style>${css}</style>
		 <div class="autocomplete">
			<input id='autoComplete' .value=${inputText} @input=${onInput}/>
			${this._candidates ? html`<div id='autocomplete-list' class='autocomplete-items'>${repeat(this._candidates, (candidate) => candidate.id, (candidate, index) => html`
			<div index=${index} @click=${onClickCandidate} >${unsafeHTML(candidate.labelFormated)}</div>
		  `)}</div>`: html`` } 
		 </div>
		`;

	}

	set onSelect(callback) {
		this._onSelect = callback;
	}

	get onSelect() {
		return this._onSelect;
	}

	static get tag() {
		return 'ba-autocomplete-search';
	}
}