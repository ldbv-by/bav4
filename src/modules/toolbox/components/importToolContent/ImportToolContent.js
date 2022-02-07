import { html } from 'lit-html';
import css from './importToolContent.css';
import { AbstractToolContent } from '../toolContainer/AbstractToolContent';
import { $injector } from '../../../../injection';
import { emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';

/**
 * @class
 * @author alsturm
 */
export class ImportToolContent extends AbstractToolContent {
	constructor() {
		super({
			mode: null
		});

		const { TranslationService: translationService } = $injector.inject('TranslationService');
		this._translationService = translationService;
	}


	createView() {
		const translate = (key) => this._translationService.translate(key);


		const onUpload = () => {
			emitNotification(translate('toolbox_import_data_sucess_notification'), LevelTypes.INFO);
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
							<input id='fileupload' type='file'  @change=${onUpload}></input>
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

	static get tag() {
		return 'ba-tool-import-content';
	}
}
