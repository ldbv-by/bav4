import { BaElement, renderTagOf } from '../../src/modules/BaElement';
import { html, nothing } from 'lit-html';
import { TestUtils } from '../test-utils.js';

let skipRendering = false;

class BaElementImpl extends BaElement {
	constructor() {
		super();
		this.callOrderIndex = 0;
	}

	extractState(globalState) {
		this.extractStateCalled = this.callOrderIndex++;
		//here we extract the local state from the application store
		const {
			root: { applicationStateIndex }
		} = globalState;
		return { elementStateIndex: applicationStateIndex, someWhatNull: null };
	}

	onStateChanged() {
		this.onStateChangedCalled = this.callOrderIndex++;
		super.onStateChanged();
	}

	initialize() {
		this.initializeCalled = this.callOrderIndex++;
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

	createView(state) {
		return html`<div class="ba-element-impl">${state.elementStateIndex}</div>`;
	}

	static get tag() {
		return 'ba-element-impl';
	}
}

class BaElementNoImpl extends BaElement {}

class BaElementDefaultCss extends BaElement {
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

class BaElementNoDefaultCss extends BaElement {
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

window.customElements.define(BaElementImpl.tag, BaElementImpl);
window.customElements.define('ba-element', BaElement);
window.customElements.define('ba-element-noimpl', BaElementNoImpl);
window.customElements.define('ba-element-default-css', BaElementDefaultCss);
window.customElements.define('ba-element-no-default-css', BaElementNoDefaultCss);

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
			return state;
	}
};
const setupStoreAndDi = () => {
	//Reducer as Object, state field is 'root'
	//see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
	store = TestUtils.setupStoreAndDi({ root: { applicationStateIndex: 21 } }, { root: changeApplicationStoreIndexReducer });
};

describe('BaElement', () => {
	beforeEach(() => {
		setupStoreAndDi();
		skipRendering = false;
	});
	describe('expected errors', () => {
		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new BaElement()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #createView is called without overriding', () => {
				expect(() => new BaElementNoImpl().createView()).toThrowError(
					TypeError,
					'Please implement abstract method #createView or do not call super.createView from child.'
				);
			});

			it('throws exception when abstract static method #tag is called directly', () => {
				expect(() => BaElement.tag).toThrowError(TypeError, 'Can not call static abstract method #tag.');
			});

			it('throws exception when abstract static method #tag is called without overriding', () => {
				expect(() => BaElementNoImpl.tag).toThrowError(
					TypeError,
					'Please implement static abstract method #tag or do not call static abstract method #tag from child.'
				);
			});
		});
	});

	describe('events', () => {
		it('is able to emit an event', async () => {
			const myFunction = jasmine.createSpy();
			const element = await TestUtils.render(BaElementImpl.tag);
			window.addEventListener('some_event', myFunction);

			element.emitEvent('some_event', 42);

			expect(myFunction).toHaveBeenCalled();
		});
	});

	describe('getState()', () => {
		it('returns the state of this element', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element.getState()).toEqual(element._state);
		});
	});

	describe('log()', () => {
		it('returns the state of this element', async () => {
			const logSpy = spyOn(console, 'log');
			const element = await TestUtils.render(BaElementImpl.tag);

			element.log('foo');

			expect(logSpy).toHaveBeenCalledWith('BaElementImpl: foo');
		});
	});

	describe('when initialized', () => {
		it('renders the view', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();
			expect(element.shadowRoot.innerHTML.includes('21')).toBeTrue();
		});

		it('calls lifecycle callbacks in correct order', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element.extractStateCalled).toBe(0);
			expect(element.initializeCalled).toBe(1);
			expect(element.onBeforeRenderCalled).toBe(2);
			expect(element.onRenderCalled).toBe(3);
			expect(element.onAfterRenderCalled).toBe(4);
			expect(element.onWindowLoadCalled).toBe(5);
		});

		it('calls lifecycle callbacks in correct order when rendering is skipped', async () => {
			skipRendering = true;
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element.extractStateCalled).toBe(0);
			expect(element.initializeCalled).toBe(1);
			expect(element.onWindowLoadCalled).toBe(2);
		});

		it('does not call render() as long as not initialized', async () => {
			const instance = new BaElementImpl();
			spyOn(instance, 'onBeforeRender');

			instance.render();

			expect(instance.onBeforeRender).not.toHaveBeenCalled();

			//let's initialize the component
			instance.connectedCallback();

			expect(instance.onBeforeRender).toHaveBeenCalledTimes(1);
		});

		it('calls render callbacks with argument', async () => {
			const instance = new BaElementImpl();
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

	describe('when state changed', () => {
		it('calls state change callback in correct order', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);
			const updateStateSpy = spyOn(element, 'updateState').and.callThrough();
			const onStateChangedSpy = spyOn(element, 'onStateChanged').and.callThrough();

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(element.extractStateCalled).toBe(6);
			expect(element.onStateChangedCalled).toBe(7);
			expect(element.onBeforeRenderCalled).toBe(8);
			expect(element.onRenderCalled).toBe(9);
			expect(element.onAfterRenderCalled).toBe(10);
			expect(element.shadowRoot.innerHTML.includes('42')).toBeTrue();
			expect(onStateChangedSpy).toHaveBeenCalledWith(jasmine.any(Object));
			expect(updateStateSpy).toHaveBeenCalled();
		});
	});

	describe('updateState', () => {
		it('calls extractState()', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);
			const extractStateSpy = spyOn(element, 'extractState').and.callThrough();

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();

			element.updateState();

			expect(extractStateSpy).toHaveBeenCalled();
		});
	});

	describe('observe', () => {
		it('registers observers', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);
			const elementStateIndexCallback = jasmine.createSpy();
			const someUnknownFieldCallback = jasmine.createSpy();
			const someWhatNullFieldCallback = jasmine.createSpy();
			const errorSpy = spyOn(console, 'error');
			//let's register the elementStateIndexCallback three times
			element.observe('elementStateIndex', elementStateIndexCallback);
			element.observe(['elementStateIndex', 'elementStateIndex'], elementStateIndexCallback);
			element.observe('someUnknowField', someUnknownFieldCallback);
			element.observe('someWhatNull', someWhatNullFieldCallback);

			//change state after registration
			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(elementStateIndexCallback).toHaveBeenCalledWith(42);
			expect(elementStateIndexCallback).toHaveBeenCalledTimes(3);
			expect(someWhatNullFieldCallback).not.toHaveBeenCalled();
			expect(someUnknownFieldCallback).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledOnceWith("Could not register observer --> 'someUnknowField' is not a field in the state of BaElementImpl");
		});

		it('registers observers and calls the callbacks immediately', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);
			const elementStateIndexCallback = jasmine.createSpy();
			const someUnknownFieldCallback = jasmine.createSpy();
			const someWhatNullFieldCallback = jasmine.createSpy();
			const errorSpy = spyOn(console, 'error');

			//change state before registration
			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});
			element.observe('elementStateIndex', elementStateIndexCallback, true);
			element.observe('someUnknowField', someUnknownFieldCallback, true);
			element.observe('someWhatNull', someWhatNullFieldCallback, true);

			expect(elementStateIndexCallback).toHaveBeenCalledOnceWith(42);
			expect(someWhatNullFieldCallback).toHaveBeenCalledWith(null);
			expect(someUnknownFieldCallback).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalledOnceWith("Could not register observer --> 'someUnknowField' is not a field in the state of BaElementImpl");
		});
	});
	describe('default css', () => {
		it('checks if a template result contains content', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element._isNothing(nothing)).toBeTrue();
			expect(element._isNothing(undefined)).toBeTrue();
			expect(element._isNothing(null)).toBeTrue();
			expect(element._isNothing('')).toBeTrue();
			expect(element._isNothing(html`some`)).toBeFalse();
		});

		it('prepends the default css', async () => {
			const element = await TestUtils.render(BaElementDefaultCss.tag);
			expect(element.shadowRoot.querySelector('#defaultCss')).toBeTruthy();
		});

		it("does not prepends the default css when #createView returns 'nothing'", async () => {
			const element = await TestUtils.render(BaElementNoDefaultCss.tag);
			expect(element.shadowRoot.querySelector('#defaultCss')).toBeFalsy();
		});
	});
});

describe('renderTagOf', () => {
	it('throws an exception when class does not inherit BaElement', () => {
		class Foo {}

		expect(() => renderTagOf(Foo)).toThrowError(TypeError, 'Foo does not inherit BaElement');
	});

	it('renders the tag as html', () => {
		expect(renderTagOf(BaElementImpl)).toBeTruthy();
	});
});
