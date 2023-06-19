/**
 * @module modules/map/components/assistChips/SharePositionChip
 */
import { html } from '../../../../../node_modules/lit-html/lit-html';
import { GlobalCoordinateRepresentations } from '../../../../domain/coordinateRepresentation';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { openModal } from '../../../../store/modal/modal.action';
import { isCoordinate } from '../../../../utils/checks';
import { AbstractAssistChip } from '../../../chips/components/assistChips/AbstractAssistChip';
import shareIcon from './assets/share.svg';

const Update = 'update';

/**
 * A chip to share a specified position with a link. The link refers
 * to the webapp itself with highlight-feature on the specified position.
 * @class
 * @author thiloSchlemmer
 */
export class SharePositionChip extends AbstractAssistChip {
	constructor() {
		super({ position: null });
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UrlService: urlService,
			CoordinateService: coordinateService,
			MapService: mapService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'CoordinateService', 'MapService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._coordinateService = coordinateService;
		this._mapService = mapService;
		this._urlService = urlService;
	}

	update(type, data, model) {
		switch (type) {
			case Update:
				return {
					...model,
					position: data
				};
		}
	}

	getIcon() {
		return shareIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('map_assistChips_share_position_label');
	}

	isVisible() {
		const { position } = this.getModel();
		return isCoordinate(position);
	}

	async onClick() {
		const { position } = this.getModel();
		const useShareApi = this._environmentService.getWindow().navigator.share ? true : false;

		const { digits, code } =
			this._mapService
				.getCoordinateRepresentations(position)
				.filter((cr) => cr.code)
				.filter((cr) => cr.code === this._mapService.getLocalProjectedSrid())[0] ?? GlobalCoordinateRepresentations.WGS84;

		const transformedPosition = this._coordinateService.transform(position, this._mapService.getSrid(), code).map((n) => n.toFixed(digits));

		const url = await this._buildShareUrl(transformedPosition);
		const shareAction = useShareApi ? (url) => this._shareUrlWithApi(url) : (url) => this._shareUrlDialog(url);
		shareAction(url);
	}

	async _buildShareUrl(position) {
		const extraParams = { [QueryParameters.CROSSHAIR]: true };
		const url = new URL(this._shareService.encodeState(extraParams));
		/* We cannot override QueryParameters.CENTER by adding as part of the extraParams array, due to type 
        of the parameter (Array). The next best solution is, to rebuild the searchParams and override the key explicit.
        */
		const searchParams = new URLSearchParams(url.search);
		searchParams.set(QueryParameters.CENTER, position);
		url.search = searchParams.toString();
		try {
			const shortUrl = await this._urlService.shorten(url.toString());
			return shortUrl;
		} catch (error) {
			console.warn('Could not shorten url', error);
			return url;
		}
	}

	async _shareUrlWithApi(url) {
		const translate = (key) => this._translationService.translate(key);

		try {
			await this._environmentService.getWindow().navigator.share({
				title: translate('map_assistChips_share_position_link_title'),
				url: url
			});
		} catch (error) {
			console.error('Share-API failed:', error);
		}
	}

	async _shareUrlDialog(url) {
		const content = html`<ba-share-content .urls=${url}></ba-share-content>`;

		openModal(this._translationService.translate('map_assistChips_share_position_label'), content);
	}

	set position(value) {
		if (isCoordinate(value)) {
			this.signal(Update, value);
		}
	}

	static get tag() {
		return 'ba-share-position-chip';
	}
}
