import { MvuElement } from '../../../../src/modules/MvuElement';
import { RoutingContainer } from '../../../../src/modules/routing/components/routingContainer/routingContainer';
import { TestUtils } from '../../../test-utils';
window.customElements.define(RoutingContainer.tag, RoutingContainer);

describe('RoutingContainer', () => {
	const setup = () => {
		TestUtils.setupStoreAndDi({}, {});
		return TestUtils.render(RoutingContainer.tag);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBeTrue();
		});
	});

	describe('when instantiated', () => {
		it('has a model containing default values', async () => {
			await setup();
			const model = new RoutingContainer().getModel();

			expect(model).toEqual({});
		});
	});

	describe('when initialized', () => {
		it('renders the routing components', async () => {
			const element = await setup();

			const container = element.shadowRoot.querySelectorAll('.routing_container');

			expect(container).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-feedback')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-category-bar')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-waypoints')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-info')).toHaveSize(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-details')).toHaveSize(1);
		});
	});
});
