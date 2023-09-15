/**
 * @module modules/routing/components/waypoints/Waypoints
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './waypoints.css';

const Update_Status = 'update_status';
const Update_Route = 'update_route';
const Update_Show_Waypoints = 'update_show_waypoints';

export class Waypoints extends MvuElement {
	constructor() {
		super({ status: null, route: null, showWaypoints: false });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		);

		this.observe(
			(store) => store.routing.route,
			(route) => this.signal(Update_Route, route)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
			case Update_Route:
				return { ...model, route: data };
			case Update_Show_Waypoints:
				return { ...model, showWaypoints: data };
		}
	}

	createView(model) {
		const { status, route, showWaypoints } = model;
		const translate = (key) => this._translationService.translate(key);
		const isVisible = status === RoutingStatusCodes.Ok && route?.index;

		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="container">
						<hr />
						<div class="row">
							<div class="details-selector noselect" title=${translate(showWaypoints ? 'routing_waypoints_show' : 'routing_waypoints_hide')}></div>
						</div>
					</div>`
			: nothing;
	}

	static get tag() {
		return 'ba-routing-waypoints';
	}
}
