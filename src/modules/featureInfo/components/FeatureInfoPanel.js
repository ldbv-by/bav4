import { html, TemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { $injector } from '../../../injection';
import { clear } from '../../../store/featureInfo/featureInfo.action';
import { AbstractMvuContentPanel } from '../../menu/components/mainMenu/content/AbstractMvuContentPanel';
import css from './featureInfoPanel.css';
import arrowLeftShortIcon from '../assets/arrowLeftShort.svg';
import shareIcon from '../assets/share.svg';
import printerIcon from '../assets/printer.svg';

const Update_FeatureInfo_Data = 'update_featureInfo_data';

/**
 * @class
 * @author taulinger
 */
export class FeatureInfoPanel extends AbstractMvuContentPanel {

	constructor() {
		super({
			featureInfoData: []
		});

		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;

		this.observe(store => store.featureInfo.current, current => this.signal(Update_FeatureInfo_Data, [...current]));
	}

	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_FeatureInfo_Data:
				return { ...model, featureInfoData: [...data] };
		}
	}

	/**
	 *@override
	 */
	createView(model) {

		const { featureInfoData } = model;
		const translate = (key) => this._translationService.translate(key);

		const getContent = content => {
			return content instanceof TemplateResult ? content : html`${unsafeHTML(content)}`;
		};

		return html`
        <style>${css}</style>
		<div>
			<div class="container">
			<ul class="ba-list">	
				<li class="ba-list-item  ba-list-inline ba-list-item__header">			
					<span class="ba-list-item__pre" style='position:relative;left:-1em;'>													
							<ba-icon  .icon='${arrowLeftShortIcon}' .size=${4} .title=${translate('featureInfo_close_button')}  @click=${clear}></ba-icon>	 											
					</span>
					<span class="ba-list-item__text vertical-center">
						<span class="ba-list-item__main-text" style='position:relative;left:-1em;'>	
							Punkt-Info
						</span>					
					</span>
					<span class="ba-icon-button ba-list-item__after vertical-center separator" style='padding-right: 1.5em;'>											
						<ba-icon .icon='${shareIcon}' .size=${1.3} ></ba-icon>												
					</span>
					<span class="ba-icon-button ba-list-item__after vertical-center separator">														
						<ba-icon .icon='${printerIcon}' .size=${1.5} ></ba-icon>												
					</span>
				</li>	
				${featureInfoData.map((item) => html`
					<li class="ba-section">
						<button class="ba-list-item ba-list-item__header">
							<span class="ba-list-item__text  ba-list-item__primary-text">${item.title}</span>
							<span class="ba-list-item__after">
								<i class="icon icon-rotate-90 chevron iconexpand"></i>
							</span>
						</button>					
						<div class="collapse-content divider">	
							${getContent(item.content)}
						</div>	
					</li>
					`)}
					</ul>	
			<div>
		</div>
        `;
	}

	static get tag() {
		return 'ba-feature-info-panel';
	}
}
