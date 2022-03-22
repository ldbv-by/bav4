import { html } from 'lit-html';
import { $injector } from '../../../injection';
import css from './firststeps.css';
import { MvuElement } from '../../MvuElement';
import { emitNotification, LevelTypes } from '../../../store/notifications/notifications.action';
import { clearFixedNotification } from '../../../store/notifications/notifications.action';
import { QueryParameters } from '../../../services/domain/queryParameters';
import { openModal } from '../../../store/modal/modal.action';
import { isHttpUrl } from '../../../utils/checks';

export const FIRST_STEPS_NOTIFICATION_DELAY_TIME = 3000;

const Update_IsPortrait_HasMinWidth = 'update_isPortrait_hasMinWidth';
const Update_IsOpen_TabIndex = 'update_isOpen_tabIndex';
const Update_HasBeenVisible = 'update_hasBeenVisible';
const Update_FirstStepsContentSource = 'update_firstStepsContentSource';
/**
 * @class
 * @author alsturm
 * @author thiloSchlemmer
 */
export class FirstSteps extends MvuElement {

	constructor() {
		super({
			isPortrait: false,
			hasMinWidth: false,
			isOpen: false,
			hasBeenVisible: false,
			firstStepsContentSource: null
		});

		const {
			EnvironmentService: environmentService,
			TranslationService: translationService
		}
			= $injector.inject('EnvironmentService', 'TranslationService');

		this._environmentService = environmentService;
		this._translationService = translationService;
	}


	/**
	 * @override
	 */
	update(type, data, model) {
		switch (type) {
			case Update_IsPortrait_HasMinWidth:
				return { ...model, ...data };
			case Update_IsOpen_TabIndex:
				return { ...model, ...data };
			case Update_HasBeenVisible:
				return { ...model, hasBeenVisible: data };
			case Update_FirstStepsContentSource:
				return { ...model, firstStepsContentSource: data };
		}
	}

	/**
	 * @override
	 */
	onInitialize() {
		const { ConfigService: configService } = $injector.inject('ConfigService');

		this.observe(state => state.media, media => this.signal(Update_IsPortrait_HasMinWidth, { isPortrait: media.portrait, hasMinWidth: media.minWidth }));
		this.observe(state => state.mainMenu, mainMenu => this.signal(Update_IsOpen_TabIndex, { isOpen: mainMenu.open, tabIndex: mainMenu.tab }));

		this.signal(Update_HasBeenVisible, this._environmentService.getUrlParams().get(QueryParameters.T_DISABLE_INITIAL_UI_HINTS) === 'true');
		this.signal(Update_FirstStepsContentSource, configService.getValue('FIRST_STEPS_CONTENT_URL', null));
	}

	/**
	 * @override
	 */
	createView(model) {
		const { isPortrait, hasMinWidth, isOpen, hasBeenVisible, firstStepsContentSource } = model;


		const getOrientationClass = () => {
			return isPortrait ? 'is-portrait' : 'is-landscape';
		};

		const getMinWidthClass = () => {
			return hasMinWidth ? 'is-desktop' : 'is-tablet';
		};

		const getOverlayClass = () => {
			return (isOpen && !isPortrait) ? 'is-open' : '';
		};

		const translate = (key) => this._translationService.translate(key);


		const openModalFirstSteps = () => {
			openModal(translate('help_firstSteps_notification_first_steps'), html`<iframe title=${translate('help_firstSteps_notification_first_steps')} src=${firstStepsContentSource} style="border:none;" width='100%' height='600px'></iframe`);
		};

		const openModalShowCase = () => {
			openModal('Showcase', html`<ba-showcase>`);
		};

		const showNotification = () => {
			const getContent = () => {
				const onOpen = () => {
					openModalFirstSteps();
					clearFixedNotification();
				};
				const onClose = () => {
					clearFixedNotification();
				};
				return html`
						<style>${css}</style>	
						<div class='first_steps__notification'>					
							<div class='first_steps__notification-section'>
								<i class='first_steps__notification-icon'></i>
								<div>
									<div class='first_steps__notification-primary-text' >${translate('help_firstSteps_notification_header')}</div>
									<div class='first_steps__notification-secondary-text' >${translate('help_firstSteps_notification_text')}</div>
								</div>
							</div>
							<div class='first_steps__notification-section space-evenly'>							
								<ba-button id='closeButton' .label=${translate('help_firstSteps_notification_close')} @click=${onClose}></ba-button>
								<ba-button id='firstSteps' .label=${translate('help_firstSteps_notification_first_steps')} @click=${onOpen}></ba-button>								
							</div>
						</div>`;
			};
			emitNotification(getContent(), LevelTypes.CUSTOM);
		};

		const contentAvailable = firstStepsContentSource != null && isHttpUrl(firstStepsContentSource);
		if (!hasBeenVisible && contentAvailable) {
			window.setTimeout(() => showNotification(), FIRST_STEPS_NOTIFICATION_DELAY_TIME);
			this.signal(Update_HasBeenVisible, true);
		}

		return html`
			<style>${css}</style>		
			<div class=" ${getOrientationClass()} ${getMinWidthClass()}">  			
				<div class='first_steps__button ${getOverlayClass()}'>				
					<i class='first_steps__button-icon'></i>
					<span class="first_steps__button-text" @click=${contentAvailable ? openModalFirstSteps : openModalShowCase}>${translate('help_firstSteps_button')}</span>					
				</div>		
			</div>		

		` ;

	}

	isRenderingSkipped() {
		return this._environmentService.isEmbedded();
	}

	static get tag() {
		return 'ba-first-steps';
	}
}
