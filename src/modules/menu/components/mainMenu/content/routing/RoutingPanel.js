/**
 * @module modules/menu/components/mainMenu/content/routing/RoutingPanel
 */
import { html } from 'lit-html';
import { AbstractMvuContentPanel } from '../AbstractMvuContentPanel';
import css from './routingPanel.css';
import { $injector } from '../../../../../../injection';
import { setTab } from '../../../../../../store/mainMenu/mainMenu.action';
import { TabIds } from '../../../../../../domain/mainMenu';
import svg from './assets/arrowLeftShort.svg';
import { setCategory, setRoute, setStatus, setWaypoints } from '../../../../../../store/routing/routing.action';
import { RoutingStatusCodes } from '../../../../../../domain/routing';
import { setCurrentTool } from '../../../../../../store/tools/tools.action';
import { Tools } from '../../../../../../domain/tools';

/**
 * Container for routing contents.
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class RoutingPanel extends AbstractMvuContentPanel {
	constructor() {
		super({});
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	createView() {
		const translate = (key) => this._translationService.translate(key);
		//temp close
		const close = () => {
			setTab(TabIds.MAPS);
		};

		return html`
			<style>
				${css}
			</style>
			<div class="container">
				<ul class="ba-list">
					<li class="ba-list-item  ba-list-inline ba-list-item__header featureinfo-header">
						<span class="ba-list-item__pre" style="position:relative;left:-1em;">
							<ba-icon .icon="${svg}" .size=${4} .title=${translate('menu_misc_content_panel_routing_title')} @click=${close}></ba-icon>
						</span>
						<span class="ba-list-item__text vertical-center">
							<span class="ba-list-item__main-text" style="position:relative;left:-1em;"> Routing </span>
						</span>
					</li>
				</ul>
				<div>				
				<ba-routing-feedback></ba-routing-feedback>
				<div class='chips-container>
					<!-- todo:: placing chips 'export' and 'share' here-->
				</div>
				
				<ba-routing-category-bar ></ba-routing-category-bar>
				<ba-routing-waypoints></ba-routing-waypoints>
				<ba-routing-info></ba-routing-info>
				<ba-routing-details></ba-routing-details></div>
				<div class="chips__container">
					<div>
						TODO chips
					</div>
				</div>
				${this._getDemoContent()} 
			</div>
		`;
	}

	/**
	 * for development use only
	 * @returns {import('../../../../../../../node_modules/lit-html/lit-html').TemplateResult}
	 */
	_getDemoContent() {
		const onClickLoadRoutingData1 = () => {
			setCategory('bvv-hike');
			setStatus(RoutingStatusCodes.Start_Destination_Missing);
			setRoute(null);
			setWaypoints([]);
		};

		const onClickLoadRoutingData2 = () => {
			setCategory('bvv-bike');
			setStatus(RoutingStatusCodes.Ok);
			setWaypoints([
				[1328315.0062647895, 6089975.78297438],
				[1310581.6157026286, 6045336.558455837],
				[1310381.715706286, 6045436.855837]
			]);
		};

		return html`<div class="demo">
			<div class="demo_title">Demo</div>
			<div class="demo_buttons">
				<ba-button id="button1" .label=${'Reset routing data'} .type=${'primary'} @click=${onClickLoadRoutingData1}></ba-button>
				<ba-button id="button2" .label=${"Load routing data ('bvv-bike'"} .type=${'primary'} @click=${onClickLoadRoutingData2}></ba-button>
			</div>
		</div>`;
	}

	static get tag() {
		return 'ba-routing-panel';
	}
}
