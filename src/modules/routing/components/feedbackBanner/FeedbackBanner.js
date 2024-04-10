/**
 * @module modules/routing/components/feedbackBanner/FeedbackBanner
 */
import { html, nothing } from '../../../../../node_modules/lit-html/lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { RoutingStatusCodes } from '../../../../domain/routing';
import { $injector } from '../../../../injection/index';
import { MvuElement } from '../../../MvuElement';
import css from './feedbackBanner.css';

const Update_Status = 'update_status';

const Status_Visibility = [RoutingStatusCodes.Start_Destination_Missing, RoutingStatusCodes.Start_Missing, RoutingStatusCodes.Destination_Missing];

/**
 * Gives the user feedback about the routing status.
 * @author thiloSchlemmer
 */
export class FeedbackBanner extends MvuElement {
	constructor() {
		super({ status: null });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	onInitialize() {
		this.observe(
			(store) => store.routing.status,
			(status) => this.signal(Update_Status, status)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Status:
				return { ...model, status: data };
		}
	}

	createView(model) {
		const { status } = model;
		const translate = (key) => this._translationService.translate(key);
		const isVisible = Status_Visibility.includes(status);
		const className = isVisible ? `status-${status}` : '';
		const iconClassName = isVisible ? `icon-status-${status}` : '';

		return isVisible
			? html`<style>
						${css}
					</style>
					<div class="container">
						<div class="icon ${iconClassName}"></div>

						<span class=${className}>${unsafeHTML(translate('routing_feedback_' + status))}</span>
					</div>`
			: nothing;
	}

	static get tag() {
		return 'ba-routing-feedback';
	}
}
