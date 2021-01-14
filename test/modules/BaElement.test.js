import { BaElement } from '../../src/modules/BaElement';
import { html } from 'lit-html';
import { TestUtils } from '../test-utils.js';


let skipRendering = false;

class BaElementImpl extends BaElement {

	constructor() {
		super();
		this.callOrderIndex = 0;
	}

	extractState(store) {
		this.extractStateCalled = this.callOrderIndex++;
		//here we extract the local state from the application store
		const { root: { applicationStateIndex } } = store;
		return { elementStateIndex: applicationStateIndex };
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


	createView() {
		return html`<div class='ba-element-impl'> ${this._state.elementStateIndex}</div>`;
	}

	static get tag() {
		return 'ba-element-impl';
	}
}

class BaElementNoImpl extends BaElement {
}

window.customElements.define(BaElementImpl.tag, BaElementImpl);
window.customElements.define('ba-element', BaElement);
window.customElements.define('ba-element-noimpl', BaElementNoImpl);


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
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new BaElement()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #createView is called without overriding', () => {
				expect(() => new BaElementNoImpl().createView()).toThrowError(TypeError, 'Please implement abstract method #createView or do not call super.createView from child.');
			});

			it('throws excepetion when abstract static method #tag is called directly', () => {
				expect(() => BaElement.tag).toThrowError(TypeError, 'Can not call static abstract method #tag.');
			});

			it('throws excepetion when abstract static method #tag is called without overriding', () => {
				expect(() => BaElementNoImpl.tag).toThrowError(TypeError, 'Please implement static abstract method #tag or do not call static abstract method #tag from child.');
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
	});

	describe('when state changed', () => {
		it('calls state change callback in correct order', async () => {
			const element = await TestUtils.render(BaElementImpl.tag);

			expect(element.shadowRoot.querySelector('.ba-element-impl')).toBeTruthy();

			store.dispatch({
				type: INDEX_CHANGED,
				payload: 42
			});

			expect(element.extractStateCalled).toBe(6);
			expect(element.onBeforeRenderCalled).toBe(7);
			expect(element.onRenderCalled).toBe(8);
			expect(element.onAfterRenderCalled).toBe(9);
			expect(element.shadowRoot.innerHTML.includes('42')).toBeTrue();
		});
	});
});
