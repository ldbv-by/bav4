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
 * @class
 */
export class GeoResourceBadge extends MvuElement {
	#translationService;
	#geoResourceService;

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

		return geoResourceBadgeTypes.map((type) => {
			switch (type) {
				case GeoResourceBadgeType.MapType: {
					const mapType =
						geoResource instanceof GeoResourceFuture
							? (geoResource.getExpectedType()?.description ?? geoResource.getType().description)
							: geoResource.getType().description;

					return html`
						<ba-badge
							.color=${'var(--text5)'}
							.label=${this.#translationService.translate(`geoResourceInfo_typeBadge_label_${mapType}`)}
							.title=${this.#translationService.translate(`geoResourceInfo_typeBadge_desc_${mapType}`)}
						></ba-badge>
					`;
				}
				case GeoResourceBadgeType.Keyword: {
					const keywords = this.#geoResourceService.getKeywords(geoResourceId);
					return keywords.map((keyword) => html`<ba-badge .color=${'var(--text5)'} .label=${keyword.name} .title=${keyword.description}></ba-badge>`);
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
}
