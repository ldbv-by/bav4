import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import css from './dndImportPanel.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { MediaType } from '../../../services/HttpService';
import { setData, setData as setImportData, setUrl as setImportUrl } from '../../../store/import/import.action';
import { SourceTypeResultStatus } from '../../../services/domain/sourceType';
import { isHttpUrl } from '../../../utils/checks';

const Update_DropZone_Content = 'update_dropzone_content';
const DragAndDropTypesMimeTypeFiles = 'Files';
const stopRedirectAndDefaultHandler = (e) => {
	e.stopPropagation();
	e.preventDefault();
};
/**
 * @class
 * @author thiloSchlemmer
 */
export class DndImportPanel extends MvuElement {

	constructor() {
		super({
			dropzoneContent: null,
			isActive: false
		});
		const { TranslationService, SourceTypeService } = $injector.inject('TranslationService', 'SourceTypeService');
		this._translationService = TranslationService;
		this._sourceTypeService = SourceTypeService;
	}

	/**
	 * @override
	 */
	onInitialize() {
		document.addEventListener('dragenter', (e) => this._onDragEnter(e));
	}

	/**
	* @override
	*/
	update(type, data, model) {
		switch (type) {
			case Update_DropZone_Content:
				return { ...model, dropzoneContent: data, isActive: data !== null };
		}
	}

	/**
	*@override
	*/
	createView(model) {
		const onDragOver = (e) => {
			stopRedirectAndDefaultHandler(e);
		};
		const onDragLeave = (e) => {
			stopRedirectAndDefaultHandler(e);
			this.signal(Update_DropZone_Content, null);
		};

		const onDrop = (e) => {
			stopRedirectAndDefaultHandler(e);
			const types = e.dataTransfer.types || [];
			types.forEach(type => {
				switch (type) {
					case DragAndDropTypesMimeTypeFiles:
						this._importFile(e.dataTransfer);
						break;
					case MediaType.TEXT_PLAIN:
						this._importText(e.dataTransfer);
						break;
				}
			});
			this.signal(Update_DropZone_Content, null);
		};

		const activeClass = {
			is_active: model.isActive
		};

		return html`<style>${css}</style>
		<div id='dropzone' class='dropzone ${classMap(activeClass)}' @dragover=${onDragOver} @dragleave=${onDragLeave} @drop=${onDrop}>${model.dropzoneContent ? model.dropzoneContent : nothing}</div>
		`;
	}

	_onDragEnter(e) {
		const translate = (key) => this._translationService.translate(key);

		stopRedirectAndDefaultHandler(e);
		const types = e.dataTransfer.types || [];

		if (types.length === 0) {
			return;
		}

		const importType = types.find(t => /(files|text\/plain)/i.test(t));
		const signalImport = (importType) => {
			const content = importType === MediaType.TEXT_PLAIN ? translate('dndImport_import_textcontent') : translate('dndImport_import_filecontent');
			this.signal(Update_DropZone_Content, content);
		};
		const signalNoImport = () => {
			this.signal(Update_DropZone_Content, translate('dndImport_import_unknown'));
		};
		const importAction = importType ? signalImport : signalNoImport;
		importAction(importType);
	}

	/**
	  * Calls the importAction or emits a notification, when the SourceTypeResultStatus is
	  * other than {@link SourceTypeResultStatus.OK}
	  * @param {SourceTypeResult} sourceTypeResult the sourceTypeResult
	  * @param {function} importAction the importAction
	  */
	_importOrNotify(sourceTypeResult, importAction) {
		const translate = (key) => this._translationService.translate(key);
		switch (sourceTypeResult.status) {
			case SourceTypeResultStatus.OK:
				importAction();
				break;
			case SourceTypeResultStatus.MAX_SIZE_EXCEEDED:
				emitNotification(translate('dndImport_import_max_size_exceeded'), LevelTypes.WARN);
				break;
			case SourceTypeResultStatus.UNSUPPORTED_TYPE:
				emitNotification(translate('dndImport_import_unsupported'), LevelTypes.WARN);
				break;
			case SourceTypeResultStatus.OTHER:
				emitNotification(translate('dndImport_import_unknown'), LevelTypes.ERROR);
		}
	}

	_importFile(dataTransfer) {
		const translate = (key) => this._translationService.translate(key);
		const files = dataTransfer.files;

		const importData = async (blob, sourceType) => {
			const text = await blob.text();
			setData(text, sourceType);
		};
		const handleFiles = (files) => {
			Array.from(files).forEach(f => {
				try {
					const sourceTypeResult = this._sourceTypeService.forBlob(f);
					this._importOrNotify(sourceTypeResult, () => importData(f, sourceTypeResult.sourceType));
				}
				catch (error) {
					emitNotification(translate('dndImport_import_file_error'), LevelTypes.ERROR);
				}
			});
		};

		const warnNoFileFound = () => {
			emitNotification(translate('dndImport_import_no_file_found'), LevelTypes.WARN);
		};

		const importAction = files && 0 < files.length ? handleFiles : warnNoFileFound;
		importAction(files);
	}

	_importText(dataTransfer) {
		const textData = dataTransfer.getData(MediaType.TEXT_PLAIN);

		const importAsLocalData = (data) => {
			const sourceTypeResult = this._sourceTypeService.forData(data);
			this._importOrNotify(sourceTypeResult, () => setImportData(data, sourceTypeResult.sourceType));
		};

		const importAsUrl = async (url) => {
			const sourceTypeResult = await this._sourceTypeService.forUrl(url);
			this._importOrNotify(sourceTypeResult, () => setImportUrl(url, sourceTypeResult.sourceType));
		};

		const importAction = isHttpUrl(textData) ? importAsUrl : importAsLocalData;
		importAction(textData);
	}

	static get tag() {
		return 'ba-dnd-import-panel';
	}

}
