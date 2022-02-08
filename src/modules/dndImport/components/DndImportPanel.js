import { html } from 'lit-html';
import { $injector } from '../../../injection';
import { MvuElement } from '../../MvuElement';
import css from './dndImportPanel.css';

const Update_Drag_Active = 'update_drag_active';
const DragAndDropTypesMimeTypeFiles = 'Files';
const DragAndDropTypesMimeTypeText = 'text/plain';

/**
 * @class
 * @author thiloSchlemmer
 */
export class DndImportPanel extends MvuElement {

	constructor() {
		super({
			isDragActive: false
		});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	* @override
	*/
	update(type, data, model) {
		switch (type) {
			case Update_Drag_Active:
				return { ...model, isDragActive: data };
		}
	}

	/**
	*@override
	*/
	createView(model) {
		const translate = (key) => this._translationService.translate(key);
		const getActiveClass = () => {
			return model.isDragActive ? 'is-active' : 'is-hidden';
		};

		const stopRedirectAndDefaultHandler = (e) => {
			e.stopPropagation();
			e.preventDefault();
		};

		const onDragEnter = (e) => {
			stopRedirectAndDefaultHandler(e);
			const types = e.dataTransfer.types || [];
			const isImport = (types) => types.some(t => /(files|text\/plain)/i.test(t));
			if (isImport(types)) {
				this.signal(Update_Drag_Active, true);
			}

		};
		const onDragOver = (e) => {
			stopRedirectAndDefaultHandler(e);
		};
		const onDragLeave = (e) => {
			stopRedirectAndDefaultHandler(e);
			this.signal(Update_Drag_Active, false);
		};
		const onDrop = (e) => {
			const types = e.dataTransfer.types || [];
			types.forEach(type => {
				switch (type) {
					case DragAndDropTypesMimeTypeFiles:
						this._importFile(e.dataTransfer);
						break;
					case DragAndDropTypesMimeTypeText:
						this._importText(e.dataTransfer);
						break;
					default:
						console.warn('No valid data in drop-object');
				}

			});

			this.signal(Update_Drag_Active, false);
		};

		return html`<style>${css}</style>
		<div class='droppanel' @dragenter=${onDragEnter} @dragover=${onDragOver} @dragleave=${onDragLeave} @drop=${onDrop}>
			<div class='dropzone ${getActiveClass()}' >${translate('dndImport_import_textcontent')}</div>
		</div>`;
	}

	static get tag() {
		return 'ba-dnd-import-panel';
	}

	_importFile(dataTransfer) {
		const files = dataTransfer.files;
		if (files && 0 < files.length) {
			Array.from(files).forEach(f => {
				console.log('importing File', f);
			});
		}
	}

	_importText(dataTransfer) {
		const textData = dataTransfer.getData(DragAndDropTypesMimeTypeText);
		console.log('importing Text-Content:', textData);
	}
}
