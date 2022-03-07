
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './bvvMiscContentPanel.css';
import { $injector } from '../../../../../../injection';


/**
* Container for more contents.
* @class
* @author costa_gi
* @author alsturm
*/
export class BvvMiscContentPanel extends AbstractMvuContentPanel {


	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}


	createView() {

		const translate = (key) => this._translationService.translate(key);

		return html`
		<style>${css}</style>
        <div class="ba-list">	
			<div class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_settings')}</span>
				</span>
			</div>		
			<div  class="ba-list-item divider">
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_dark_mode')}</span>
				<span class="ba-list-item__after">
					<ba-theme-toggle></ba-theme-toggle>
				</span>
			</div>
			<div class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_information')}</span>
				</span>
			</div>		
			<a class="ba-list-item" href='https://www.ldbv.bayern.de/hilfe.html' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon help">				
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_help')}</span>
			</a>  
			<a class="ba-list-item"  href='https://www.ldbv.bayern.de/service/kontakt.html' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon contact">
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_Contact')}</span>
			</a>  
			<a class="ba-list-item"  href='https://geoportal.bayern.de/geoportalbayern/seiten/nutzungsbedingungen.html' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon checklist">					
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_terms_of_use')}</span>
			</a>  
			<a class="ba-list-item"  href='https://geoportal.bayern.de/geoportalbayern/seiten/datenschutz.html' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon lock">				
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_privacy_policy')}</span>
			</a>  
			<a class="ba-list-item "  href='https://geoportal.bayern.de/geoportalbayern/seiten/impressum.html' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon imprint">				
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_imprint')}</span>
			</a>  
			<a class="ba-list-item divider"  href='https://github.com/ldbv-by/bav4-nomigration' target='_blank'>
				<span class="ba-list-item__pre">
					<span class="ba-list-item__icon icon git">
					</span>
				</span>
				<span class="ba-list-item__text vertical-center">${translate('menu_misc_content_panel_github')}</span>
			</a>  
			<div class="ba-list-item  ba-list-item__header">
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_more_links')}</span>
				</span>
			</div>	
			<a class="ba-list-item" href='https://geodatenonline.bayern.de/geodatenonline' target='_blank'>
				<span class="ba-list-item__pre ">
					<span class="ba-list-item__image image gdo">
					</span>
				</span>
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_gdo_header')}</span>
					<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_gdo_text')}</span>
				</span>
			</a>             
			<a class="ba-list-item" href='https://www.geoportal.bayern.de/geoportalbayern' target='_blank'>
				<span class="ba-list-item__pre ">
					<span class="ba-list-item__image image geoportal">
					</span>
				</span>
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_gp_header')}</span>
					<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_gp_text')}</span>
				</span>
			</a>             		          
			<a class="ba-list-item" href='https://www.energieatlas.bayern.de/' target='_blank'>
				<span class="ba-list-item__pre ">
					<span class="ba-list-item__image image ea">
					</span>
				</span>
				<span class="ba-list-item__text ">
					<span class="ba-list-item__primary-text">${translate('menu_misc_content_panel_ea_header')}</span>
					<span class="ba-list-item__secondary-text">${translate('menu_misc_content_panel_ea_text')}</span>
				</span>
			</a>             		          
		</div>
    `;
	}

	static get tag() {
		return 'ba-misc-content-panel';
	}
}
