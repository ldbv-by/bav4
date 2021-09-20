import { MvpElement } from '../../src/modules/MvpElement';
import { html, nothing } from 'lit-html';
import { TestUtils } from '../test-utils.js';


let skipRendering = false;

class MvpElementImpl extends MvpElement {

	constructor() {
		super({
			local: 'foo'
		});
		//just for test purposes
		this.callOrderIndex = 0;

		this.observe(state => state.root.applicationStateIndex, applicationStateIndex => this.model.global = applicationStateIndex);
	}

	set local(data) {
		this.model.local = data;
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
		return html`
			<div class='ba-element-impl-local'> ${state.local}</div>
			<div class='ba-element-impl-global'> ${state.global}</div>
			`;
	}

	static get tag() {
		return 'ba-element-impl';
	}
}

class MvuElementNoImpl extends MvpElement {
}

class MvuElementDefaultCss extends MvpElement {


	defaultCss() {
		return html`<style id='defaultCss'></style>`;
	}

	createView() {
		return html`something`;
	}

	static get tag() {
		return 'ba-element-default-css';
	}
}

class MvuElementNoDefaultCss extends MvpElement {


	defaultCss() {
		return html`<style id='defaultCss'></style>`;
	}

	createView() {
		return nothing;
	}

	static get tag() {
		return 'ba-element-no-default-css';
	}
}

window.customElements.define(MvpElementImpl.tag, MvpElementImpl);
window.customElements.define('ba-element', MvpElement);
window.customElements.define('ba-element-noimpl', MvuElementNoImpl);
window.customElements.define('ba-element-default-css', MvuElementDefaultCss);
window.customElements.define('ba-element-no-default-css', MvuElementNoDefaultCss);


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


describe('MvpElement', () => {

	beforeEach(() => {

		setupStoreAndDi();
		skipRendering = false;
	});

	describe('expected errors', () => {

		describe('constructor', () => {
			it('throws exception when instantiated without inheritance', () => {
				expect(() => new MvpElement()).toThrowError(TypeError, 'Can not construct abstract class.');
			});
		});

		describe('methods', () => {
			it('throws exception when abstract #createView is called without overriding', () => {
				expect(() => new MvuElementNoImpl().createView()).toThrowError(TypeError, 'Please implement abstract method #createView or do not call super.createView from child.');
			});

			it('throws exception when abstract static method #tag is called directly', () => {
				expect(() => MvpElement.tag).toThrowError(TypeError, 'Can not call static abstract method #tag.');
			});

			it('throws exception when abstract static method #tag is called without overriding', () => {
				expect(() => MvuElementNoImpl.tag).toThrowError(TypeError, 'Please implement static abstract method #tag or do not call static abstract method #tag from child.');
			});
		});

	});

	describe('when initialized', () => {

		it('renders the view', async () => {
			const element = await TestUtils.render(MvpElementImpl.tag);

			expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('foo')).toBeTrue();
			expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
		});

		it('calls lifecycle callbacks in correct order', async () => {
			const element = await TestUtils.render(MvpElementImpl.tag);

			expect(element.initializeCalled).toBe(0);
			expect(element.onBeforeRenderCalled).toBe(1);
			expect(element.onRenderCalled).toBe(2);
			expect(element.onAfterRenderCalled).toBe(3);
			expect(element.onWindowLoadCalled).toBe(4);
		});

		it('calls lifecycle callbacks in correct order when rendering is skipped', async () => {
			skipRendering = true;
			const element = await TestUtils.render(MvpElementImpl.tag);

			expect(element.initializeCalled).toBe(0);
			expect(element.onWindowLoadCalled).toBe(1);
		});

		it('does not call render() as long as not initialized', async () => {
			const instance = new MvpElementImpl();
			spyOn(instance, 'onBeforeRender');

			instance.render();

			expect(instance.onBeforeRender).not.toHaveBeenCalled();

			//let's initialize the component
			instance.connectedCallback();

			expect(instance.onBeforeRender).toHaveBeenCalledTimes(1);
		});

		it('calls render callbacks with argument', async () => {
			const instance = new MvpElementImpl();
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

	describe('when model changes', () => {

		describe('triggered by #updateModel ', () => {

			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvpElementImpl.tag);
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				element.updateModel({ local: 'other' });

				expect(element.onBeforeRenderCalled).toBe(5);
				expect(element.onRenderCalled).toBe(6);
				expect(element.onAfterRenderCalled).toBe(7);
				expect(onModelChangedSpy).toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('other')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
			});
		});
		describe('triggered by model getter', () => {

			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvpElementImpl.tag);
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				element.model.local = 'other';

				expect(element.onBeforeRenderCalled).toBe(5);
				expect(element.onRenderCalled).toBe(6);
				expect(element.onAfterRenderCalled).toBe(7);
				expect(onModelChangedSpy).toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('other')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
			});
		});

		describe('triggered by a global state change', () => {

			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvpElementImpl.tag);
				// const updateStateSpy = spyOn(element, 'updateState').and.callThrough();
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

		describe('triggered by a setter of the component', () => {

			it('calls callbacks in correct order and updates the view', async () => {
				const element = await TestUtils.render(MvpElementImpl.tag);
				// const updateStateSpy = spyOn(element, 'updateState').and.callThrough();
				const onModelChangedSpy = spyOn(element, 'onModelChanged').and.callThrough();

				element.local = 'bar';

				expect(element.onBeforeRenderCalled).toBe(5);
				expect(element.onRenderCalled).toBe(6);
				expect(element.onAfterRenderCalled).toBe(7);
				expect(onModelChangedSpy).toHaveBeenCalled();
				expect(element.shadowRoot.querySelector('.ba-element-impl-local').innerHTML.includes('bar')).toBeTrue();
				expect(element.shadowRoot.querySelector('.ba-element-impl-global').innerHTML.includes(21)).toBeTrue();
			});
		});
	});

	describe('default css', () => {

		it('checks if a template result contains content', async () => {
			const element = await TestUtils.render(MvpElementImpl.tag);

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

		it('does not prepends the default css when #createView returns \'nothing\'', async () => {
			const element = await TestUtils.render(MvuElementNoDefaultCss.tag);
			expect(element.shadowRoot.querySelector('#defaultCss')).toBeFalsy();
		});

	});
});
