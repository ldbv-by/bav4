import { ScaleLine } from '../../../../../src/modules/map/components/scaleLine/ScaleLine';
import { TestUtils } from '../../../../test-utils.js';

window.customElements.define(ScaleLine.tag, ScaleLine);

describe('ScaleLine', () => {

	const setup = () => {	
		TestUtils.setupStoreAndDi();	
		return TestUtils.render(ScaleLine.tag);
	};

	describe('when initialized', () => {
		it('renders ScaleLine component', async () => {
			const element = await setup();
			expect(element.shadowRoot.querySelector('.scale-line')).toBeTruthy();
		});
	});
});