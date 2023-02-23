import { forEachPropertyDoAction } from './utils';

/**
 * Dependency injection for vanilla js.
 * @class
 */
export class Injector {
	/**
	 * Create a new instance of the Injector.
	 * @return {Injector} The new instance, to be chained if needed.
	 */
	constructor() {
		this._dependencies = [];
		this._listeners = [];
		this.id = 'injector_' + Math.random().toString(36).substr(2, 9);
		this._ready = false;
		return this;
	}

	/**
	 * Removes the registered dependencies.
	 * @return {Injector} The instance, to be chained if needed.
	 */
	reset() {
		this._dependencies = [];
		this._ready = false;
		return this;
	}

	/**
	 * Registers a dependency in the `PerLookup` scope.
	 * @param  {string} keyOrPOJO   Key of the dependency, javascript object with multiple dependencies defined.
	 * @param  {object} object 		The dependency object.
	 * @return {Injector} 			The Injector instance.
	 */
	register(keyOrPOJO, object) {
		return _register(this, keyOrPOJO, object, false);
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
		return _register(this, keyOrPOJO, object, true);
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
	 * @param  {function} funct Function to get dependencies for.
	 * @return {object}       	Object holding the dependencies.
	 */
	inject(...names) {
		const dependenciesToInject = {};
		// _getArgumentNames(funct.toString())
		names.map((argName) => {
			const registered = this._dependencies[argName];
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
		this._listeners.push(listener);
	}

	/**
	 * Marks this Injector as ready.
	 * This means all dependencies are registered and resolvable.
	 */
	ready() {
		if (!this._ready) {
			this._listeners.forEach((listener) => listener());
			this._ready = true;
		} else {
			console.warn('Injector already marked as ready!');
		}
	}

	/**
	 * @returns `true` if the Injector is marked as ready
	 */
	isReady() {
		return this._ready;
	}

	/**
	 * Returns the scope of a registered dependency or `null` when not registered
	 * @param {string} key
	 * @returns `Singleton` or `PerLookup` or `null`
	 */
	getScope(key) {
		if (this._dependencies[key]) {
			return this._dependencies[key].singleton ? Injector.SCOPE_SINGLETON : Injector.SCOPE_PERLOOKUP;
		}
		return null;
	}

	/**
	 *
	 * @returns the number of registered dependencies.
	 */
	count() {
		return Object.keys(this._dependencies).length;
	}

	static get SCOPE_SINGLETON() {
		return 'Singleton';
	}

	static get SCOPE_PERLOOKUP() {
		return 'PerLookup';
	}
}

/*
 * const  _regExInsideParentheses = /[(][^)]*[)]/;
 * const _regExParenthesesAndSpaces = /[()\s]/g;
 * const _getArgumentNames = functionString => _regExInsideParentheses.exec(functionString)[0].replace(_regExParenthesesAndSpaces, "").split(',');
 */
const _register = (injector, keyOrPOJO, object, isSingleton = false) => {
	// Called as one registration with key and object.
	if (typeof keyOrPOJO === 'string') {
		const key = keyOrPOJO;
		if (injector._dependencies[key]) {
			throw new Error('Instance already registered for ' + key);
		}
		injector._dependencies[key] = { dependency: object, singleton: isSingleton };
	}
	// Called with multiple objects to register.
	else {
		const configObject = keyOrPOJO;
		forEachPropertyDoAction(configObject, (key, property) => {
			injector._dependencies[key] = { dependency: property, singleton: isSingleton };
		});
	}

	return injector;
};
