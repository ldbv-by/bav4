/**
 * @module modules/geoResourceInfo/components/GeoResourceBadge
 */
import { GeoResourceBadgeType, GeoResourceFuture } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { html, nothing } from 'lit-html';

const UPDATE_GEORESOURCE_ID = 'update_georesource_id';
const UPDATE_BADGE_TYPES = 'update_badge_types';

/**
 * Component rendering a badge for a `GeoResource` type.
 *
 * The component listens for a `geoResourceId` update and displays
 * a localized badge label and tooltip based on the type of the referenced `GeoResource`.
 * @property {String} geoResourceId - The ID of the referenced GeoResource
 * @property {GeoResourceBadgeType} geoResourceBadgeTypes - The badge types to display for the referenced `GeoResource`.
 * @property {function} clickAction - An optional function that is called when a badge is clicked
 * @class
 */
export class GeoResourceBadge extends MvuElement {
	#translationService;
	#geoResourceService;
	#clickAction = null;

	constructor() {
		super({ geoResourceId: null, geoResourceBadgeTypes: [] });
		const { TranslationService: translationService, GeoResourceService: geoResourceService } = $injector.inject(
			'TranslationService',
			'GeoResourceService'
		);

		this.#translationService = translationService;
		this.#geoResourceService = geoResourceService;
	}
	update(type, data, model) {
		switch (type) {
			case UPDATE_GEORESOURCE_ID:
				return { ...model, geoResourceId: data };
			case UPDATE_BADGE_TYPES:
				return { ...model, geoResourceBadgeTypes: data };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const { geoResourceId, geoResourceBadgeTypes } = model;
		const geoResource = this.#geoResourceService.byId(geoResourceId);

		if (!geoResource) return nothing;

		const createBadgeHtml = (label, description, color) => {
			const executeClickAction = () => {
				if (this.#clickAction) {
					//@ts-ignore
					this.#clickAction(this, label, description);
				}
			};

			return html` <ba-badge .color=${color} .label=${label} .title=${description} @click=${executeClickAction}></ba-badge> `;
		};

		return geoResourceBadgeTypes.map((type) => {
			switch (type) {
				case GeoResourceBadgeType.MapType: {
					const mapType =
						geoResource instanceof GeoResourceFuture
							? (geoResource.getExpectedType()?.description ?? geoResource.getType().description)
							: geoResource.getType().description;

					return createBadgeHtml(
						this.#translationService.translate(`geoResourceInfo_typeBadge_label_${mapType}`),
						this.#translationService.translate(`geoResourceInfo_typeBadge_desc_${mapType}`),
						'var(--text5)'
					);
				}
				case GeoResourceBadgeType.Keyword: {
					const keywords = this.#geoResourceService.getKeywords(geoResourceId);
					return keywords.map((keyword) => createBadgeHtml(keyword.name, keyword.description, 'var(--text5)'));
				}
				default:
					return nothing;
			}
		});
	}
	static get tag() {
		return 'ba-georesource-badge';
	}

	set geoResourceId(value) {
		this.signal(UPDATE_GEORESOURCE_ID, value);
	}

	get geoResourceId() {
		return this.getModel().geoResourceId;
	}

	set geoResourceBadgeTypes(value) {
		this.signal(UPDATE_BADGE_TYPES, [...value]);
	}

	get geoResourceBadgeTypes() {
		return this.getModel().geoResourceBadgeTypes;
	}

	set clickAction(value) {
		this.#clickAction = value;
	}

	get clickAction() {
		return this.#clickAction;
	}
}
