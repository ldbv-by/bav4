import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './moreContentPanel.css';
import { $injector } from '../../../../../../injection';


/**
* Container for more contents.
* @class
* @author costa_gi
* @author alsturm
*/
export class MoreContentPanel extends AbstractMvuContentPanel {


	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}


	createView() {

		const translate = (key) => this._translationService.translate(key);

		const onToggleFullScreen = () => {
			const doc = window.document;
			const docEl = doc.documentElement;
			const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
			const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

			if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
				requestFullScreen.call(docEl);
			}
			else {
				cancelFullScreen.call(doc);
			}
		};

		return html`
		<style>${css}</style>
        <ul class="ba-list">	
			<li class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">
						${translate('more_content_panel_settings')}						
					</span>
				</span>
			</li>		
			<li  class="ba-list-item">
				<span class="ba-list-item__text vertical-center">   
					${translate('more_content_panel_dark_mode')}		                            
				</span>
				<span class="ba-list-item__after">
					<ba-theme-toggle></ba-theme-toggle>
				</span>
			</li>
			<li  class="ba-list-item">
				<span class="ba-list-item__text vertical-center">            
					${translate('more_content_panel_fullscreen')}	                  
				</span>
				<span class="ba-list-item__after">
					<ba-toggle id='toggleFullScreen' .title=${'Toggle'}   @toggle=${onToggleFullScreen} ></ba-toggle>
				</span>
			</li>
			<li  class="ba-list-item divider">
				<span class="ba-list-item__text vertical-center">            
					${translate('more_content_panel_language')}	                   
				</span>
				<span class="ba-list-item__after">
					<div class='flag gb'>
					</div>
				</span>
			</li>
			<li class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">
						${translate('more_content_panel_information')}	
					</span>
				</span>
			</li>		
			<li class="ba-list-item" >
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon help">				
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">				
					${translate('more_content_panel_help')}		            
				</span>
			</li>  
			<li class="ba-list-item" >
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon contact">
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">				
					${translate('more_content_panel_Contact')}		            	            
				</span>
			</li>  
			<li class="ba-list-item" >
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon git">
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">				
					${translate('more_content_panel_github')}		            	            		            
				</span>
			</li>  
			<li class="ba-list-item" >
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon checklist">					
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">				
					${translate('more_content_panel_terms_of_use')}		            	            		            	            
				</span>
			</li>  
			<li class="ba-list-item divider" >
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon lock">
					
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">				
					${translate('more_content_panel_privacy_policy')}			            
				</span>
			</li>  
			<li class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">
						${translate('more_content_panel_more_links')}
					</span>
				</span>
			</li>	
			<li class="ba-list-item">
				<span class="ba-list-item__pre ">
					<span class="ba-list-item__image image gdo">
					</span>
				</span>
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">			
						${translate('more_content_panel_gdo_header')}					
					</span>
					<span class="ba-list-item__secondary-text">
						${translate('more_content_panel_gdo_text')}
					</span>
				</span>
			</li>             
			<li class="ba-list-item">
				<span class="ba-list-item__pre ">
					<span class="ba-list-item__image image geoportal">
					</span>
				</span>
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">					
						${translate('more_content_panel_gp_header')}											
					</span>
					<span class="ba-list-item__secondary-text">
						${translate('more_content_panel_gp_text')}	
					</span>
				</span>
			</li>             		          
		</ul>
    `;
	}

	static get tag() {
		return 'ba-more-content-panel';
	}
}
