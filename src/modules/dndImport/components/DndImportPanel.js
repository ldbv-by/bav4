import { html, nothing } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import css from './dndImportPanel.css';
import { classMap } from 'lit-html/directives/class-map.js';

const Update_DropZone_Content = 'update_dropzone_content';
const DragAndDropTypesMimeTypeFiles = 'Files';
const DragAndDropTypesMimeTypeText = 'text/plain';

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
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
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
			const importType = types.find(t => /(files|text\/plain)/i.test(t));

			const signalImport = (importType) => {
				const content = importType === DragAndDropTypesMimeTypeText ? translate('dndImport_import_textcontent') : translate('dndImport_import_filecontent');
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
					case DragAndDropTypesMimeTypeText:
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
		const readHead = async (file) => {
			const textContent = await file.text();
			return textContent.slice(0, 100);
		};
		const handleFiles = (files) => {
			Array.from(files).forEach(async f => {
				try {
					const textContent = await readHead(f) + '...';
					emitNotification(html`<b>Importing File:</b><br> 
			<i>${textContent}</i>`, LevelTypes.INFO);
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
		// todo: extract to utils or UrlService
		// based on https://stackoverflow.com/a/43467144
		const isValidHttpUrl = (urlCandidate) => {
			const getUrl = (string) => {
				try {
					return new URL(string);
				}
				catch (_) {
					return null;
				}
			};

			const url = getUrl(urlCandidate);
			return url ? (url.protocol === 'http:' || url.protocol === 'https:') : false;
		};

		const textData = dataTransfer.getData(DragAndDropTypesMimeTypeText);
		const content = isValidHttpUrl(textData)
			? html`<b>Importing File-Content:</b> <a href='${textData}' >'${textData}'</i>`
			: html`<b>Importing Text-Content:</b> <i>'${textData}'</i>`;
		emitNotification(content, LevelTypes.INFO);
	}

}
