import { render } from 'lit-html';
import { combineReducers, createStore } from 'redux';
import { $injector } from '../src/injection';
import { isTemplateResult } from '../src/utils/checks';
import { LOG_LIFECYLE_ATTRIBUTE_NAME } from '../src/utils/markup';

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
	 * Renders an already registered {@link HTMLElement}
	 * and returns a promise which resolves as soon as the
	 * rendered element becomes available.
	 * @param {string} tag the tag of the HTMLElement
	 * @param {object} [properties] initial properties for this element
	 * @param {object} [attributes]
	 * @param {object} [slotContent]
	 * @returns {Promise<HTMLElement>}
	 */
	static async render(tag, properties = {}, attributes = {}, slotContent = '') {
		window.ba_fireConnectedEvent = true;
		const connectedListener = (e) => {
			const element = e.detail;
			for (const key in properties) {
				element[key] = properties[key];
			}
		};
		document.addEventListener('connected', connectedListener);
		TestUtils._renderToDocument(tag, attributes, slotContent);
		const element = await TestUtils._waitForComponentToRender(tag);
		window.ba_fireConnectedCallbackEvent = false;
		document.removeEventListener('connected', connectedListener);
		return element;
	}

	/**
	 * Renders an already registered {@link HTMLElement}
	 * and returns a promise which resolves as soon as the
	 * rendered element becomes available.
	 * Additionally enables logging of the elements lifecycle (if available).
	 * @param {string} tag the tag of the MvuElement
	 * @param {object} [properties] initial properties for this element
	 * @param {object} [attributes]
	 * @param {object} [slotContent]
	 * @returns {Promise<HTMLElement>}
	 */
	static async renderAndLogLifecycle(tag, properties = {}, attributes = {}, slotContent = '') {
		return TestUtils.render(tag, properties, { [LOG_LIFECYLE_ATTRIBUTE_NAME]: '', ...attributes }, slotContent);
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
		return new Promise((resolve) => {
			function requestComponent() {
				const element = _document.querySelector(tag);
				if (element) {
					//we have to fire this event manually
					if (element.onWindowLoad) {
						element.onWindowLoad();
					}
					resolve(element);
				} else {
					_window.requestAnimationFrame(requestComponent);
				}
			}
			requestComponent();
		});
	}

	/**
	 * Renders a lit-html `TemplateResult`.
	 * @param {TemplateResult} templateResult the TemplateResult
	 * @returns HTMLElement Container of the rendered TemplateResult
	 */
	static renderTemplateResult(templateResult) {
		if (!isTemplateResult(templateResult)) {
			console.error(`'${JSON.stringify(templateResult)}' is not a lit-html TemplateResult`);
			return;
		}

		const templateTestContainerId = 'templateResultTest';
		const createTemplateTestContainer = () => {
			const createdElement = document.createElement('div');
			createdElement.id = templateTestContainerId;
			document.body.appendChild(createdElement);
			return createdElement;
		};

		const element = document.querySelector(`.${templateTestContainerId}`) ?? createTemplateTestContainer();
		render(templateResult, element);
		return element;
	}

	/**
	 * Sets up the store and registers the store service at the injector.
	 * @param {object} state
	 * @param {object | object[] | undefined} reducer as reducer object, array of reducer objects or undefined (see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers)
	 * @returns the store
	 */
	static setupStoreAndDi(state = {}, reducer) {
		const store = reducer
			? createStore(combineReducers(reducer), state)
			: //noop reducer
				createStore((state) => state, state);

		$injector.reset().registerSingleton('StoreService', {
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
			removeEventListener() {},
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
		const touchEventSupported = () => (window.TouchEvent ? true : false);
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
	 * @returns {Promise}
	 */
	static async timeout(ms = 0) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Returns a Promise that either resolves as soon as the check is successful or rejects
	 * when the amount of time defined by the timeout argument passed
	 * @param {Function} checkFn the check function. Must return `true` to resolve the Promise
	 * @param {Number} timeout timeout in ms. Default is `5000`
	 * @returns {Promise}
	 */
	static async waitFor(checkFn, timeout = 5000) {
		return new Promise((resolve, reject) => {
			const clear = () => {
				clearInterval(intervallId);
				clearTimeout(timeOutId);
			};
			const timeOutId = setTimeout(() => {
				clear();
				reject(`Aborted TestUtils#waitFor due to timeout of ${timeout}ms`);
			}, timeout);
			const intervallId = setInterval(() => {
				if (checkFn()) {
					clear();
					resolve();
				}
			}, 10);
		});
	}
}
