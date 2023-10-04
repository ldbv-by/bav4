/**
 * @module modules/routing/components/routeDetails/RoutingWarnings
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { MvuElement } from '../../../MvuElement';
import css from './routingWarnings.css';
import { $injector } from '../../../../injection/index';

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
export class RoutingWarnings extends MvuElement {
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
				<hr />
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
							(warningItem) => warningItem.id,
							(warningItem, index) => this._getWarningElement(warningItem)
						)}
					</div>
				</div>
			</div>`;
	}

	_getWarningElement(warningItem) {
		const translate = (key) => this._translationService.translate(key);
		// eslint-disable-next-line no-unused-vars
		const onMouseOut = (item) => {
			/**
			 * todo:
			 * implement EventLike store-operation to routing slice-of-state
			 *  type:'REMOVE_HIGHLIGHTED_SEGMENTS'
			 *  payload: {}
			 */
		};

		// eslint-disable-next-line no-unused-vars
		const onMouseOver = (item) => {
			highlightSegments(true);
		};

		// eslint-disable-next-line no-unused-vars
		const highlightSegments = (zoomToExtend) => {
			/**
			 * todo:
			 * implement EventLike store-operation to routing slice-of-state
			 *  type:'HIGHLIGHT_SEGMENTS'
			 *  payload: { segments: item.segments, zoomToExtent: zoomToExtent }
			 */
		};
		const warningClasses = { hint_icon: warningItem.criticality === 'hint', warning_icon: warningItem.criticality !== 'hint' };
		return html`<div class="item">
			<div class="highlight${classMap(warningClasses)}" @mouseover=${() => onMouseOver(warningItem)} @mouseout=${() => onMouseOut(warningItem)}>
				<span class="noselect">${warningItem.message}</span>
			</div>
			<button class="geolocation-icon" title=${translate('routing_warnings_zoom')} @click=${() => highlightSegments(true)}></button>
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
