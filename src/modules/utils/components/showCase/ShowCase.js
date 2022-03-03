import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import { changeZoomAndCenter } from '../../../../store/position/position.action';
import arrowUpSvg from './assets/arrow-up.svg';
import { activate as activateMeasurement, deactivate as deactivateMeasurement } from '../../../../store/measurement/measurement.action';
import { addLayer } from '../../../../store/layers/layers.action';
import { clearFixedNotification, emitFixedNotification, emitNotification, LevelTypes } from '../../../../store/notifications/notifications.action';
import { closeModal } from '../../../../store/modal/modal.action';
import css from './showCase.css';
import { observe } from '../../../../utils/storeUtils';

/**
 * Displays a showcase of common and reusable components or
 * functional behaviors, which are not finally in place
 * @class
 * @author thiloSchlemmer
 */
export class ShowCase extends BaElement {

	constructor() {
		super();

		const { CoordinateService, EnvironmentService, ShareService, UrlService, FileStorageService, ImportVectorDataService }
			= $injector.inject('CoordinateService', 'EnvironmentService', 'ShareService', 'UrlService', 'FileStorageService', 'ImportVectorDataService');
		this._coordinateService = CoordinateService;
		this._environmentService = EnvironmentService;
		this._importVectorDataService = ImportVectorDataService;
		this._urlService = UrlService;
		this._shareService = ShareService;
		this._icons = [];
		this._url = '';
		this._shortUrl = '';
		this._fileStorageService = FileStorageService;
	}

