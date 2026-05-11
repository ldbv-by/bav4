import { MvuElement } from '@src/modules/MvuElement';
import { RoutingContainer } from '@src/modules/routing/components/routingContainer/routingContainer';
import { TestUtils } from '@test/test-utils';
window.customElements.define(RoutingContainer.tag, RoutingContainer);

describe('RoutingContainer', () => {
	const setup = () => {
		TestUtils.setupStoreAndDi({}, {});
		return TestUtils.render(RoutingContainer.tag);
	};

	describe('class', () => {
		it('inherits from MvuElement', async () => {
			const element = await setup();

			expect(element instanceof MvuElement).toBe(true);
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

			expect(container).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-feedback')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-category-bar')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-waypoints')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-info')).toHaveLength(1);
			expect(element.shadowRoot.querySelectorAll('ba-routing-details')).toHaveLength(1);
		});
	});
});
