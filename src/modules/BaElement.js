import { render as renderLitHtml, html, nothing } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { $injector } from '../injection';
import { equals } from '../utils/storeUtils';
import css from './baElement.css';


/**
 * DEPRECATED - please use {@link MvuElement} instead
 *
 * Abstract base class for all BaElements.
 * The view is generated and bound to the view model by implementing the {@link BaElement#createView} method.
 * Lifecycle:<br>
 *
 * <center>
 *  {@link BaElement#extractState}<br>
 *      &darr;<br>
 *  {@link BaElement#initialize}<br>
 *      &darr;<br>
 *  {@link BaElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link BaElement#render}<br>
 *      &darr;<br>
 *  {@link BaElement#onAfterRender}<br>
 *      &darr;<br>
 *  {@link BaElement#onWindowLoad}<br>
 *      &darr;<br>
 *  {@link BaElement#onDisconnect}<br>
 *
 * </center>
 * State change loop:<br>
 * <center>
 *
 *  {@link BaElement#extractState}<br>
 * 		&darr;<br>
 *  {@link BaElement#onStateChanged}<br>
 *      &darr;<br>
 *  {@link BaElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link BaElement#render}<br>
 *      &darr;<br>
 *  {@link BaElement#onAfterRender}<br>
 * </center>
 *
 *
 * @abstract
 * @class
 * @author taulinger
 * @deprecated
 */
export class BaElement extends HTMLElement {


	constructor() {

		super();
		if (this.constructor === BaElement) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		this._root = this.attachShadow({ mode: 'open' });
		const { StoreService } = $injector.inject('StoreService');
		/**
		 * Do not access the store in child classes. Always use {@link BaElement#state}.
		 * @private
		 */
		this._storeService = StoreService;

		/**
		 * The state of this component.
		 * Usually the state object is an extract of the application-wide store and/or local data.
		 * @see {@link BaElement#extractState}
		 * @see {@link BaElement#onStateChanged}
		 * @member  {Object}
		 *
		 */
		this._state = {};

		this._rendered = false;

		this._observer = [];
	}

	/**
	 * Returns the current state.
	 * @protected
	 * @returns state of this component
	 */
	getState() {
		return this._state;
	}

	/**
	 *
	 * @param {string} message
	 * @protected
	 */
	log(message) {
		// eslint-disable-next-line no-console
		return console.log(`${this.constructor.name}: ` + message);
	}

	/**
	 * Fires an event.
	 * @param {string} name the event name
	 * @param {object} payload the payload of the event
	 * @protected
	 */
	emitEvent(name, payload) {
		this.dispatchEvent(new CustomEvent(name, { detail: payload, bubbles: true }));
	}

	/**
	 * @private
	 */
	connectedCallback() {
		const store = this._storeService.getStore();
		this.unsubscribe = store.subscribe(() => this.updateState());
		this._state = this.extractState(store.getState());

		window.addEventListener('load', () => {
			this.onWindowLoad();
		});

		this.initialize();
		this._initialized = true;

		this.render();
	}

	/**
	 * @private
	 */
	disconnectedCallback() {
		this.unsubscribe();
		this.onDisconnect();
	}

	/**
	 * Hook, which makes it possible to skip the rendering phases
	 * @protected
	 * @see {@link BaElement#onBeforeRender}
	 * @see {@link BaElement#render}
	 * @see {@link BaElement#onAfterRender}
	 * @returns {boolean} <code>true</code> if rendering should be done.
	 */
	isRenderingSkipped() {
		return false;
	}

	/**
	 * Triggers the state change loop which determines the new state for this component.
	 * Usually automatically called by the observer registered on global state changes.
	 * Manual calls are appropriate, e.g. if the state of this component is (partially) derived from local data
	 * and local data have been changed.
	 * @protected
	 * @see {@link BaElement#extractState}
	 */
	updateState() {

		const extractedState = this.extractState(this._storeService.getStore().getState());

		if (!equals(this._state, extractedState)) {
			this._state = extractedState;
			this._observer.forEach(o => o());
			this.onStateChanged(this._state);
		}
	}

	/**
	 * @protected
	 */
	getRenderTarget() {
		return this._root;
	}

