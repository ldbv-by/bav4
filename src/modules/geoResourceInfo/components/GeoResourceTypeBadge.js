/**
 * @module modules/geoResourceInfo/components/GeoResourceTypeBadge
 */
import { GeoResourceFuture } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { html, nothing } from 'lit-html';

const UPDATE_GEORESOURCE_ID = 'update_georesource_id';
const UPDATE_SIZE = 'update_size';

/**
 * Component rendering a badge for a `GeoResource` type.
 *
 * The component listens for a `geoResourceId` update and displays
 * a localized badge label and tooltip based on the type of the referenced `GeoResource`.
 * @property {String} geoResourceId - The ID of the referenced GeoResource
 * @property {number} size - The size of the badge in `rem`
 * @class
 */
export class GeoResourceTypeBadge extends MvuElement {
	#translationService;
	#geoResourceService;

	constructor() {
		super({ geoResourceId: null, size: 0.75 });
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
			case UPDATE_SIZE:
				return { ...model, size: data };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const { geoResourceId, size } = model;
		const geoResource = this.#geoResourceService.byId(geoResourceId);

		if (geoResource) {
			const type =
				geoResource instanceof GeoResourceFuture
					? (geoResource.getExpectedType()?.description ?? geoResource.getType().description)
					: geoResource.getType().description;

			return html`
				<ba-badge
					.color=${'var(--text1)'}
					.background=${'var( --secondary-bg-color)'}
					.size=${size}
					.label=${this.#translationService.translate(`geoResourceInfo_typeBadge_label_${type}`)}
					.title=${this.#translationService.translate(`geoResourceInfo_typeBadge_desc_${type}`)}
				></ba-badge>
			`;
		}
		return nothing;
	}
	static get tag() {
		return 'ba-georesource-type-badge';
	}

	set geoResourceId(value) {
		this.signal(UPDATE_GEORESOURCE_ID, value);
	}
	get geoResourceId() {
		return this.getModel().geoResourceId;
	}

	/**
	 * @property {number} size=.8 - Size of the Badge in rem
	 */
	set size(value) {
		this.signal(UPDATE_SIZE, value);
	}

	get size() {
		return this.getModel().size;
	}
}
