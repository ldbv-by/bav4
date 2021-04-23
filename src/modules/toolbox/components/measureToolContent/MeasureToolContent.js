import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { remove, reset } from '../../../map/store/measurement.action';

import css from './measureToolContent.css';
/**
 * @class
 * @author thiloSchlemmer
 */
export class MeasureToolContent extends BaElement {

	constructor() {
		super();

		const { TranslationService: translationService, UnitsService: unitsService } = $injector.inject('TranslationService', 'UnitsService');
		this._translationService = translationService;
		this._unitsService = unitsService;
		this._tool = {
			name: 'measure',
			active: false,
			title: 'toolbox_measureTool_measure',
			icon: 'measure'
		};
		this._isFirstMeasurement = true;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);
		const { active, statistic } = this._state;
		this._isFirstMeasurement = this._isFirstMeasurement ? (statistic.length === 0 ? true : false) : false;
		this._tool.active = active;
		const toolClasses = { 'is-active': this._tool.active };
		const measurementClasses = { 'is-first': this._isFirstMeasurement };
		const removeAllowed = statistic.length > 0;
		const removeClasses = {
			'is-remove': removeAllowed,
			'is-not-remove': !removeAllowed
		};

		const onClickReset = () => {
			reset();
		};

		const onClickRemove = () => {
			remove();
		};

		const formattedDistance = this._unitsService.formatDistance(statistic.length);
		const formattedArea = this._unitsService.formatArea(statistic.area);
		return html`
        <style>${css}</style>
            <div class="container">
                <div class="ba-tool-container__item ba-tool-menu__zeichnen  ${classMap(toolClasses)}">
                <div>
                    <span class="tool-container__header">
                    ${translate('toolbox_measureTool_header')}
                    </span>
                </div>      
                <div class="tool-container__buttons">                              
					<div id=startnew  ?disabled=${this._isFirstMeasurement} class="tool-container__button ${classMap(measurementClasses)}"
						title=${translate(this._tool.title)}
						@click=${onClickReset}>								
						<div class="tool-container__background"></div>		
						<div class="tool-container__icon start-new">
						</div>  
						<div class="tool-container__button-text">${translate('toolbox_measureTool_start_new')}</div>
					</div>					
                </div>
				<div class="tool-container__statistic" >								
					<div class="tool-container__statistic-text">${translate('toolbox_measureTool_stats_length')}: ${formattedDistance}</div>
					<div class="tool-container__statistic-text">${translate('toolbox_measureTool_stats_area')}: ${unsafeHTML(formattedArea)}</div>
				</div>
                <div class="tool-container__buttons-secondary">                         
                    <button id='remove'  ?disabled=${!removeAllowed} class="utility ${classMap(removeClasses)}" @click=${onClickRemove}>
                    ${translate('toolbox_drawTool_delete')}
                    </button>
                    <button class="utility">
                    ${translate('toolbox_drawTool_share')}
                    </button>
                    <button class="utility">
                    ${translate('toolbox_drawTool_save')}
                    </button>                                             
                </div>                
                <div class="tool-container__info"> 
                    <span>
                    ${translate('toolbox_drawTool_info')}
                    </span>
                </div>
            </div>	  
        </div>
        `;

	}

	/**
	 * @override
	 * @param {Object} state 
	 */
	extractState(state) {
		const { measurement } = state;
		return measurement;
	}

	static get tag() {
		return 'ba-tool-measure-content';
	}
}