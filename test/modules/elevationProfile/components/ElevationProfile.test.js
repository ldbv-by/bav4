import { TestUtils } from '../../../test-utils';
import { ElevationProfile } from '../../../../src/modules/profile/components/ElevationProfile';

window.customElements.define(ElevationProfile.tag, ElevationProfile);

describe('ElevationProfile', () => {

	const setup = () => {

		TestUtils.setupStoreAndDi({});
		return TestUtils.render(ElevationProfile.tag);
	};

	describe('constructor', () => {

		it('sets a default model', async () => {
			setup();
			const element = new ElevationProfile();

			expect(element.getModel()).toEqual({
				data: [0, 0, 0, 0, 0, 0]
			});
			expect(element._chart).toBeNull();
		});
	});

	fdescribe('when initialized', () => {

		it('renders a canvas element and initializes the chart', async () => {
			const element = await setup();
			const { _chart: chart } = element;

			expect(element.shadowRoot.querySelectorAll('canvas')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('canvas')[0].classList.contains('elevationprofile')).toBeTrue();
			// eslint-disable-next-line no-console
			console.log('🚀 ~ file: ElevationProfile.test.js ~ line 35 ~ it ~ element.shadowRoot.querySelectorAll(\'canvas\')[0].classList', element.shadowRoot.querySelectorAll('canvas')[0].classList);
			// expect(chart.data.labels).toEqual(['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']);
			// expect(chart.data.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0]);
			expect(chart.data.datasets[0].backgroundColor).toBe('#eeeeff');
			expect(chart.data.datasets[0].borderWidth).toBe(4);
			expect(chart.options.responsive).toBeTrue();
		});
	});

	describe('when model changes', () => {

		beforeEach(function () {
			jasmine.clock().install();
		});

		afterEach(function () {
			jasmine.clock().uninstall();
		});

		it('updates the chart', async () => {
			const { _chart: chart } = await setup();

			jasmine.clock().tick(2000 + 100); // let's 'wait' for the first update of out model

			expect(chart.data.datasets[0].data.length).toBe(6);
			expect(chart.data.datasets[0].data).not.toEqual([0, 0, 0, 0, 0, 0]);
		});
	});
});
