/**
 * @module modules/routing/components/routingContainer/routingContainer
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { MvuElement } from '../../../MvuElement';

/**
 * Container component for routing related information
 * @author thiloSchlemmer
 */
export class RoutingContainer extends MvuElement {
	createView() {
		return html`<div class="routing_container">
			<ba-routing-category-bar></ba-routing-category-bar>
			<ba-routing-feedback></ba-routing-feedback>
			<ba-routing-info></ba-routing-info>
			<ba-routing-waypoints></ba-routing-waypoints>
			<ba-routing-details></ba-routing-details>
		</div>`;
	}

	static get tag() {
		return 'ba-routing-container';
	}
}
