/**
 * @module modules/geoResourceInfo/components/GeoResourceBadge
 */
import { GeoResourceBadgeType, GeoResourceFuture } from '@src/domain/geoResources';
import { $injector } from '@src/injection';
import { MvuElement } from '@src/modules/MvuElement';
import { html, nothing } from 'lit-html';

const UPDATE_GEORESOURCE_ID = 'update_georesource_id';
const UPDATE_BADGE_TYPES = 'update_badge_types';
const UPDATE_SIZE = 'update_size';
const UPDATE_COLOR = 'update_color';
const UPDATE_BACKGROUND = 'update_background';

/**
 * Component rendering a badge for a `GeoResource` type.
 *
 * The component listens for a `geoResourceId` update and displays
 * a localized badge label and tooltip based on the type of the referenced `GeoResource`.
 * @property {String} geoResourceId - The ID of the referenced GeoResource
 * @property {GeoResourceBadgeType} geoResourceBadgeTypes - The badge types to display for the referenced `GeoResource`.
 * @property {function} clickAction - An optional function that is called when a badge is clicked
 * @property {number} size - The size of the badge in `rem`
 * @property {string} color- The text color of the badge
 * @property {string} background - The background color of the badge
 * @class
 */
export class GeoResourceBadge extends MvuElement {
	#translationService;
	#geoResourceService;
	#clickAction = null;

	constructor() {
		super({ geoResourceId: null, geoResourceBadgeTypes: [], size: 0.75, color: 'var(--text-5)', background: 'var(--secondary-bg-color)' });
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
			case UPDATE_SIZE:
				return { ...model, size: data };
			case UPDATE_COLOR:
				return { ...model, color: data };
			case UPDATE_BACKGROUND:
				return { ...model, background: data };
		}
	}

	/**
	 *@override
	 */
	createView(model) {
		const { geoResourceId, geoResourceBadgeTypes, size, color, background } = model;
		const geoResource = this.#geoResourceService.byId(geoResourceId);

		if (!geoResource) return nothing;

		const createBadgeHtml = (label, description) => {
			const executeClickAction = () => {
				if (this.#clickAction) {
					//@ts-ignore
					this.#clickAction(this, label, description);
				}
			};

			return html`<ba-badge
				.color=${color}
				.background=${background}
				.label=${label}
				.title=${description}
				.size=${size}
				@click=${executeClickAction}
			></ba-badge>`;
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
						this.#translationService.translate(`geoResourceInfo_typeBadge_desc_${mapType}`)
					);
				}
				case GeoResourceBadgeType.Keyword: {
					const keywords = this.#geoResourceService.getKeywords(geoResourceId);
					return keywords.map((keyword) => createBadgeHtml(keyword.name, keyword.description));
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

	/**
	 * @property {number} size=.8 - Size of the Badge in rem
	 */
	set size(value) {
		this.signal(UPDATE_SIZE, value);
	}

	get size() {
		return this.getModel().size;
	}

	/**
	 * @property {string} color='var(--text-5)' - Text color of the Badge
	 */
	set color(value) {
		this.signal(UPDATE_COLOR, value);
	}

	get color() {
		return this.getModel().color;
	}

	/**
	 * @property {string} background='var(--secondary-bg-color)' - Background color of the Badge
	 */
	set background(value) {
		this.signal(UPDATE_BACKGROUND, value);
	}

	get background() {
		return this.getModel().background;
	}
}
