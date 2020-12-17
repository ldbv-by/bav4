import { render as renderLitHtml } from 'lit-html';
import { $injector } from '../injection';

/**
 * Abstract Base-Class for all BaElements.
 * BaElement classes represent the view model within the MVVM pattern.
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
		/*
		 * else (called from child)
		 *  Check if all instance methods are implemented.
		 */
		if (this.createView === BaElement.prototype.createView) {
			// Child has not implemented this abstract method.
			throw new TypeError('Please implement abstract method #createView.');
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
	}


	log(message) {
		return console.log(`${this.constructor.name}: ` + message);
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
	 * @private
	 */
	_updateState() {

		const extractedState = this.extractState(this._storeService.getStore().getState());

		// maybe we should use Lo.isEqual later, but for now it does the job
		if (JSON.stringify(this._state) !== JSON.stringify(extractedState)) {
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
	 * (Re-) renders the HTML view.
	 * @protected
	 */
	render() {
		this.onBeforeRender();
		const template = this.createView();
		renderLitHtml(template, this.getRenderTarget());
		this.onAfterRender();
	}

	/**
	 * Creates the html template.
	 * @abstract
	 * @returns html template as tagged template literal
	 */
	createView() {
		if (this === BaElement) {
			// The child has not implemented this method.
			throw new TypeError('Please implement static abstract method #tag.');
		}
		else {
			// The child has implemented this method but also called `super.foo()`.
			throw new TypeError('Do not call static abstract method #tag from child.');
		}
	}

	/**
	 * Called after after the component is connected to the dom.
	 * Js setup should be done here.
	 * @protected
	 */
	initialize() { }

	/**
	 * Called after the view has been rendered.
	 * @protected
	 */
	onAfterRender() { }

	/**
	 * Called before the view is rendered.
	 * @protected
	 */
	onBeforeRender() { }

	/**
	 * Called when the load event of the window is fired.
	 * Access on properties of nested web components is now possible. 
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
	 * Fires an event.
	 * @param {*} name the event name
	 * @param {*} payload the paylod of the event
	 */
	emitEvent(name, payload) {
		this.dispatchEvent(new CustomEvent(name, { detail: payload, bubbles: true }));
	}


	/**
	 * Returns the Html tag name of this element.
	 * @abstract
	 */
	static get tag() {
		if (this === BaElement) {
			// Abstract methods can not be called directly.
			throw new TypeError('Can not call static abstract method #tag.');
		}
		else if (this.tag === BaElement.tag) {
			// The child has not implemented this method.
			throw new TypeError('Please implement static abstract method #tag.');
		}
		else {
			// The child has implemented this method but also called `super.foo()`.
			throw new TypeError('Do not call static abstract method #tag from child.');
		}
	}

}