import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection/index.js';
import { ThreeDimensionButton } from '../../../../../src/modules/map/components/threeDimensionButton/ThreeDimensionButton.js';
window.customElements.define(ThreeDimensionButton.tag, ThreeDimensionButton);

describe('ThreeDimensionButton', () => {
	const setup = async () => {
		const state = {};

		TestUtils.setupStoreAndDi(state, {});

		$injector.registerSingleton('TranslationService', { translate: (key) => key });

		return await TestUtils.render(ThreeDimensionButton.tag);
	};

	describe('when initialized', () => {
		it('shows a 3D button', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.three-dimension-button')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.icon.three-dimension-icon')).toBeTruthy();

			const link = element.shadowRoot.querySelector('.three-dimension-button');
			expect(link.href).toEqual('https://atlas.bayern.de/?');
			expect(link.target).toEqual('_blank');
		});
	});
});
