import { html, nothing } from 'lit-html';
import { MvuElement } from '../../src/modules/MvuElement';
import { TestUtils } from '../test-utils.js';

let skipRendering = false;

const Update_Foo = 'update_foo';
const Update_Index = 'update_index';

class MvuElementImpl extends MvuElement {
	constructor() {
		super({
			foo: 'foo',
			index: null
		});
		//just for test purposes
		this.callOrderIndex = 0;

		//we synchronize the global "applicationStateIndex" with our model
		this.observe(
			(state) => state.root.applicationStateIndex,
			(applicationStateIndex) => this.signal(Update_Index, applicationStateIndex)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Foo: {
				return {
					...model,
					foo: data
				};
			}

			case Update_Index: {
				return {
					...model,
					index: data
				};
			}
		}
	}

	set foo(data) {
		this.signal(Update_Index, data);
	}

	onInitialize() {
		this.onInitializeCalled = this.callOrderIndex++;
	}

	isRenderingSkipped() {
		return skipRendering;
	}

	onBeforeRender() {
		this.onBeforeRenderCalled = this.callOrderIndex++;
		//to preserve the correct order, we are called from the render method
		this.onRenderCalled = this.callOrderIndex++;
	}

	onAfterRender() {
		this.onAfterRenderCalled = this.callOrderIndex++;
	}

	onWindowLoad() {
		this.onWindowLoadCalled = this.callOrderIndex++;
	}

	onDisconnect() {
		this.onDisconnectCalled = this.callOrderIndex++;
	}

	createView(model) {
		return html`
			<div class="ba-element-impl-local">${model.foo}</div>
			<div class="ba-element-impl-global">${model.index}</div>
		`;
	}

	static get tag() {
		return 'ba-element-impl';
	}
}

class MvuElementNoImpl extends MvuElement {}

class MvuElementDefaultCss extends MvuElement {
	defaultCss() {
		return html`<style id="defaultCss"></style>`;
	}

	createView() {
		return html`something`;
	}

	static get tag() {
		return 'ba-element-default-css';
	}
}

class MvuElementNoDefaultCss extends MvuElement {
	defaultCss() {
		return html`<style id="defaultCss"></style>`;
	}

	createView() {
		return nothing;
	}

	static get tag() {
		return 'ba-element-no-default-css';
	}
}

class MvuElementModelTest extends MvuElement {
	constructor(model) {
		super(model);
	}
}

window.customElements.define(MvuElementImpl.tag, MvuElementImpl);
window.customElements.define('ba-element', MvuElement);
window.customElements.define('ba-element-noimpl', MvuElementNoImpl);
window.customElements.define(MvuElementDefaultCss.tag, MvuElementDefaultCss);
window.customElements.define(MvuElementNoDefaultCss.tag, MvuElementNoDefaultCss);
window.customElements.define('ba-element-model-test', MvuElementModelTest);

let store;

const INDEX_CHANGED = 'CHANGE_INDEX';

//reducer with default state
const changeApplicationStoreIndexReducer = (state = { applicationStateIndex: -1 }, action) => {
	switch (action.type) {
		case INDEX_CHANGED:
			return {
				...state,
				applicationStateIndex: action.payload
			};
		default:
			return { ...state };
	}
};
const setupStoreAndDi = () => {
	//Reducer as Object, state field is 'root'
	//see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
	store = TestUtils.setupStoreAndDi({ root: { applicationStateIndex: 21 } }, { root: changeApplicationStoreIndexReducer });
};

