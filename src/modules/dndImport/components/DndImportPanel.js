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
		const translate = (key) => this._translationService.translate(key);
		const stopRedirectAndDefaultHandler = (e) => {
			e.stopPropagation();
			e.preventDefault();
		};

		const onDragEnter = (e) => {
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
		};

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

		document.addEventListener('dragenter', onDragEnter);

		const activeClass = {
			is_active: model.isActive
		};

		return html`<style>${css}</style>
		<div id='dropzone' class='dropzone ${classMap(activeClass)}' @dragover=${onDragOver} @dragleave=${onDragLeave} @drop=${onDrop}>${model.dropzoneContent ? model.dropzoneContent : nothing}</div>
		`;
	}

	static get tag() {
		return 'ba-dnd-import-panel';
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
					switch (sourceTypeResult.status) {
						case SourceTypeResultStatus.OK:
							importData(f, sourceTypeResult.sourceType);
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
		const translate = (key) => this._translationService.translate(key);
		const textData = dataTransfer.getData(MediaType.TEXT_PLAIN);
		const importAsLocalData = (data) => {
			const sourceTypeResult = this._sourceTypeService.forData(data, MediaType.TEXT_PLAIN);
			switch (sourceTypeResult.status) {
				case SourceTypeResultStatus.OK:
					setImportData(data, sourceTypeResult.sourceType);
					break;
				case SourceTypeResultStatus.UNSUPPORTED_TYPE:
					emitNotification(translate('dndImport_import_unsupported'), LevelTypes.WARN);
					break;
				case SourceTypeResultStatus.OTHER:
					emitNotification(translate('dndImport_import_unknown'), LevelTypes.ERROR);
			}
		};
		const importAsUrl = (url) => {
			setImportUrl(url, null);
		};

		const importAction = isHttpUrl(textData) ? importAsUrl : importAsLocalData;
		importAction(textData);
	}

}