	/**
	 * @override
	 */
	createView() {

		const onClick0 = async () => {

			//create a GeoResource
			const geoResourceFuture = this._importVectorDataService.forUrl('https://www.geodaten.bayern.de/ba-data/Themen/kml/huetten.kml');
			// optional exception handling for this GeoResourceFuture
			geoResourceFuture.onReject(({ id }) => console.warn(`Oops, something got wrong for ${id}`));
			const { id, label } = geoResourceFuture;
			//add a layer that displays the GeoResource in the map
			addLayer(id, { label: label });
		};

		const onClick1 = () => {
			changeZoomAndCenter({
				zoom: 11,
				center: this._coordinateService.fromLonLat([11.081, 49.449])
			});
		};
		const onToggle = (event) => {
			// eslint-disable-next-line no-console
			console.log('toggled ' + event.detail.checked);
		};

		const activateMeasurementTool = () => {
			activateMeasurement();
			closeModal();
		};

		const deactivateMeasurementTool = () => {
			deactivateMeasurement();
			closeModal();
		};

		const onGenerateUrlButtonClick = async () => {
			const url = this._shareService.encodeState();
			const shortUrl = await this._urlService.shorten(url);
			await this._shareService.copyToClipboard(url);
			this._url = url;
			this._shortUrl = shortUrl;
			this.render();
		};

		const onClickEmitInfo = () => {
			emitNotification('This is just a Info (' + new Date() + ')', LevelTypes.INFO);
		};

		const onClickEmitWarn = () => {
			emitNotification('This is a Warning! Prepare yourself! (' + new Date() + ')', LevelTypes.WARN);
		};

		const onClickEmitError = () => {
			emitNotification('This is a Error! Oh no...something went wrong. (' + new Date() + ')', LevelTypes.ERROR);
		};

		let version = 1;
		const onClickEmitFixed = () => {

			const onCloseAfterWait = () => setTimeout(() => clearFixedNotification(), 2000);
			const onDismiss = () => clearFixedNotification();
			const nextVersion = (before, min, max) => {
				return before === min ? before + 1 : (before === max ? min : before + 1);
			};
			const getVersionForDragging = () => {
				const unsubscribe = observe(this._storeService.getStore(), state => state.pointer.beingDragged, () => {
					clearFixedNotification();
					unsubscribe();
				});
				return html`<div>
					<h3>Fixed Notifications autoclose with...</h3>
					<div style="color: white;background-color: var(--warning-color);">observing store... </div>
					<div style="color: white;background-color: var(--error-color);">i.e. dragging map</div>					
				</div>`;
			};
			const getContent = (version) => {
				switch (version) {
					case 1:
						return html`<div>
							<h3>Feature-Info</h3>
							<div style="color: var(--text1);background-color: var(--scondary-color);"><b>ID:</b>Lorem ipsum dolor </div>
							<div style="color: var(--text2);background-color: var(--secondary-bg-color);"><b>Value:</b>Lorem ipsum dolor sit amet, consetetur sadipscing elitr...</div>
							<div style="display:flex"><ba-button .label=${'Wait & close'} @click=${onCloseAfterWait}></ba-button><ba-button .label=${'dismiss!'} @click=${onDismiss}></ba-button></div>
						</div>`;
					case 2:
						return html`<div>
							<h3>Fixed Notifications ...</h3>
							<div style="color: white;background-color: var(--warning-color);">waiting forever... </div>
							<div style="color: white;background-color: var(--error-color);">until a new fixed Notification comes</div>							
						</div>`;
					case 3:
						return getVersionForDragging();

				}
			};
			emitFixedNotification(getContent(version));
			version = nextVersion(version, 1, 3);
		};

		return html`
		<style>
		${css}
		</style>		
		<div>
			<div class='divider'>
				<p>Here we present components in random order that:</p>
				<ul>
					<li>are <i>common and reusable</i> components or <i>functional behaviors</i>, who can be added to or extend other components</li>
					<li><i>feature</i> components, which have already been implemented, but have not yet been given the most suitable place...</li>
				</ul>
			</div>			
			
			<h2> Specific components</h2>

			<div class='section' >
			<h3> Theme-Toggle</h3>		
			<div class='example'>
				<div class='theme-toggle' style="display: flex;justify-content: flex-start;"><ba-theme-toggle></ba-theme-toggle></div>
			</div>	
						
			<h3>Measure Distance</h3>
			<div class='example row'>
				<ba-button id='buttonActivateMeasureDistance' .label=${'Measure Distance'} .type=${'primary'} @click=${activateMeasurementTool}></ba-button>	
				<ba-button id='buttonDeactivateMeasureDistance' .label=${'Deactivate Measure Distance'} .type=${'secondary'} @click=${deactivateMeasurementTool}></ba-button>	
			</div>

			<h3>BaseLayer Switcher</h3>
			<div class='example'>
				<ba-base-layer-switcher></ba-base-layer-switcher>
			</div>

			<h3>Url of State</h3>
			<div class='example row'>
				<ba-button id='copyurlbutton' .label=${'Copy Url'} .type=${'primary'} @click=${onGenerateUrlButtonClick}></ba-button>	
				<input type='text' readonly='readonly' value=${this._url}></input>	
				<input type='text' readonly='readonly' value=${this._shortUrl}></input>	
			</div>

			<h3>Layer Manager</h3>
			<div class='example'>
				<ba-layer-manager></ba-layer-manager>
			</div>

			<h3>Notifications</h3>
			<div class='example row'>									
				<ba-button id='notification0' .label=${'Info Notification'} .type=${'primary'} @click=${onClickEmitInfo}></ba-button>
				<ba-button id='notification1' .label=${'Warn Notification'} .type=${'primary'} @click=${onClickEmitWarn}></ba-button>
				<ba-button id='notification2' .label=${'Error Notification'} .type=${'primary'} @click=${onClickEmitError}></ba-button>
				<ba-button id='notification3' .label=${'Fixed Notification'} .type=${'primary'} @click=${onClickEmitFixed}></ba-button>			
			</div>	

			</div>	

			<h2>Common components or functional behaviors</h2>
			
			<div class='section' >

			<h3>ba-buttons</h3>
			<div class='example row'>		
			<ba-button id='button0' .label=${'primary style'} .type=${'primary'} @click=${onClick0}></ba-button>
			<ba-button id='button1' .label=${'secondary style'} @click=${onClick1}></ba-button>
			<ba-button id='button2' .label=${'disabled'} .type=${'primary'} .disabled=${true} ></ba-button>
			<ba-button id='button3' .label=${'disabled'} .disabled=${true}></ba-button>
			</div>

			<h3>ba-icons</h3>
			<div class='example icons'>		
				<ba-icon .icon='${arrowUpSvg}' .title=${'some'} @click=${onClick0}></ba-icon>
				<ba-icon .icon='${arrowUpSvg}' .disabled=${true} @click=${onClick0}></ba-icon>
				<ba-icon .icon='${arrowUpSvg}' .size=${1} @click=${onClick0}></ba-icon>
				<ba-icon .icon='${arrowUpSvg}' .size=${2.5} @click=${onClick0}></ba-icon>		
			</div>

			<h3>Checkbox</h3>
			<div class='example row'>									
				<ba-checkbox .title=${'checkbox title'} @toggle=${onToggle}><span>checkbox</span></ba-checkbox>
				<ba-checkbox .checked=${true} .title=${'checkbox title'} @toggle=${onToggle}><span>checkbox checked</span></ba-checkbox>
				<ba-checkbox .disabled=${true} .title=${'checkbox title'} @toggle=${onToggle}><span>checkbox disabled</span></ba-checkbox>
				<ba-checkbox .checked=${true} .disabled=${true} .title=${'checkbox title'} @toggle=${onToggle}><span>checkbox checked disabled</span></ba-checkbox>
			</div>
									
			<h3> input</h3>
			<div class='example row'>		
				<input placeholder='input' ></input>		
				<input value='input readonly' readonly></input>
				<div  class="fieldset">						
					<input type="text"  required="required"  id="textarea-foo" ></input>
					<label for="textarea-foo" class="control-label">with label</label><i class="bar"></i>
				</div>
			</div>
							
			<h3> textarea</h3>
				<div class='example row'>										
				<textarea placeholder='textarea'></textarea>		
				<textarea readonly> textarea readonly</textarea>		
				<div  class="fieldset">						
					<textarea  required="required"  id="textarea-foo" ></textarea>
					<label for="textarea-foo" class="control-label">with label</label><i class="bar"></i>
				</div>	
			</div>

			<h3> select</h3>
			<div class='example row'>
				<select name="pets">
					<option>Value 1</option>
					<option>Value 2</option>
				</select>
				<select  disabled >
					
					<option>Value 1</option>
					<option>Value 2</option>
				</select>
				<div class="fieldset">
					<select>
						<option>Value 1</option>
						<option>Value 2</option>
					</select>
					<label for="select" class="control-label">with label</label><i class="bar"></i>
			 	 </div>
			</div>

			<h3> slider</h3>
			<div class='example row'>
				<input type='range'></input>
			</div>




			<h3>Toggle-Button</h3>
			<div class='example row'>		
				<div>Toggle me!</div><ba-toggle id='toggle' .title=${'Toggle'} @toggle=${onToggle}></ba-toggle>
			</div>
			
			<h3>Loading hint</h3>
			<div class='example'>									
			<ba-spinner></ba-spinner>				
			</div>

			</div>	
		</div > `;
	}

	static get tag() {
		return 'ba-showcase';
	}
}
