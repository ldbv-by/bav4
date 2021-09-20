import { render as renderLitHtml, html, nothing } from 'lit-html';
import { $injector } from '../injection';
import { observe, equals } from '../utils/storeUtils';
import css from './baElement.css';


/**
 * Base class for components. Improved version of {@link BaElement} and based on
 * on the Model-View-Presenter (Supervising Controller) pattern.
 *
 * The component holds a model and acts as a presenter.
 * The view is generated and bound to the model by implementing the {@link MvpElement#createView} method.
 * Changes to the model cause an update of the view (unidirectional binding).
 *
 * Lifecycle:<br>
 *
 * <center>
 *  {@link MvpElement#initialize}<br>
 *      &darr;<br>
 *  {@link MvpElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link MvpElement#render}<br>
 *      &darr;<br>
 *  {@link MvpElement#onAfterRender}<br>
 *      &darr;<br>
 *  {@link MvpElement#onWindowLoad}<br>
 *      &darr;<br>
 *  {@link MvpElement#onDisconnect}<br>
 *
 * </center>
 * Model change loop:<br>
 * <center>
 *
 *  {@link MvpElement#onModelChanged}<br>
 *      &darr;<br>
 *  {@link MvpElement#onBeforeRender}<br>
 *      &darr;<br>
 *  {@link MvpElement#render}<br>
 *      &darr;<br>
 *  {@link MvpElement#onAfterRender}<br>
 * </center>
 *
 *
 * @abstract
 * @class
 * @author taulinger
 */
export class MvpElement extends HTMLElement {


	constructor(model = {}) {

		super();
		if (this.constructor === MvpElement) {
			// Abstract class can not be constructed.
			throw new TypeError('Can not construct abstract class.');
		}
		this._root = this.attachShadow({ mode: 'open' });
		const { StoreService } = $injector.inject('StoreService');
		/**
		 * Do not access the store in child classes. Always use {@link MvpElement#model}.
		 * @private
		 */
		this._storeService = StoreService;

		/**
		 * The model of this component.
		 * @member  {Object}
		 * @private
		 *
		 */
		this._model = observeObject(model, () => this.onModelChanged());

		this._rendered = false;
	}

	/**
	 * Updates the model by this data.
	 */
	updateModel(data) {
		Object.assign(this._model, data);
	}

	get model() {
		return this._model;
	}

	/**
	 * @private
	 */
	connectedCallback() {

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
		this.onDisconnect();
	}

	/**
	 * Hook, which makes it possible to skip the rendering phases
	 * @protected
	 * @see {@link MvpElement#onBeforeRender}
	 * @see {@link MvpElement#render}
	 * @see {@link MvpElement#onAfterRender}
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
	 * Creates the view with all data bindings
	 * and is called by each render cycle.
	 * @abstract
	 * @protected
	 * @param {object} model the model of this component
	 * @returns {TemplateResult|nothing|null|undefined|''}
	 */
	createView(/*eslint-disable no-unused-vars */model) {
		// The child has not implemented this method.
		throw new TypeError('Please implement abstract method #createView or do not call super.createView from child.');
	}

	/**
	 * Called after after the component is connected to the DOM.
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
	 *
	 * Calls of this method are usually not necessary, the component calls
	 * this method itself after the model has changed.
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
	 * Called after the view has been rendered.
	 * @protected
	 */
	onAfterRender(/*eslint-disable no-unused-vars */ firsttime) { }

	/**
	 * Called when the load event of the window is fired.
	 * Access on properties of nested web components is now possible.
	 * <br>
	 * Attention: Will not be called, if the component is loaded lazily!
	 * In this case use: {@link MvpElement#onAfterRender}
	 * @protected
	 */
	onWindowLoad() { }

	/**
	 * Called after the components model has changed
	 * and triggers an update of the view
	 * by calling {@link MvpElement#render}.
	 *
	 * Can be overridden.
	 * @protected
	 */
	onModelChanged() {
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
		if (this === MvpElement) {
			// Abstract methods can not be called directly.
			throw new TypeError('Can not call static abstract method #tag.');
		}

		else {
			// The child has implemented this method but also called `super.foo()`.
			throw new TypeError('Please implement static abstract method #tag or do not call static abstract method #tag from child.');
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

/**
 *
 * Shamelessly stolen from this place:
 * https://www.stefanjudis.com/today-i-learned/the-global-reflect-object-its-use-cases-and-things-to-watch-out-for/
 * and slightly adjusted
 * @param {Object} object the object that should be observed
 * @param {Function} onChange the callback function
 * @returns proxy of the observed object
 */
const observeObject = (object, onChange) => {
	const handler = {
		get(target, property, receiver) {
			try {
				// this goes recursively through the object and
				// creates new Proxies for every object defined
				// in the target object when it is accessed
				//
				// e.g. `a.b.c = true` triggers:
				// - `get` for accessing `b`
				// - `defineProperty` for setting `c`
				return new Proxy(target[property], handler);
			}
			catch (err) {
				// ☝️ throws when a new Proxy is initialized with a string or a number
				// which means that `Reflect.get` does the job
				return Reflect.get(target, property, receiver);
			}
		},
		defineProperty(target, property, descriptor) {

			//detect possible changes
			const willChange = !equals(target[property], descriptor.value);
			// use `Reflect.defineProperty` to provide default functionality
			const success = Reflect.defineProperty(target, property, descriptor);
			if (willChange) {
				onChange();
			}
			return success;
		},
		deleteProperty(target, property) {
			// notify about changes
			onChange();
			// use `Reflect.deleteProperty` to provide default functionality
			return Reflect.deleteProperty(target, property);
		}
	};

	return new Proxy(object, handler);
};
