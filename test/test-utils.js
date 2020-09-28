import { combineReducers, createStore } from 'redux';
import { $injector } from '../src/injection';


export class TestUtils {
	/**
	 * Renders a given element with provided attributes
	 * and returns a promise which resolves as soon as
	 * rendered element becomes available.
	 * @param {string} tag
	 * @param {object} attributes
	 * @returns {Promise<HTMLElement>}
	 */
	static render(tag, attributes = {}) {
		TestUtils._renderToDocument(tag, attributes);
		return TestUtils._waitForComponentToRender(tag);
	}


	/**
	 * Replaces document's body with provided element
	 * including given attributes.
	 * @param {string} tag
	 * @param {object} attributes
	 */
	static _renderToDocument(tag, attributes) {
		const htmlAttributes = TestUtils._mapObjectToHTMLAttributes(attributes);
		document.body.innerHTML = `<${tag} ${htmlAttributes}></${tag}>`;
	}

	/**
	 * Converts an object to HTML string representation of attributes.
	 *
	 * For example: `{ foo: "bar", baz: "foo" }`
	 * becomes `foo="bar" baz="foo"`
	 *
	 * @param {object} attributes
	 * @returns {string}
	 */
	static _mapObjectToHTMLAttributes(attributes) {
		return Object.entries(attributes).reduce((previous, current) => {
			return previous + ` ${current[0]}="${current[1]}"`;
		}, '');
	}

	/**
	 * Returns a promise which resolves as soon as
	 * requested element becomes available.
	 * @param {string} tag
	 * @returns {Promise<HTMLElement>}
	 */
	static async _waitForComponentToRender(tag, _document = document, _window = window) {
		return new Promise(resolve => {
			function requestComponent() {
				const element = _document.querySelector(tag);
				if (element) {
					resolve(element);
				}
				else {
					_window.requestAnimationFrame(requestComponent);
				}
			}
			requestComponent();
		});
	}

	/**
	 * Sets up the store and registers the store service at the injector.
	 * @param {object} state
	 * @param {object | object[] | undefined} reducer as reducer object, array of reducer objects or undefined (see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers)
	 * @returns the store
	 */
	static setupStoreAndDi(state = {}, reducer) {

		const store = reducer
			? createStore(
				combineReducers(reducer),
				state)
			//noop reducer
			: createStore(state => state, state);

		$injector
			.reset()
			.registerSingleton('StoreService', {
				getStore: () => store
			});

		return store;
	}

}
