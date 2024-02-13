/**
 * @module injection/core/injector
 */
import { forEachPropertyDoAction } from './utils';

/**
 * Dependency injection for vanilla js.
 * @class
 */
export class Injector {
	#dependencies = {};
	#listeners = [];
	#id = 'injector_' + Math.random().toString(36).substr(2, 9);
	#ready = false;
	/**
	 * Create a new instance of the Injector.
	 */
	constructor() {}

	/**
	 * Removes the registered dependencies.
	 * @return {Injector} The instance, to be chained if needed.
	 */
	reset() {
		this.#dependencies = {};
		this.#ready = false;
		return this;
	}

	/**
	 * Registers a dependency in the `PerLookup` scope.
	 * @param  {string} keyOrPOJO   Key of the dependency, javascript object with multiple dependencies defined.
	 * @param  {object} object 		The dependency object.
	 * @return {Injector} 			The Injector instance.
	 */
	register(keyOrPOJO, object) {
		return this.#register(keyOrPOJO, object, false);
	}

	/**
	 * Registers a dependency in the `Singleton` scope.
	 *
	 * @param {any} keyOrPOJO	Key of the dependency, javascript object with multiple dependencies defined.
	 * @param {any} object		The dependency object.
	 * @returns {Injector}		The Injector instance.
	 *
	 * @memberOf Injector
	 */
	registerSingleton(keyOrPOJO, object) {
		return this.#register(keyOrPOJO, object, true);
	}

	/**
	 * Registers a "module". A module is a callback function which takes the injector as argument
	 * @param {function} moduleCallback callback function that registers takes the injector as argument
	 * @returns {Injector} 				The Injector instance.
	 */
	registerModule(moduleCallback) {
		moduleCallback(this);
		return this;
	}

	/**
	 * Returns the dependencies for the supplied function.
	 * Details: The function is converted to it's string (code), parsed with regex to find
	 * 	the argument names, and then those names are used to fetch the respective objects
	 * 	that were registered with the Injector.
	 * @param  {...string} names Registered names to get dependencies for.
	 * @return {object} Object holding the dependencies.
	 */
	inject(...names) {
		const dependenciesToInject = {};
		names.map((argName) => {
			const registered = this.#dependencies[argName];
			if (!registered) {
				throw new Error('No registered instance found for ' + argName);
			}
			// const dependencyIsSingleton = registered.singleton;
			dependenciesToInject[argName] = registered.singleton ? registered.dependency : new registered.dependency();
		});

		return dependenciesToInject;
	}

	/**
	 * Registers a callback function that will be invoked after the injector is marked as ready.
	 * @param {function} listener
	 */
	onReady(listener) {
		this.#listeners.push(listener);
	}

	/**
	 * Marks this Injector as ready.
	 * This means all dependencies are registered and resolvable.
	 */
	ready() {
		if (!this.#ready) {
			this.#listeners.forEach((listener) => listener());
			this.#ready = true;
		} else {
			console.warn('Injector already marked as ready!');
		}
	}

	/**
	 * @returns `true` if the Injector is marked as ready
	 */
	isReady() {
		return this.#ready;
	}

	/**
	 *
	 * @returns the ID of this injector instance
	 */
	getId() {
		return this.#id;
	}

	/**
	 * Returns the scope of a registered dependency or `null` when not registered
	 * @param {string} key
	 * @returns `Singleton` or `PerLookup` or `null`
	 */
	getScope(key) {
		if (this.#dependencies[key]) {
			return this.#dependencies[key].singleton ? Injector.SCOPE_SINGLETON : Injector.SCOPE_PERLOOKUP;
		}
		return null;
	}

	/**
	 *
	 * @returns the number of registered dependencies.
	 */
	count() {
		return Object.keys(this.#dependencies).length;
	}

	static get SCOPE_SINGLETON() {
		return 'Singleton';
	}

	static get SCOPE_PERLOOKUP() {
		return 'PerLookup';
	}

	/*
	 * const  _regExInsideParentheses = /[(][^)]*[)]/;
	 * const _regExParenthesesAndSpaces = /[()\s]/g;
	 * const _getArgumentNames = functionString => _regExInsideParentheses.exec(functionString)[0].replace(_regExParenthesesAndSpaces, "").split(',');
	 */
	#register(keyOrPOJO, object, isSingleton) {
		// Called as one registration with key and object.
		if (typeof keyOrPOJO === 'string') {
			const key = keyOrPOJO;
			if (this.#dependencies[key]) {
				throw new Error('Instance already registered for ' + key);
			}
			this.#dependencies[key] = { dependency: object, singleton: isSingleton };
		}
		// Called with multiple objects to register.
		else {
			const configObject = keyOrPOJO;
			forEachPropertyDoAction(configObject, (key, property) => {
				this.#dependencies[key] = { dependency: property, singleton: isSingleton };
			});
		}

		return this;
	}
}