describe('MvuElement', () => {
	beforeEach(() => {
		setupStoreAndDi();
		skipRendering = false;
	});

	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new MvuElement()).toThrowError(Error, 'Can not construct abstract class.');
			});

			it('copies the model', () => {
				const model = { foo: 'bar' };

				const instance = new MvuElementModelTest(model);

				expect(instance._model === model).toBeFalse();
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #createView is called without overriding', () => {
				expect(() => new MvuElementNoImpl().createView()).toThrowError(
					Error,
					'Please implement abstract method #createView or do not call super.createView from child.'
				);
			});

			it('throws exception when #update is called without overriding', () => {
				expect(() => new MvuElementNoImpl().update()).toThrowError(
					Error,
					'Please implement method #update before calling #signal or do not call super.update from child.'
				);
			});

			it('throws exception when abstract static method #tag is called directly', () => {
				expect(() => MvuElement.tag).toThrowError(Error, 'Can not call static abstract method #tag.');
			});

			it('throws exception when abstract static method #tag is called without overriding', () => {
				expect(() => MvuElementNoImpl.tag).toThrowError(
					Error,
					'Please implement static abstract method #tag or do not call static abstract method #tag from child.'
				);
			});

			it('calls #createView with a copied model', () => {
				const model = { foo: 'bar' };
				let transferedModel = null;
				const instance = new MvuElementModelTest(model);
				spyOn(instance, 'createView').and.callFake((model) => {
					transferedModel = model;
					return model;
				});
				instance._initialized = true;

				instance.onModelChanged();

				expect(transferedModel).toEqual(instance._model);
				expect(instance._model === transferedModel).toBeFalse();
			});
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);

			expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('foo')).toBeTrue();
			expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
		});

		it('calls lifecycle callbacks in correct order', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			document.body.removeChild(element);

			expect(element.onInitializeCalled).toBe(0);
			expect(element.onBeforeRenderCalled).toBe(1);
			expect(element.onRenderCalled).toBe(2);
			expect(element.onAfterRenderCalled).toBe(3);
			expect(element.onWindowLoadCalled).toBe(4);
			expect(element.onDisconnectCalled).toBe(5);
		});

		it('logs the lifecycle', async () => {
			const warnSpy = spyOn(console, 'log');
			const element = await TestUtils.renderAndLogLifecycle(MvuElementImpl.tag);
			document.body.removeChild(element);

			expect(warnSpy.calls.allArgs()).toEqual([
				['📦 MvuElementImpl#constructor: {"foo":"foo","index":null}'],
				['🎺 MvuElementImpl#signal: "update_index", 21'],
				['📌 MvuElementImpl#onModelChanged: {"foo":"foo","index":21}'],
				['📌 MvuElementImpl#onInitialize'],
				['📌 MvuElementImpl#onBeforeRender'],
				['🧪 MvuElementImpl#render: {"foo":"foo","index":21}'],
				['📌 MvuElementImpl#onAfterRender'],
				['📌 MvuElementImpl#onDisconnect']
			]);
		});

		it('does NOT log the lifecycle', async () => {
			const warnSpy = spyOn(console, 'log');
			const element = await TestUtils.render(MvuElementImpl.tag);
			document.body.removeChild(element);

			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('calls lifecycle callbacks in correct order when rendering is skipped', async () => {
			skipRendering = true;
			const element = await TestUtils.render(MvuElementImpl.tag);

			expect(element.onInitializeCalled).toBe(0);
			expect(element.onWindowLoadCalled).toBe(1);
		});

		it('does not call render() as long as not initialized', async () => {
			const instance = new MvuElementImpl();
			spyOn(instance, 'onBeforeRender');

			instance.render();

			expect(instance.onBeforeRender).not.toHaveBeenCalled();

			//let's initialize the component
			instance.connectedCallback();

			expect(instance.onBeforeRender).toHaveBeenCalledTimes(1);
		});

		it('calls render callbacks with argument', async () => {
			const instance = new MvuElementImpl();
			const onBeforeRenderSpy = spyOn(instance, 'onBeforeRender');
			const onAfterRenderSpy = spyOn(instance, 'onAfterRender');

			//let's initialize the component
			instance.connectedCallback();
			instance.render();

			expect(instance.onBeforeRender).toHaveBeenCalledWith(true);
			expect(instance.onAfterRender).toHaveBeenCalledWith(true);

			onBeforeRenderSpy.calls.reset();
			onAfterRenderSpy.calls.reset();
			instance.render();

			expect(instance.onBeforeRender).toHaveBeenCalledWith(false);
			expect(instance.onAfterRender).toHaveBeenCalledWith(false);
		});
	});

	describe('getModel', () => {
		it('returns a copy of the current model', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			const copiedModel = element.getModel();

			expect(copiedModel).toEqual(element._model);

			element.signal(Update_Foo, 'other');

			expect(copiedModel).not.toEqual(element._model);
		});
	});

	describe('model update', () => {
		describe('when #signal is called', () => {
			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvuElementImpl.tag);
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				element.signal(Update_Foo, 'other');

				expect(element.onBeforeRenderCalled).toBe(5);
				expect(element.onRenderCalled).toBe(6);
				expect(element.onAfterRenderCalled).toBe(7);
				expect(onModelChangedSpy).toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('other')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
			});

			it('calls #update with a copied model', async () => {
				const element = await TestUtils.render(MvuElementImpl.tag);
				let transferedModel = null;
				spyOn(element, 'update').and.callFake((type, data, model) => {
					transferedModel = model;
					return model;
				});

				element.signal(Update_Foo, 'other');

				expect(transferedModel).toEqual(element._model);
				expect(element._model === transferedModel).toBeFalse();
			});

			it('calls callbacks with a copied model', async () => {
				const element = await TestUtils.render(MvuElementImpl.tag);
				let transferedModel = null;
				spyOn(element, 'onModelChanged').and.callFake((model) => {
					transferedModel = model;
					return model;
				});

				element.signal(Update_Foo, 'other');

				expect(transferedModel).toEqual(element._model);
				expect(element._model === transferedModel).toBeFalse();
			});
		});

		describe('when #signal is called with an unknown action type', () => {
			it('does not call callbacks and does not update the view', async () => {
				const element = await TestUtils.render(MvuElementImpl.tag);
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				element.signal('Unknown', 'other');

				expect(element.onBeforeRenderCalled).toBe(1);
				expect(element.onRenderCalled).toBe(2);
				expect(element.onAfterRenderCalled).toBe(3);
				expect(onModelChangedSpy).not.toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('foo')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
			});
		});

		describe('when #signal is called from an observer', () => {
			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvuElementImpl.tag);
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				store.dispatch({
					type: INDEX_CHANGED,
					payload: 42
				});

				expect(element.onBeforeRenderCalled).toBe(5);
				expect(element.onRenderCalled).toBe(6);
				expect(element.onAfterRenderCalled).toBe(7);
				expect(onModelChangedSpy).toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('foo')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(42)).toBeTrue();
			});
		});
	});

	describe('default css', () => {
		it('checks if a template result contains content', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);

			expect(element._isNothing(nothing)).toBeTrue();
			expect(element._isNothing(undefined)).toBeTrue();
			expect(element._isNothing(null)).toBeTrue();
			expect(element._isNothing('')).toBeTrue();
			expect(element._isNothing(html`some`)).toBeFalse();
		});

		it('prepends the default css', async () => {
			const element = await TestUtils.render(MvuElementDefaultCss.tag);
			expect(element.shadowRoot.querySelector('#defaultCss')).toBeTruthy();
		});

		it("does not prepends the default css when #createView returns 'nothing'", async () => {
			const element = await TestUtils.render(MvuElementNoDefaultCss.tag);
			expect(element.shadowRoot.querySelector('#defaultCss')).toBeFalsy();
		});
	});

	describe('observeModel', () => {
		it('registers model observers', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			const elementStateIndexCallback = jasmine.createSpy();
			const someUnknownFieldCallback = jasmine.createSpy();
			const errorSpy = spyOn(console, 'error');
			//let's register an observer of model.index three times
			element.observeModel('index', elementStateIndexCallback);
			element.observeModel(['index', 'index'], elementStateIndexCallback);
			element.observeModel('someUnknowField', someUnknownFieldCallback);

			//change state after registration
			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(elementStateIndexCallback).toHaveBeenCalledWith(42);
			expect(elementStateIndexCallback).toHaveBeenCalledTimes(3);
			expect(someUnknownFieldCallback).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledOnceWith("Could not register observer --> 'someUnknowField' is not a field in the Model of MvuElementImpl");
		});

		it('unsubscribes model observers', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			const elementStateIndexCallback = jasmine.createSpy();
			const someUnknownFieldCallback = jasmine.createSpy();
			const errorSpy = spyOn(console, 'error');
			//let's register an observer of model.index three times
			element.observeModel('index', elementStateIndexCallback)();
			element.observeModel(['index', 'index'], elementStateIndexCallback)();
			element.observeModel('someUnknowField', someUnknownFieldCallback)();

			//change state after registration
			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(elementStateIndexCallback).toHaveBeenCalledTimes(0);
			expect(errorSpy).toHaveBeenCalledOnceWith("Could not register observer --> 'someUnknowField' is not a field in the Model of MvuElementImpl");
		});

		it('registers observers and calls the callbacks immediately', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			const elementStateIndexCallback = jasmine.createSpy();
			const someUnknownFieldCallback = jasmine.createSpy();
			const errorSpy = spyOn(console, 'error');

			//change state before registration
			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});
			element.observeModel('index', elementStateIndexCallback, true);
			element.observeModel('someUnknowField', someUnknownFieldCallback, true);

			expect(elementStateIndexCallback).toHaveBeenCalledOnceWith(42);
			expect(someUnknownFieldCallback).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledOnceWith("Could not register observer --> 'someUnknowField' is not a field in the Model of MvuElementImpl");
		});
	});

	describe('when "window.ba_fireConnectedEvent" property is true', () => {
		it('fires a custom event', async () => {
			const spy = jasmine.createSpy();
			document.addEventListener('connected', spy);

			const element = await TestUtils.render(MvuElementImpl.tag);

			expect(spy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: element, bubbles: true }));
		});
	});

	describe('when disconnected', () => {
		it('unsubscribes all store observers', async () => {
			const element = await TestUtils.render(MvuElementImpl.tag);
			const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(onModelChangedSpy).toHaveBeenCalledTimes(1);

			element.remove(); // Let's remove the element and force running the disconnect -lifecycle, so no more state changes are observed

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 43
			});

			expect(onModelChangedSpy).toHaveBeenCalledTimes(1);
		});
	});
});
