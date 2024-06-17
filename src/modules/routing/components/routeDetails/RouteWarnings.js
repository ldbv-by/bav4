/**
 * @module modules/routing/components/routeDetails/RouteWarnings
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import css from './routeWarnings.css';
import { $injector } from '../../../../injection/index';
import { resetHighlightedSegments, setHighlightedSegments } from '../../../../store/routing/routing.action';
import { RouteWarningCriticality } from '../../../../domain/routing';

/**
 * @typedef {Object} WarningItem
 * @property {number} id The id of this chart item
 * @property {string} message The label of this chart item
 * @property {Array<number>} segments The data of this chart item
 * @property {string} image the stringified image, visualizing the chart item
 * @property {string} criticality the stringified color as rgba-value
 */

const Update_Items = 'update_items';
const Update_Collapsed_Warnings = 'update_show_warnings';
/**
 * Displays a list of warnings related to a route.
 * @class
 * @property {Array<WarningItem>} items the routing chart items
 * @author thiloSchlemmer
 */
export class RouteWarnings extends MvuElement {
	constructor() {
		super({ items: [], collapsedWarnings: false });
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	update(type, data, model) {
		switch (type) {
			case Update_Items:
				return { ...model, items: [...data] };
			case Update_Collapsed_Warnings:
				return { ...model, collapsedWarnings: data };
		}
	}

	createView(model) {
		const { items, collapsedWarnings } = model;
		const translate = (key) => this._translationService.translate(key);
		const toggleCollapseWarnings = () => {
			this.signal(Update_Collapsed_Warnings, !collapsedWarnings);
		};
		const bodyCollapseClassInfo = {
			iscollapsed: !collapsedWarnings
		};
		const iconCollapseInfoClass = {
			iconexpand: collapsedWarnings
		};
		const title = translate(collapsedWarnings ? 'routing_warnings_hide' : 'routing_warnings_show');
		return html`<style>
				${css}
			</style>
			<div class="container">
				<div class="warnings-selector" title=${title} @click="${toggleCollapseWarnings}">
					<div>
						<span class="title">${translate('routing_warnings_title')}</span>
						<span class="warnings__logo-badge">${items.length}</span>
					</div>
					<i class="icon chevron ${classMap(iconCollapseInfoClass)}"></i>
				</div>
				<div class="${classMap(bodyCollapseClassInfo)}">
					<div class="overflow-container">
						${repeat(
							items,
							(warningItem) => warningItem.name,
							(warningItem) => this._getWarningElement(warningItem)
						)}
					</div>
				</div>
			</div>`;
	}

	_getWarningElement(warningItem) {
		const translate = (key) => this._translationService.translate(key);

		const highlightSegments = (zoomToExtent) => {
			setHighlightedSegments({ segments: warningItem.segments, zoomToExtent: zoomToExtent });
		};

		const warningClasses = {
			hint_icon: warningItem.criticality === RouteWarningCriticality.HINT,
			warning_icon: warningItem.criticality !== RouteWarningCriticality.HINT
		};
		return html`<div class="item">
			<div
				class="highlight${classMap(warningClasses)}"
				@pointerdown=${() => highlightSegments(false)}
				@mouseover=${() => highlightSegments(false)}
				@mouseout=${() => resetHighlightedSegments()}
			>
				<span class="noselect">${warningItem.message}</span>
				<button class="geolocation-icon" title=${translate('routing_warnings_zoom')} @click=${() => highlightSegments(true)}></button>
			</div>
		</div>`;
	}

	set items(values) {
		if (Array.isArray(values)) {
			this.signal(Update_Items, values);
		}
	}

	static get tag() {
		return 'ba-routing-warnings';
	}
}
