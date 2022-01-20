import { render as renderLitHtml, html, nothing } from 'lit-html';
import { $injector } from '../injection';
import { generateTestIds } from '../utils/markup';
import { equals } from '../utils/storeUtils';
import { observe } from '../utils/storeUtils';
import css from './baElement.css';


/**
 * Base class for components. Improved version of {@link BaElement} and based on
 * on the Model-View-Update pattern.
 *
 *
 *  MODEL &rarr; <i>render</i> &rarr; VIEW &rarr; <i>signal</i> &rarr; UPDATE <br>
 * 	&nbsp;&nbsp;&nbsp;&nbsp;&uarr; ______________________________ &darr;
 *
 *
 * - The component holds an immutable Model
 * - The View renders the Model by calling  {@link MvuElement#createView}
 * - Updates of the Model are defined within {@link MvuElement#update} and always return a copy of the Model
 * - User interaction on the view calls {@link MvuElement#signal} containing new or updated data, which trigger an update of the Model
 *
 * Lifecycle Hooks:<br>
 *
 * <center>
 *  {@link MvuElement#onInitialize}<br>
 *      &darr;<br>
 *  {@link MvuElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link MvuElement#onAfterRender}<br>
 *      &darr;<br>
 *  {@link MvuElement#onWindowLoad}<br>
 *      &darr;<br>
 *  {@link MvuElement#onDisconnect}<br>
 *
 * </center>
 * Model change hooks:<br>
 * <center>
 *
 *  {@link MvuElement#onModelChanged}<br>
 *      &darr;<br>
 *  {@link MvuElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link MvuElement#onAfterRender}<br>
 * </center>
 *
 *
 * @abstract
 * @class
 * @author taulinger
 */
export class MvuElement extends HTMLElement {


	/**
	 *
	 * @param {object} model initial Model of this component
	 */
	constructor(model = {}) {

		super();
		if (this.constructor === MvuElement) {
			// Abstract class can not be constructed.
			throw new Error('Can not construct abstract class.');
		}
		this._root = this.attachShadow({ mode: 'open' });
		const { StoreService } = $injector.inject('StoreService');
		/**
		 * Do not access the store in child classes. Always use {@link MvuElement#model}.
		 * @private
		 */
		this._storeService = StoreService;

		/**
		 * The Model of this component.
		 * @member  {Object}
		 * @private
		 *
		 */
		this._model = model;

		this._rendered = false;

		this._observer = [];
	}

	/**
	 * Requests a specific update of the Model.
	 * @protected
	 * @see {@link MvuElement#update}
	 * @param {string} type type of update
	 * @param {Object|string|number} [data=null] data of this update request
	 */
	signal(type, data = null) {
		const newModel = this.update(type, data, this._model);
		if (newModel && !equals(newModel, this._model)) {
			this._model = newModel;
			this._observer.forEach(o => o());
			this.onModelChanged(this._model);
		}
	}

	/**
	 * Updates the current Model by returning a copy of the current Model with new or updated values.
	 * @protected
	 * @see {@link MvuElement#signal}
	 * @param {string} type type of update
	 * @param {object|number|string} [data=null] data of this update request
	 * @param {object} model current Model
	 * @returns the new Model
	 */
	update(/*eslint-disable no-unused-vars */type, data, model) {
		throw new Error('Please implement method #update before calling #signal or do not call super.update from child.');
	}

	/**
	 * Returns a copy of the current model.
	 * @protected
	 */
	getModel() {
		return { ...this._model };
	}

	/**
	 * @private
	 */
	connectedCallback() {

		window.addEventListener('load', () => {
			this.onWindowLoad();
		});

		this.onInitialize();
		this._initialized = true;

		this.render();
	}

	/**
	 * @private
	 */
	disconnectedCallback() {
		this.onDisconnect();
	}

	/**
	 * Hook, which makes it possible to skip the rendering phases
	 * @protected
	 * @see {@link MvuElement#onBeforeRender}
	 * @see {@link MvuElement#render}
	 * @see {@link MvuElement#onAfterRender}
	 * @returns {boolean} <code>true</code> if rendering should be done.
	 */
	isRenderingSkipped() {
		return false;
	}

