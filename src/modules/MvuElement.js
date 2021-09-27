import { render as renderLitHtml, html, nothing } from 'lit-html';
import { $injector } from '../injection';
import { equals } from '../utils/storeUtils';
import { observe } from '../utils/storeUtils';
import css from './baElement.css';


/**
 * Base class for components. Improved version of {@link BaElement} and based on
 * on the Model-View-Update pattern.
 *
 * - The component holds an immutable model
 * - The View is setup and bound to the Model by implementing  {@link MvuElement#createView}
 * - Updates of the Model are defined within {@link MvuElement#update} and always return a copy of the Model with new or updated data
 * - Calling {@link MvuElement#signal} dispatches an update request containing new or updated data
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
	}

	/**
	 * Action and data sent from the view
	 * @protected
	 * @param {string} type type of action
	 * @param {Object|string|number} data data for updating the model
	 */
	signal(type, data) {
		const newModel = this.update(type, data, this._model);
		if (newModel && !equals(newModel, this._model)) {
			this._model = newModel;
			this.onModelChanged(this._model);
		}
	}

	/**
	 * Updates the current Model by returning a copy of the current Model with new or updated values.
	 * @protected
	 * @param {string} type type of action
	 * @param {object|number|string} data data
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
	 * Registers an observer for state changes of the global store.
	 * @param {function(state)} extract A function that extract a portion (single value or a object) from the current state which will be observed for comparison
	 * @param {function(observedPartOfState, state)} onChange A function that will be called when the observed state has changed
	 * @param {boolean|true} ignoreInitialState A boolean which indicate, if the callback should be initially called with the current state immediately after the observer has been registered
	 * @returns  A function that unsubscribes the observer
	 * @see observe
	 */
	observe(extract, onChange, immediately = false) {
		//calls observe from storeUtils.js
		return observe(this._storeService.getStore(), extract, onChange, immediately);
	}
}
