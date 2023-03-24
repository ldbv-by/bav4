import { $injector } from '../../../../src/injection';
import { TestUtils } from '../../../test-utils';
import { html } from 'lit-html';
import { IframeContainer } from '../../../../src/modules/iframe/components/container/IframeContainer';
import { iframeContainerReducer, initialState as iframeContainerInitialState } from '../../../../src/store/iframeContainer/iframeContainer.reducer';
import { closeContainer, openContainer } from '../../../../src/store/iframeContainer/iframeContainer.action';

window.customElements.define(IframeContainer.tag, IframeContainer);

describe('IframeContainer', () => {
	const setup = (state = {}, config = {}) => {
		const initialState = {
			iframeContainer: iframeContainerInitialState,
			...state
		};
		const { embed = true } = config;

		TestUtils.setupStoreAndDi(initialState, {
			iframeContainer: iframeContainerReducer
		});
		$injector.registerSingleton('EnvironmentService', { isEmbedded: () => embed });
		return TestUtils.render(IframeContainer.tag);
	};

	describe('constructor', () => {
		it('sets a default model', async () => {
			setup();
			const element = new IframeContainer();

			expect(element.getModel()).toEqual({
				content: null,
				active: false
			});
		});
	});

	describe('when initialized', () => {
		it('renders no content', async () => {
			const element = await setup();

			expect(element.shadowRoot.childElementCount).toBe(0);
		});

		it('renders the content', async () => {
			const element = await setup({ iframeContainer: { content: 'content', active: true } });

			expect(element.shadowRoot.querySelector('.container').innerText).toBe('content');
		});

		it('renders nothing when NOT embedded', async () => {
			const element = await setup({ iframeContainer: { content: 'content', active: true } }, { embed: false });

			expect(element.shadowRoot.children.length).toBe(0);
		});
	});

	describe('when model changes', () => {
		describe('-> property "content"', () => {
			it('adds content from a string', async () => {
				const element = await setup();

				openContainer('content');

				expect(element.shadowRoot.querySelector('.container').innerText).toBe('content');
			});

			it('adds content from a lit-html TemplateResult', async () => {
				const element = await setup();
				const template = (str) => html`${str}`;

				openContainer(template('content'));

				expect(element.shadowRoot.querySelector('.container').innerText).toBe('content');
			});
		});

		describe('-> property "active"', () => {
			it('closes the container', async () => {
				const element = await setup();
				openContainer('content');

				closeContainer();

				expect(element.shadowRoot.childElementCount).toBe(0);
			});
		});
	});
});