	/**
	 * @protected
	 */
	getRenderTarget() {
		return this._root;
	}

	/**
	 * Creates the View with all data bindings
	 * and is called by each render cycle.
	 * @abstract
	 * @protected
	 * @param {object} model the current Model of this component
	 * @returns {TemplateResult|nothing|null|undefined|''}
	 */
	createView(/*eslint-disable no-unused-vars */model) {
		// The child has not implemented this method.
		throw new Error('Please implement abstract method #createView or do not call super.createView from child.');
	}

	/**
	 * Called after after the component is connected to the DOM.
	 * @protected
	 */
	onInitialize() { }

	/**
	 * Called before the View is rendered.
	 * @protected
	 */
	onBeforeRender(/*eslint-disable no-unused-vars */ firsttime) { }

	/**
	 * (Re-) renders the HTML view.
	 *
	 * Calls of this method are usually not necessary, the component calls
	 * this method itself after the Model has changed.
	 *
	 * Must not be overridden.
	 * @protected
	 */
	render() {
		if (this._initialized && !this.isRenderingSkipped()) {

			const initialRendering = !this._rendered;
			this.onBeforeRender(initialRendering);
			const template = this.createView(this._model);
			if (this._isNothing(template)) {
				renderLitHtml(template, this.getRenderTarget());
			}
			else {
				renderLitHtml(html`${this.defaultCss()} ${template}`, this.getRenderTarget());
			}

			generateTestIds(this);
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
	 * Called after the View has been rendered.
	 * @protected
	 */
	onAfterRender(/*eslint-disable no-unused-vars */ firsttime) { }

	/**
	 * Called when the load event of the window is fired.
	 * Access on properties of nested web components is now possible.
	 * <br>
	 * Attention: Will not be called, if the component is loaded lazily!
	 * In this case use: {@link MvuElement#onAfterRender}
	 * @protected
	 */
	onWindowLoad() { }

	/**
	 * Called after the components Model has changed
	 * and triggers an update of the view
	 * by calling {@link MvuElement#render}.
	 *
	 * Can be overridden.
	 * @param {object} model the updated Model of this component
	 * @protected
	 */
	onModelChanged(/*eslint-disable no-unused-vars */model) {
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
		if (this === MvuElement) {
			// Abstract methods can not be called directly.
			throw new Error('Can not call static abstract method #tag.');
		}

		else {
			// The child has implemented this method but also called `super.foo()`.
			throw new Error('Please implement static abstract method #tag or do not call static abstract method #tag from child.');
		}
	}


	/**
	 * Registers an observer on state changes of the global store.
	 * @param {function(state)} extract A function that extract a portion (single value or a object) from the current state which will be observed for comparison
	 * @param {function(observedPartOfState, state)} onChange A function that will be called when the observed state has changed
	 * @param {boolean|true} immediately A boolean which indicates, if the callback should be called with the current state immediately after the observer has been registered
	 * @returns  A function that unsubscribes the observer
	 * @see observe
	 */
	observe(extract, onChange, immediately = true) {
		//calls observe from storeUtils.js
		return observe(this._storeService.getStore(), extract, onChange, !immediately);
	}

	/**
	 * Registers an observer on changes of a field of the Model of this component.
	 * Observers are called right before {@link MvuElement#onModelChanged}.
	 * @protected
	 * @param {(string|string[])} names Name(s) of the observed field(s)
	 * @param {function(observedField)} onChange A function that will be called when the observed field has changed
	 * @param {boolean|false} immediately A boolean which indicates, if the callback should be called with the current state immediately after the observer has been registered
	 */
	observeModel(names, onChange, immediately = false) {

		const createObserver = (key, onChange) => {
			let currentState = this._model[key];

			return () => {
				const nextState = this._model[key];
				if (!equals(nextState, currentState)) {
					currentState = nextState;
					onChange(currentState);
				}
			};
		};

		const keys = Array.isArray(names) ? names : [names];

		keys.forEach(key => {
			if (this._model[key] !== undefined) {

				this._observer.push(createObserver(key, onChange));

				if (immediately) {
					onChange(this._model[key]);
				}
			}
			else {
				console.error(`Could not register observer --> '${key}' is not a field in the Model of ${this.constructor.name}`);
			}
		});
	}
}
