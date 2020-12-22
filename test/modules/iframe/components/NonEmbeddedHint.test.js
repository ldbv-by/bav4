/* eslint-disable no-undef */
import { NonEmbeddedHint } from '../../../../src/modules/iframe/components/NonEmbeddedHint';
import { TestUtils } from '../../../test-utils';
import { $injector } from '../../../../src/injection';

window.customElements.define(NonEmbeddedHint.tag, NonEmbeddedHint);

describe('NonEmbeddedHint', () => {

	const setup = (config) => {
		const { embed, window } = config;

		TestUtils.setupStoreAndDi();
		$injector.registerSingleton('EnvironmentService', {
			getWindow: () => window,
			isEmbedded: () => embed
		});
		return TestUtils.render(NonEmbeddedHint.tag);
	};

	describe('when initialized', () => {
		it('does nothing when embedded version is not requested', async () => {

			await setup({ embed: false, window: {} });

			expect(document.body.innerHTML).toBe('<ba-nonembedded-hint></ba-nonembedded-hint>');
		});

		it('does nothing when embedded version is requested within an iframe', async () => {
			const mockWindow = {
				location: 'app',
				parent: {
					location: 'iframe'
				}
			};

			await setup({ embed: true, window: mockWindow });

			expect(document.body.innerHTML).toBe('<ba-nonembedded-hint></ba-nonembedded-hint>');
		});

		it('renders the hint when embedded version is NOT requested within an iframe', async () => {
			const mockWindow = {
				location: 'app',
				parent: {
					location: 'app'
				}
			};

			await setup({ embed: true, window: mockWindow });

			expect(document.body.textContent).toBe('The embedded version must be used in an iframe.');
		});
	});
});