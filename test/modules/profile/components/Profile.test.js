import { TestUtils } from '../../../test-utils';
import { Profile } from '../../../../src/modules/profile/components/Profile';

window.customElements.define(Profile.tag, Profile);

describe('Profile', () => {

	const setup = () => {

		TestUtils.setupStoreAndDi({});
		return TestUtils.render(Profile.tag);
	};

	describe('constructor', () => {

		it('sets a default model', async () => {
			setup();
			const element = new Profile();

			expect(element.getModel()).toEqual({
				data: [0, 0, 0, 0, 0, 0]
			});
			expect(element._chart).toBeNull();
		});
	});

	describe('when initialized', () => {

		it('renders a canvas element and initializes the chart', async () => {
			const element = await setup();
			const { _chart: chart } = element;

			expect(element.shadowRoot.querySelectorAll('canvas')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('canvas')[0].classList.contains('profile')).toBeTrue();
			expect(chart.data.labels).toEqual(['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']);
			expect(chart.data.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0]);
			expect(chart.data.datasets[0].backgroundColor).toEqual([
				'rgba(255, 99, 132, 0.2)',
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 206, 86, 0.2)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(153, 102, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)'
			]);
			expect(chart.data.datasets[0].borderColor).toEqual([
				'rgba(255, 99, 132, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)'
			]);
			expect(chart.data.datasets[0].borderWidth).toBe(1);
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
