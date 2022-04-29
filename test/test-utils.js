import { combineReducers, createStore } from 'redux';
import { $injector } from '../src/injection';

class TestableBlob extends Blob {

	constructor(data, mimeType, size) {
		super([data], { type: mimeType });
		this._size = size;
		this._data = data;
	}

	get size() {
		return this._size;
	}

	/**
	 * @override
	 * @returns {string}
	 */
	text() {
		return this._data;
	}
}
export class TestUtils {
	/**
	 * Renders a given element with provided attributes
	 * and returns a promise which resolves as soon as
	 * rendered element becomes available.
	 * @param {string} tag
	 * @param {object} attributes
	 * @returns {Promise<HTMLElement>}
	 */
	static render(tag, attributes = {}, slotContent = '') {
		TestUtils._renderToDocument(tag, attributes, slotContent);
		return TestUtils._waitForComponentToRender(tag);
	}


	/**
	 * Replaces document's body with provided element
	 * including given attributes.
	 * @param {string} tag
	 * @param {object} attributes
	 */
	static _renderToDocument(tag, attributes, slotContent) {
		const htmlAttributes = TestUtils._mapObjectToHTMLAttributes(attributes);
		document.body.innerHTML = `<${tag} ${htmlAttributes}>${slotContent}</${tag}>`;
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
					//we have to fire this event manually
					if (element.onWindowLoad) {
						element.onWindowLoad();
					}
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


	/**
	 * Returns a MediaQueryList object
	 * @param {boolean} shouldMatch true if this MediaQueryList should match
	 * @returns {MediaQueryList}
	 */
	static newMediaQueryList(shouldMatch) {
		return {
			addEventListener(type, listener) {
				listener({ matches: shouldMatch });
			},
			removeEventListener() { },
			matches: shouldMatch
		};
	}

	/**
	 * Returns a testable Blob-object with faked size and text()-method
	 * @param {*} data the blob-data
	 * @param {*} mimeType the MIMEtype of the returned Blob
	 * @param {*} size the size
	 * @returns {Blob}
	 */
	static newBlob(data = null, mimeType = '', size = 0) {

		return new TestableBlob(data, mimeType, size);
	}

	/**
	 * Fires a new {@see TouchEvent} on the specified event source element. If TouchEvents are not supported,
	 * MouseEvents are used instead. This currently affects Firefox only, due to the fact that FirefoxHeadless
	 * does not provide support for TouchEvents for now.
	 *
	 * @param {'touchstart'|'touchmove'|'touchend'} type the specified TouchEvent-Type
	 * @param {HTMLElement} eventSource the element which should dispatch the event
	 * @param {number} x the x-value of the touch-coordinate
	 * @param {number} y the y-value of the touch-coordinate
	 * @param {number} touchCount the count of simulated touches
	 */
	static simulateTouchEvent(type, eventSource = document, x, y, touchCount = 1) {
		const touchEventSupported = () => window.TouchEvent ? true : false;
		const repeat = (toRepeat, amount) => {
			return Array(amount).fill(toRepeat);
		};
		if (touchEventSupported()) {
			const eventType = type;
			const touches = repeat({ screenX: x, screenY: y, clientX: x, clientY: y }, touchCount);
			const event = new Event(eventType);
			event.touches = [...touches];
			event.changedTouches = [...touches];

			eventSource.dispatchEvent(event);
		}
		const translateToMouseEventType = (touchEventType) => {
			switch (touchEventType) {
				case 'touchstart':
					return 'mousedown';
				case 'touchmove':
					return 'mousemove';
				case 'touchend':
					return 'mouseup';
			}
			return null;
		};

		const mouseEventType = translateToMouseEventType(type);
		if (mouseEventType) {
			const event = new MouseEvent(mouseEventType, { screenX: x, screenY: y, clientX: x, clientY: y });
			eventSource.dispatchEvent(event);
		}
	}

	/**
	 * Sets a timeout timer and returns a Promise which will be resolved after the timeout function was executed.
	 * @param {number} ms timeout in ms (default is 0)
	 * @returns{Promise}
	 */
	static async timeout(ms = 0) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

}
