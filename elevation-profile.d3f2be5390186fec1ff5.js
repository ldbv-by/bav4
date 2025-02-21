(self.webpackChunkbav4=self.webpackChunkbav4||[]).push([[212],{3520:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTI0IDQyLjctOS05IDIuOS0yLjkgNC4xIDQuMTV2LTIxLjlsLTQuMSA0LjE1LTIuOS0yLjkgOS05IDkgOS0yLjkgMi45LTQuMS00LjE1djIxLjlsNC4xLTQuMTUgMi45IDIuOVoiLz48L3N2Zz48IS0tTUlUIExpY2Vuc2UtLT4K"},23973:(t,e,i)=>{"use strict";var r=i(36752),a=i(31970),o=i.n(a),n=i(99990),s=i(48868),l=i(18410);class c{constructor(t,e,i,r=null){this._attribute=t,this._name=e,this._lightColor=i,this._darkColor=null===r?i:r;const{TranslationService:a,StoreService:o}=l.z.inject("TranslationService","StoreService");this._translationService=a,this._storeService=o}get caption(){return(t=>this._translationService.translate(t))("elevationProfile_"+this._attribute)}get name(){return this._name}get color(){const{media:{darkSchema:t}}=this._storeService.getStore().getState();return t?this._darkColor:this._lightColor}}class d extends c{constructor(t,e,i){super("surface",t,e,i)}}var _=i(56729),h=i(42376),u=i(28353);const p="update_schema",v="update_selected_attribute",g="update_profile_data",f="update_media",m=Object.freeze({FLAT:"flat",GENTLY_UNDULATING:"gentlyUndulating",UNDULATING:"undulating",ROLLING:"rolling",MODERATELY_STEEP:"moderatelySteep",STEEP:"steep"}),T=Object.freeze([{type:m.FLAT,min:0,max:2,color:"#1f8a70"},{type:m.GENTLY_UNDULATING,min:2,max:5,color:"#bedb39"},{type:m.UNDULATING,min:5,max:8,color:"#ffd10f"},{type:m.ROLLING,min:8,max:15,color:"#fd7400"},{type:m.MODERATELY_STEEP,min:15,max:30,color:"#d23600"},{type:m.STEEP,min:30,max:1/0,color:"#691b00"}]),L="alt",D={id:L,unit:"m"},b=Object.freeze({labels:[],chartData:[],elevations:[],attrs:[],distUnit:"m",stats:{verticalHeight:0,linearDistance:0}});class O extends n.T{constructor(){super({profile:b,labels:null,data:null,selectedAttribute:L,darkSchema:null,distUnit:null,portrait:!1,minWidth:!1}),this._chart=null,this._chartColorOptions={},this._elevationProfileAttributeTypes=[];const{ConfigService:t,ElevationService:e,TranslationService:i,UnitsService:r}=l.z.inject("ConfigService","ElevationService","TranslationService","UnitsService");this._translationService=i,this._configService=t,this._elevationService=e,this._unitsService=r,this._drawSelectedAreaBorder=!1,this._mouseIsDown=!1,this._firstLeft=0,this._secondLeft=0,this._top=0,this._bottom=0,this._noAnimationValue=!1,this._initSurfaceTypes()}onInitialize(){this.style.width="100%",this.observe((t=>t.media.darkSchema),(t=>this.signal(p,t))),this.observe((t=>t.elevationProfile.id),(t=>this._getElevationProfile(t))),this.observe((t=>t.media),(t=>this.signal(f,t)),!0)}update(t,e,i){switch(t){case g:return{...i,profile:e,labels:e.labels,data:e.chartData,distUnit:e.distUnit};case p:return{...i,darkSchema:e};case v:return{...i,selectedAttribute:e};case f:return{...i,portrait:e.portrait,minWidth:e.minWidth}}}onAfterRender(){this._updateOrCreateChart()}onDisconnect(){this._destroyChart(),(0,_.kf)(O.HIGHLIGHT_FEATURE_ID)}createView(t){const{portrait:e,minWidth:i,profile:{attrs:a}}=t,n=t=>this._translationService.translate(t),s=t.profile?.stats?.sumUp,l=t.profile?.stats?.sumDown,c=t.profile?.stats?.verticalHeight,d=t.profile?.stats?.highestPoint,_=t.profile?.stats?.lowestPoint,u=t.profile?.stats?.linearDistance,p=this._unitsService.formatDistance(u);return r.qy`
			<style>
				${o()}
			</style>
			<div class="profile ${e?"is-portrait":"is-landscape"} ${i?"is-desktop":"is-tablet"}">
				<div class="chart-container">
					<span class="profile__options">
						<select id="attrs" @change=${()=>{this._noAnimation=!0;const t=this.shadowRoot.getElementById("attrs"),e=t.options[t.selectedIndex].value;this.signal(v,e)}}>
							${a.map((e=>r.qy`
									<option value="${e.id}" ?selected=${t.selectedAttribute===e.id}>${n("elevationProfile_"+e.id)}</option>
								`))}
						</select>
					</span>
					<canvas class="elevationprofile" id="route-elevation-chart"></canvas>
				</div>
				<div class="profile__data" id="route-elevation-chart-footer">
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_sumUp")} (m)</div>
						<div class="profile__content">
							<div class="profile__icon up"></div>
							<div class="profile__text" id="route-elevation-chart-footer-sumUp">${this._getLocalizedValue(s)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_sumDown")} (m)</div>
						<div class="profile__content">
							<div class="profile__icon down"></div>
							<div class="profile__text" id="route-elevation-chart-footer-sumDown">${this._getLocalizedValue(l)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_highestPoint")} (m)</div>
						<div class="profile__content">
							<div class="profile__icon highest"></div>
							<div class="profile__text" id="route-elevation-chart-footer-highestPoint">${this._getLocalizedValue(d)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_lowestPoint")} (m)</div>
						<div class="profile__content">
							<div class="profile__icon lowest"></div>
							<div class="profile__text" id="route-elevation-chart-footer-lowestPoint">${this._getLocalizedValue(_)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_verticalHeight")} (m)</div>
						<div class="profile__content">
							<div class="profile__icon height"></div>
							<div class="profile__text" id="route-elevation-chart-footer-verticalHeight">${(0,h.Rt)(c)}</div>
						</div>
					</div>
					<div class="profile__box">
						<div class="profile__header">${n("elevationProfile_linearDistance")} (${p.unit})</div>
						<div class="profile__content">
							<div class="profile__icon distance"></div>
							<div class="profile__text" id="route-elevation-chart-footer-linearDistance">${p.localizedValue}</div>
						</div>
					</div>
				</div>
			</div>
		`}_getLocalizedValue(t){return null==t?"-":`${(0,h.Rt)(t)}`}get _noAnimation(){return this._noAnimationValue}set _noAnimation(t){this._noAnimationValue=t}_enrichAltsArrayWithAttributeData(t,e){const i=t.id;t.values.forEach((t=>{for(let r=t[0];r<=t[1];r++)e.elevations[r][i]=t[2]}))}_enrichProfileData(t){void 0===t.refSystem&&(t.refSystem=(t=>this._translationService.translate(t))("elevationProfile_unknown")),t.distUnit=this._getDistUnit(t);const e=[];t.elevations.forEach((i=>{"km"===t.distUnit?e.push(i.dist/1e3):e.push(i.dist),i.alt=i.z})),t.labels=e,t.chartData=t.elevations.map((t=>t.z)),t.attrs.forEach((e=>{this._enrichAltsArrayWithAttributeData(e,t)})),t.attrs=[{id:"alt"},...t.attrs];const i=this.getModel().selectedAttribute;t.attrs.find((t=>t.id===i))||this.signal(v,L)}_getDistUnit(t){const e=t.elevations[0].dist,i=t.elevations[t.elevations.length-1].dist;return this._unitsService.formatDistance(i-e).unit}_getChartData(t,e,i){return{labels:e,datasets:[{data:i,label:(()=>this._translationService.translate("elevationProfile_elevation_profile"))(),fill:!0,borderWidth:4,backgroundColor:e=>{const i=this.getModel().selectedAttribute;if(!this._chartColorOptions[i].backgroundColor){if(!e.chart.chartArea)return O.BACKGROUND_COLOR;this._chartColorOptions[i].backgroundColor=this._getBackground(e.chart,t,i)}return this._chartColorOptions[i].backgroundColor},borderColor:e=>{const i=this.getModel().selectedAttribute;if(!this._chartColorOptions[i].borderColor){if(!e.chart.chartArea)return O.BORDER_COLOR;this._chartColorOptions[i].borderColor=this._getBorder(e.chart,t,i)}return this._chartColorOptions[i].borderColor},tension:.1,pointRadius:0,spanGaps:!0,maintainAspectRatio:!1}]}}_getBackground(t,e,i){return"surface"===i?this._getTextTypeGradient(t,e,i):O.BACKGROUND_COLOR}_getBorder(t,e,i){switch(i){case"slope":return this._getSlopeGradient(t,e);case"surface":return this._getTextTypeGradient(t,e,i);default:return this._getFixedColorGradient(t,O.BORDER_COLOR)}}_addAttributeType(t){this._elevationProfileAttributeTypes[t._attribute]||(this._elevationProfileAttributeTypes[t._attribute]=[]),this._elevationProfileAttributeTypes[t._attribute].push(t)}_getElevationProfileAttributeType(t,e){return this._elevationProfileAttributeTypes[t].find((t=>t._name===e))}_initSurfaceTypes(){this._addAttributeType(new d("asphalt","#222222","#444444")),this._addAttributeType(new d("gravel","#eeeeee","#dddddd")),this._addAttributeType(new d("missing","#2222ee","#ee2222"))}_getTextTypeGradient(t,e,i){const{ctx:r,chartArea:a}=t,o=r.createLinearGradient(a.left,0,a.right,0),n=e.elevations.at(-1).dist,s=e.elevations[0][i];let l,c=this._getElevationProfileAttributeType(i,s);return o.addColorStop(0,c.color),e.elevations.forEach(((t,r)=>{if(0===r)return;const a=t.dist/n;if(r===e.elevations.length-1)return void o.addColorStop(a,c.color);const s=t[i];l=this._getElevationProfileAttributeType(i,s),c!==l&&(o.addColorStop(a,c.color),c=l,o.addColorStop(a,c.color))})),o}_getSlopeGradient(t,e){const{ctx:i,chartArea:r}=t,a=i.createLinearGradient(r.left,0,r.right,0),o=e.elevations.at(-1).dist;return e?.elevations.forEach((t=>{if((0,u.Et)(t.slope)&&(0,u.Et)(t.dist)){const e=t.dist/o,i=Math.abs(t.slope),r=T.find((t=>t.min<=i&&t.max>i));a.addColorStop(e,r.color)}})),a}_getFixedColorGradient(t,e){const{ctx:i,chartArea:r}=t,a=i.createLinearGradient(r.left,0,r.right,0);return a.addColorStop(0,e),a.addColorStop(1,e),a}async _getElevationProfile(t){if(t){const e=await this._elevationService.fetchProfile(t);e?(this._enrichProfileData(e),this.signal(g,e)):this.signal(g,b)}}_getChartConfig(t,e,i,r){const a=this,o=t=>this._translationService.translate(t),n=e=>{const i=t.labels.indexOf(e.parsed.x);return t.elevations[i]},s=e?Math.max(...e):0;return{type:"line",data:this._getChartData(t,e,i),plugins:[{afterRender(){a.dispatchEvent(new CustomEvent("chartJsAfterRender",{bubbles:!0}))}},{id:"terminateHighlightFeatures",beforeEvent(t,e){e?.event?.native&&["mouseout","pointerup"].includes(e.event.native.type)&&(0,_.kf)(O.HIGHLIGHT_FEATURE_ID)}},{id:"drawVerticalLineAtMousePosition",afterTooltipDraw(t,e){const i=e.tooltip.caretX,{scales:r,ctx:a}=t,o=r.y;a.beginPath(),t.ctx.moveTo(i,o.getPixelForValue(o.max,0)),t.ctx.strokeStyle="#ff0000",t.ctx.lineTo(i,o.getPixelForValue(o.min,0)),t.ctx.stroke()}}],options:{responsive:!0,animation:{duration:this._noAnimation?0:600,delay:this._noAnimation?0:300},maintainAspectRatio:!1,onResize:()=>{const t=this.getModel().selectedAttribute;this._chartColorOptions[t]={}},scales:{x:{type:"linear",title:{display:!0,text:`${o("elevationProfile_distance")} ${r?`(${r})`:""}`,color:O.DEFAULT_TEXT_COLOR},ticks:{includeBounds:!1,maxRotation:0,color:O.DEFAULT_TEXT_COLOR},max:s},y:{type:"linear",beginAtZero:!1,title:{display:!0,text:o("elevationProfile_alt")+" (m)",color:O.DEFAULT_TEXT_COLOR},ticks:{color:O.DEFAULT_TEXT_COLOR}}},events:["pointermove","pointerup","mouseout"],plugins:{title:{align:"end",display:!0,text:t.refSystem,color:O.DEFAULT_TEXT_COLOR},legend:{display:!1},tooltip:{displayColors:!1,mode:"index",intersect:!1,callbacks:{title:t=>{const e=t[0],i=n(e),r=this._unitsService.formatDistance(i.dist);return this.setCoordinates([i.e,i.n]),`${o("elevationProfile_distance")} (${r.unit}): ${r.localizedValue}`},label:e=>{const i=t=>{const e=o("elevationProfile_"+t.id),i=`${o("elevationProfile_"+t.id)} (${t.unit})`,r=t.prefix?` ${t.prefix} `:" ",n=a[t.id];return`${t.unit?i:e}:${r}${"string"!=typeof n?(0,h.Rt)(n):n}`},r=this.getModel().selectedAttribute,a=n(e),s=t.attrs.find((t=>t.id===r));return r===L?i(D):[i(D),i(s)]}}}}}}}setCoordinates(t){setTimeout((()=>{(0,_.kf)(O.HIGHLIGHT_FEATURE_ID),(0,_.lX)({id:O.HIGHLIGHT_FEATURE_ID,type:_.pN.MARKER_TMP,data:{coordinate:[...t]}})}))}_createChart(t,e,i,r){const a=this.shadowRoot.querySelector(".elevationprofile").getContext("2d");this._chart=new s.Ay(a,this._getChartConfig(t,e,i,r)),this._noAnimation=!1}_destroyChart(){this._chart&&(this._chart.clear(),this._chart.destroy(),delete this._chart)}_updateOrCreateChart(){const{profile:t,labels:e,data:i,distUnit:r}=this.getModel();this._destroyChart(),this._createChart(t,e,i,r)}static get IS_DARK(){const{StoreService:t}=l.z.inject("StoreService"),{media:{darkSchema:e}}=t.getStore().getState();return e}static get DEFAULT_TEXT_COLOR_DARK(){return"rgb(240, 243, 244)"}static get DEFAULT_TEXT_COLOR_LIGHT(){return"rgb(92, 106, 112)"}static get DEFAULT_TEXT_COLOR(){return O.IS_DARK?O.DEFAULT_TEXT_COLOR_DARK:O.DEFAULT_TEXT_COLOR_LIGHT}static get BACKGROUND_COLOR_DARK(){return"rgb(38, 74, 89)"}static get BACKGROUND_COLOR_LIGHT(){return"#e3eef4"}static get BACKGROUND_COLOR(){return O.IS_DARK?O.BACKGROUND_COLOR_DARK:O.BACKGROUND_COLOR_LIGHT}static get BORDER_COLOR_DARK(){return"rgb(9, 157, 220)"}static get BORDER_COLOR_LIGHT(){return"#2c5a93"}static get BORDER_COLOR(){return O.IS_DARK?O.BORDER_COLOR_DARK:O.BORDER_COLOR_LIGHT}static get HIGHLIGHT_FEATURE_ID(){return"#elevationProfileHighlightFeatureId"}static get tag(){return"ba-elevation-profile"}}window.customElements.get(O.tag)||window.customElements.define(O.tag,O)},31970:(t,e,i)=>{var r=i(89134);r&&r.__esModule&&(r=r.default),t.exports="string"==typeof r?r:r.toString()},59512:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTI0IDMxLjUgMTEuMyAxOC44bDIuODUtMi44NUwyNCAyNS44bDkuODUtOS44NSAyLjg1IDIuODVaIi8+PC9zdmc+PCEtLU1JVCBMaWNlbnNlLS0+Cg=="},81931:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTE0LjE1IDMxLjQtMi44NS0yLjg1TDI0IDE1LjlsMTIuNyAxMi42LTIuODUgMi44NUwyNCAyMS41WiIvPjwvc3ZnPjwhLS1NSVQgTGljZW5zZS0tPgo="},83996:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiPjwhLS1NSVQgTGljZW5zZS0tPjxwYXRoIGQ9Im0xMTMuMDY3IDUxMiAxOTItMTkyIDYxLjg2NyA2MS44NjctODguNTMzIDg3LjQ2N2g0NjcuMmwtODguNTMzLTg3LjQ2N0w3MTguOTM1IDMyMGwxOTIgMTkyLTE5MiAxOTItNjEuODY3LTYxLjg2NyA4OC41MzMtODcuNDY3aC00NjcuMmw4OC41MzMgODcuNDY3TDMwNS4wNjcgNzA0eiIvPjwvc3ZnPgo="},89134:(t,e,i)=>{var r=i(31601),a=i(76314),o=i(4417),n=i(81931),s=i(59512),l=i(91391),c=i(90956),d=i(3520),_=i(83996),h=a(r),u=o(n),p=o(s),v=o(l),g=o(c),f=o(d),m=o(_);h.push([t.id,`.profile {\n\tdisplay: grid;\n\tgrid-template-columns: minmax(10em, 1fr) 14em;\n\tgrid-column-gap: 1em;\n\toverscroll-behavior-inline: contain;\n\tpadding-inline: 0.6em;\n\tscroll-padding-inline: 0.6em;\n\tpadding-block: calc(0.3em / 2);\n\tscroll-snap-type: inline mandatory;\n\theight: 15em;\n}\n.is-portrait.profile {\n\tgrid-template-columns: 100% 100%;\n\toverflow-x: auto;\n\theight: 16em;\n}\n.chart-container {\n\theight: 14em;\n\twidth: 100%;\n\tscroll-snap-align: start;\n\toverflow: hidden;\n}\n.profile__data {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 1fr);\n\tgrid-template-rows: repeat(3, 1fr);\n\tgrid-column-gap: 0.5em;\n\tscroll-snap-align: start;\n\toverflow: hidden;\n}\n.is-landscape .profile__data {\n\tmargin: 2.3em 0em 1em;\n}\n.profile__options {\n\twidth: 7em;\n\tdisplay: block;\n}\n.profile__box {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n.is-portrai .profile__box {\n\tpadding-left: 1em;\n}\n.profile__header {\n\tfont-size: 0.8rem;\n\tmin-height: 1.7em;\n\ttext-wrap: balance;\n}\n.profile__content {\n\tdisplay: flex;\n}\n.is-landscape .profile__text {\n\tfont-size: 1.1rem;\n\tcolor: var(--text1);\n}\n.is-portrait .profile__text {\n\tfont-size: 1.5rem;\n\tcolor: var(--text1);\n}\n.highest {\n\tmask: url(${u});\n\t-webkit-mask: url(${u});\n}\n.lowest {\n\tmask: url(${p});\n\t-webkit-mask: url(${p});\n}\n.up {\n\tmask: url(${v});\n\t-webkit-mask: url(${g});\n}\n.down {\n\tmask: url(${v});\n\t-webkit-mask: url(${v});\n}\n.height {\n\tmask: url(${f});\n\t-webkit-mask: url(${f});\n}\n.distance {\n\tmask: url(${m});\n\t-webkit-mask: url(${m});\n}\n.is-landscape .profile__icon {\n\tbackground: var(--text4);\n\theight: 1.2em;\n\twidth: 1.2em;\n\tmask-size: cover;\n\t-webkit-mask-size: cover;\n\tmargin-right: 0.2em;\n}\n.is-portrait .profile__icon {\n\tbackground: var(--text4);\n\theight: 1.6em;\n\twidth: 1.6em;\n\tmask-size: cover;\n\t-webkit-mask-size: cover;\n\tmargin-right: 0.2em;\n}\n`,""]),t.exports=h},90956:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTEwLjEgNDAuNy0yLjgtMi44NUwzMS43IDEzLjVoLTE0di00aDIwLjh2MjAuOGgtNFYxNi4yNVoiLz48L3N2Zz48IS0tTUlUIExpY2Vuc2UtLT4K"},91391:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiPjwhLS1NSVQgTGljZW5zZS0tPjxwYXRoIGQ9Im0xNDUuMDY3IDIxNS40NjcgNzEuNDY3LTcwLjQgNTEyIDUxMlYzNzAuMTM0aDEwMC4yNjd2NDU4LjY2N0gzNzAuMTM0VjcyOC41MzRoMjg4eiIvPjwvc3ZnPgo="}}]);