	/**
	 * Creates the view with all data bindings
	 * and is called by each render cycle.
	 * @abstract
	 * @protected
	 * @param {object} state state of this component
	 * @returns {TemplateResult|nothing|null|undefined|''}
	 */
	createView(/*eslint-disable no-unused-vars */state) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #createView or do not call super.createView from child.');
	}

	/**
	 * Extract and returns the state of this component from the application-wide state and/or from local data.
	 * Extraction should be done carefully and should only contain state which is necessary for this component.
	 *
	 * @see {@link BaElement#onStateChanged}
	 * @protected
	 * @param {object} globalState **global** state
	 * @returns state of this component
	 */
	extractState(/*eslint-disable no-unused-vars */globalState) {
		return {};
	}

	/**
	 * Called after after the component is connected to the dom.
	 * Js setup should be done here.
	 * @protected
	 */
	initialize() { }

	/**
	 * Called before the view is rendered.
	 * @protected
	 */
	onBeforeRender(/*eslint-disable no-unused-vars */ firsttime) { }

	/**
	 * (Re-) renders the HTML view.
	 * @protected
	 */
	render() {
		if (this._initialized && !this.isRenderingSkipped()) {

			const initialRendering = !this._rendered;
			this.onBeforeRender(initialRendering);
			const template = this.createView(this._state);
			if (this._isNothing(template)) {
				renderLitHtml(template, this.getRenderTarget());
			}
			else {
				renderLitHtml(html`${this.defaultCss()} ${template}`, this.getRenderTarget());
			}

			this._rendered = true;
			this.onAfterRender(initialRendering);
		}
	}

	/**
	 * @private
	 * @param {TemplateResult} templateResult
	 * @returns {boolean}
	 */
	_isNothing(templateResult) {
		return templateResult === nothing
			|| templateResult === undefined
			|| templateResult === null
			|| templateResult === '';
	}

	/**
	 * Returns a (CSS) TemplateResult that will be prepended.
	 * @protected
	 * @returns {TemplateResult|nothing|null|undefined|''}
	 */
	defaultCss() {
		return html`
		<style>
		${css}
		</style>
		`;
	}

	/**
	 * Called after the view has been rendered.
	 * @protected
	 */
	onAfterRender(/*eslint-disable no-unused-vars */ firsttime) { }

	/**
	 * Called when the load event of the window is fired.
	 * Access on properties of nested web components is now possible.
	 * <br>
	 * Attention: Will not be called, if the component is loaded lazily!
	 * In this case use: {@link BaElement#onAfterRender}
	 * @protected
	 */
	onWindowLoad() { }

	/**
	 * Called after the components state has been changed.
	 * Per default {@link BaElement#render} is called.
	 * @protected
	 * @param {object} state state of this component
	 */
	onStateChanged(/*eslint-disable no-unused-vars */state) {
		this.render();
	}

	/**
	 * @protected
	 */
	onDisconnect() { }

	/**
	 * Returns the Html tag name of this component.
	 * @abstract
	 */
	static get tag() {
		if (this === BaElement) {
			// Abstract methods can not be called directly.
			throw new TypeError('Can not call static abstract method #tag.');
		}

		else {
			// The child has implemented this method but also called `super.foo()`.
			throw new TypeError('Please implement static abstract method #tag or do not call static abstract method #tag from child.');
		}
	}


	/**
	 * Registers an observer for a field / property of the state of this component (see: {@link BaElement#extractState}).
	 * Observers are called right after {@link BaElement#extractState}
	 * @protected
	 * @param {(string|string[])} names Name(s) of the observed field(s)
	 * @param {function(changedState)} onChange A function that will be called when the observed field has changed
	 * @param {boolean} [immediately=false] If `true`, the onChange callback function will be called immediately after registration
	 */
	observe(names, onChange, immediately = false) {

		const createObserver = (key, onChange) => {
			let currentState = this._state[key];

			return () => {
				const nextState = this._state[key];
				if (!equals(nextState, currentState)) {
					currentState = nextState;
					onChange(currentState);
				}
			};

		};

		const keys = Array.isArray(names) ? names : [names];

		keys.forEach(key => {
			if (this._state[key] !== undefined) {

				this._observer.push(createObserver(key, onChange));

				if (immediately) {
					onChange(this._state[key]);
				}
			}
			else {
				console.error(`Could not register observer --> '${key}' is not a field in the state of ${this.constructor.name}`);
			}
		});
	}
}


/**
 * Calls the static #tag method of a BaElement and renders the result as HTML.
 * Returns a lit-html Part instance.
 * @param {*} Clazz A class that inherits BaElement
 * @returns {Part} A lit-html Part instance
 * @deprecated
 */
export const renderTagOf = (baElementClazz) => {
	if (baElementClazz.prototype instanceof BaElement) {
		return unsafeHTML(`<${baElementClazz.tag}/>`);
	}
	throw new TypeError(`${baElementClazz.name} does not inherit BaElement`);
};
