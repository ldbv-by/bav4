import { html } from 'lit-html';
import css from './importToolContent.css';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { $injector } from '../../../../injection';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { setData } from '../../../../store/import/import.action';
import { SourceTypeResultStatus } from '../../../../services/domain/sourceType';

/**
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class ImportToolContent extends AbstractToolContent {
	constructor() {
		super({
			mode: null
		});

		const { TranslationService, SourceTypeService } = $injector.inject('TranslationService', 'SourceTypeService');
		this._translationService = TranslationService;
		this._sourceTypeService = SourceTypeService;
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);

		const onUpload = () => {
			const inputElement = this._root.querySelector('input');
			const files = inputElement?.files;

			const importData = async (blob, sourceType) => {
				const text = await blob.text();
				setData(text, sourceType);
			};
			const handleFiles = (files) => {
				Array.from(files).forEach(async f => {
					try {

						const sourceTypeResult = await this._sourceTypeService.forBlob(f);
						this._importOrNotify(sourceTypeResult, () => importData(f, sourceTypeResult.sourceType));
					}
					catch (error) {
						emitNotification(translate('toolbox_import_file_error'), LevelTypes.ERROR);
					}
				});
			};

			if (files && 0 < files.length) {
				handleFiles(files);
			}
		};
		return html`
        <style>${css}</style>
            <div class="ba-tool-container">
				<div class="ba-tool-container__title">
					${translate('toolbox_import_data_header')}		
					<span class="ba-tool-container__sub-title">
						${translate('toolbox_import_data_subheader')}								
					</span>
				</div>
				<div class='ba-tool-container__split-text'>
					${translate('toolbox_import_data_seperator')}		
				</div>
				<div class="ba-tool-container__content divider" >                						     				
					<div class="tool-container__buttons">      
						<label for='fileupload' class="tool-container__button" role="button" tabindex="0" target="_blank" id="share-api" title="upload" > 	                              
							<div class="tool-container__background"></div>
							<div class="tool-container__icon data"></div>  
							<div class="tool-container__button-text" >
								${translate('toolbox_import_data_button')}							
							</div>
							<input id='fileupload' type='file' @change=${onUpload}></input>
						</label>
					</div>
					<div  class='drag-drop-preview'>
						<div class='text-to-search'>
							${translate('toolbox_import_data_draganddrop')}								
						</div>
						<div>
							${translate('toolbox_import_data_draganddrop_target')}											
						</div>						 
					</div>
				</div>  
				<div class="ba-tool-container__title ">
					${translate('toolbox_import_url_header')}						
					<span class="ba-tool-container__sub-title">
						${translate('toolbox_import_url_subheader')}	
					</span>
				</div>
				<div class="ba-tool-container__content ba-tool-container__url-import">      	
					${translate('toolbox_import_url_search_before')}				                  																			
				<span  class='text-to-search-icon'></span> 
				<span class='text-to-search' ">
					${translate('toolbox_import_url_search')}
				</span> 
					${translate('toolbox_import_url_search_after')}
				</div>
            </div>
		</div>
        `;

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
				emitNotification(translate('toolbox_import_max_size_exceeded'), LevelTypes.WARN);
				break;
			case SourceTypeResultStatus.UNSUPPORTED_TYPE:
				emitNotification(translate('toolbox_import_unsupported'), LevelTypes.WARN);
				break;
			case SourceTypeResultStatus.OTHER:
				emitNotification(translate('toolbox_import_unknown'), LevelTypes.ERROR);
		}
	}


	static get tag() {
		return 'ba-tool-import-content';
	}
}
