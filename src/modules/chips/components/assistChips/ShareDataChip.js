/**
 * @module modules/chips/components/assistChips/ShareDataChip
 */
import { html } from 'lit-html';
import { QueryParameters } from '../../../../domain/queryParameters';
import { $injector } from '../../../../injection/index';
import { openModal } from '../../../../store/modal/modal.action';
import { AbstractAssistChip } from './AbstractAssistChip';
import shareIcon from './assets/share.svg';
import { setQueryParams } from '../../../../utils/urlUtils';

const Update_Latest = 'update_latest';
const Update_FileId = 'update_fileId';
const Update_AdminId = 'update_adminId';
/**
 * A chip to share a stored file. The file is stored by the backend and
 * consist of drawings or measurements created within the application.
 * @class
 * @extends {AbstractAssistChip}
 * @author thiloSchlemmer
 */
export class ShareDataChip extends AbstractAssistChip {
	constructor() {
		super({ storedDataAvailable: false, adminId: null, fileId: null });
		const {
			TranslationService: translationService,
			EnvironmentService: environmentService,
			UrlService: urlService,
			ShareService: shareService
		} = $injector.inject('TranslationService', 'EnvironmentService', 'UrlService', 'ShareService');
		this._translationService = translationService;
		this._environmentService = environmentService;
		this._shareService = shareService;
		this._urlService = urlService;
		this.observe(
			(state) => state.fileStorage.latest,
			(data) => this.signal(Update_Latest, data)
		);

		this.observe(
			(state) => state.fileStorage.fileId,
			(data) => this.signal(Update_FileId, data)
		);

		this.observe(
			(state) => state.fileStorage.adminId,
			(data) => this.signal(Update_AdminId, data)
		);
	}

	update(type, data, model) {
		switch (type) {
			case Update_Latest:
				return {
					...model,
					storedDataAvailable: data.payload.success
				};
			case Update_AdminId:
				return {
					...model,
					adminId: data
				};
			case Update_FileId:
				return {
					...model,
					fileId: data
				};
		}
	}

	getIcon() {
		return shareIcon;
	}

	getLabel() {
		const translate = (key) => this._translationService.translate(key);
		return translate('chips_assist_chip_share_stored_data');
	}

	isVisible() {
		const { storedDataAvailable } = this.getModel();

		return !!storedDataAvailable;
	}

	async onClick() {
		const translate = (key) => this._translationService.translate(key);
		const title = translate('chips_assist_chip_share_stored_data');
		const { fileId, adminId } = this.getModel();
		const buildShareUrl = async (id) => {
			const extraParams = { [QueryParameters.LAYER]: id };
			/**
			 * Todo: For now as a workaround for https://github.com/ldbv-by/bav4/issues/2478 we always set an existing TOOL_ID query parameter to "",
			 * but in the future it does make sense to activate the draw or measurement tool when the file is shared with admin privileges.
			 */
			const url = setQueryParams(this._shareService.encodeState(extraParams), { [QueryParameters.TOOL_ID]: null });
			try {
				const shortUrl = await this._urlService.shorten(url);
				return shortUrl;
			} catch (error) {
				console.warn('Could not shorten url', error);
				return url;
			}
		};
		const generateShareUrls = async () => {
			const forAdminId = await buildShareUrl(adminId);
			const forFileId = await buildShareUrl(fileId);
			return { adminId: forAdminId, fileId: forFileId };
		};

		const urls = await generateShareUrls();
		openModal(title, html`<ba-share-content .urls=${urls}></ba-share-content>`);
	}

	static get tag() {
		return 'ba-share-data-chip';
	}
}
