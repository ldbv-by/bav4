import { render as renderLitHtml } from 'lit-html';
import { $injector } from '../injection';
import { equals } from '../utils/storeUtils';

/**
 * Abstract Base-Class for all BaElements.
 * BaElement classes represent the view model within the MVVM pattern.
 * The view is generated and bound to the view model by implementing the {@link BaElement#createView} method.
 * 
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
 * Model (state) change loop:<br>
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
 * @author aul
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
		 * The state of this Element. Usually the state object is an extract of the application-wide store.
		 * Local state should be managed individually in subclasses.
		 * @see {@link BaElement#extractState}
		 * @see {@link BaElement#onStateChanged}
		 * @member  {Object}  
		 * 
		 */
		this._state = {};

		this._rendered = false;
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
	 * @param {object} payload the paylod of the event
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
		this.unsubscribe = store.subscribe(() => this._updateState());
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
	 * @private
	 */
	_updateState() {

		const extractedState = this.extractState(this._storeService.getStore().getState());

		if (!equals(this._state, extractedState)) {
			this._state = extractedState;
			this.onStateChanged();
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
	 * @returns {TemplateResult}
	 */
	createView() {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #createView or do not call super.createView from child.');
	}

	/**
	 * Extract and returns the state of this element from the application-wide state.
	 * Extraction shoud be done carefully, and should only contain the state which is needed for this element.
	 * 
	 * @see {@link BaElement#onStateChanged}
	 * @protected
	 * @returns state of the elements {Object}
	 */
	extractState(/*eslint-disable no-unused-vars */state) {
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
			const template = this.createView();
			renderLitHtml(template, this.getRenderTarget());
			this._rendered = true;
			this.onAfterRender(initialRendering);
		}
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
	 * Attention: Will not be called, if the element being loaded lazily!
	 * In this case use: {@link BaElement#onAfterRender}
	 * @protected
	 */
	onWindowLoad() { }

	/**
	 * Called after the elements state has been changed. 
	 * Per default {@link BaElement#render} is called. 
	 * @protected
	 */
	onStateChanged() {
		this.render();
	}

	/**
	 * @protected
	 */
	onDisconnect() { }

	/**
	 * Returns the Html tag name of this element.
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

}