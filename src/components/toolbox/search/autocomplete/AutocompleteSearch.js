import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { debounced } from '../../../../utils/timer';
import { $injector } from '../../../../injection';
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
	}


	/**
	 * Ported from https://www.w3schools.com/howto/howto_js_autocomplete.asp
	 * @param {*} input
	 * @param {*} arr 
	 */
	_autocomplete(input) {
		let currentData = [];

		const requestAndShowData = () => {
			let a, b, i, val = input.value;
			/*close any already open lists of autocompleted values*/
			closeAllLists();
			if (!val) {
				return false;
			}
			currentFocus = -1;
			/*create a DIV element that will contain the items (values):*/
			a = document.createElement('DIV');
			a.setAttribute('id', 'autocomplete-list');
			a.setAttribute('class', 'autocomplete-items');
			/*append the DIV element as a child of the autocomplete container:*/
			input.parentNode.appendChild(a);
			/*for each item in the array...*/
			this._searchService.getData(val)
				.then((data) => {
					currentData = data;
					for (i = 0; i < currentData.length; i++) {
						b = document.createElement('DIV');
						b.insertAdjacentHTML('beforeend', currentData[i].labelFormated);
						b.setAttribute('index', i);
						b.addEventListener('click', (e) => {
							const selected = currentData[e.target.closest('div').getAttribute('index')];
							input.value = selected.label;
							this._onSelect(selected);
							closeAllLists();
						});
						a.appendChild(b);
					}
				});

		};

		/*the autocomplete function takes two arguments,
		the text field element and an array of possible autocompleted values:*/
		let currentFocus;
		/*execute a function when someone writes in the text field:*/
		input.addEventListener('input', debounced(200, requestAndShowData));
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
				currentFocus++;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode == 38) { //up
				/*If the arrow UP key is pressed,
				decrease the currentFocus variable:*/
				currentFocus--;
				/*and and make the current item more visible:*/
				addActive(x);
			}
			else if (e.keyCode == 13) {
				/*If the ENTER key is pressed, prevent the form from being submitted,*/
				e.preventDefault();
				if (currentFocus > -1) {
					/*and simulate a click on the "active" item:*/
					if (x) {
						x[currentFocus].click();
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
			if (currentFocus >= x.length) {
				currentFocus = 0;
			}
			if (currentFocus < 0) {
				currentFocus = (x.length - 1);
			}
			/*add class "autocomplete-active":*/
			x[currentFocus].classList.add('autocomplete-active');
		};
		const removeActive = (x) => {
			/*a function to remove the "active" class from all autocomplete items:*/
			for (var i = 0; i < x.length; i++) {
				x[i].classList.remove('autocomplete-active');
			}
		};
		const closeAllLists = (elmnt) => {
			/*close all autocomplete lists in the document,
			except the one passed as an argument:*/
			var x = this._root.querySelectorAll('.autocomplete-items');
			for (var i = 0; i < x.length; i++) {
				if (elmnt != x[i] && elmnt != input) {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		};
		document.addEventListener('click', (e) => {
			closeAllLists(e.target);
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
		return html`
		 <style>${css}</style>
		 <div class="autocomplete">
			<input id='autoComplete'/>
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