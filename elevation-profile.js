(self.webpackChunkbav4=self.webpackChunkbav4||[]).push([[415],{146:(t,e,i)=>{var r=i(8081),a=i(3645),o=i(1667),n=i(2933),s=i(1077),l=i(5534),c=i(5360),d=i(6077),h=i(9346),_=a(r),u=o(n),p=o(s),g=o(l),v=o(c),f=o(d),m=o(h);_.push([t.id,`.profile.is-portrait {\n\theight: 20em;\n}\n.profile.is-landscape {\n\theight: 15em;\n}\n.is-portrait .chart-container {\n\tposition: relative;\n\theight: 14em;\n\twidth: 100%;\n\tdisplay: inline-block;\n}\n.is-landscape .chart-container {\n\tposition: relative;\n\theight: 14em;\n\twidth: 89%;\n\tdisplay: inline-block;\n}\n.is-portrait .profile__data {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: space-between;\n\twidth: 100%;\n\tposition: relative;\n}\n.is-landscape .profile__data {\n\talign-items: center;\n\tjustify-content: space-between;\n\tdisplay: inline-block;\n\twidth: 11%;\n\tposition: relative;\n\tfloat: right;\n}\n.profile__options {\n\twidth: 7em;\n\tdisplay: block;\n}\n.profile__box:first-child {\n\tborder-left: 0;\n}\n.is-portrait .profile__box {\n\theight: 4em;\n\tdisplay: flex;\n\tflex-direction: column;\n\tborder-left: 1px dotted var(--header-background-color);\n\twidth: 100%;\n}\n.is-landscape .profile__box {\n\theight: 4em;\n\tdisplay: flex;\n\tflex-direction: column;\n\tborder-left: 1px dotted var(--header-background-color);\n\twidth: 50%;\n\tfloat: left;\n}\n.profile__text {\n\tfont-weight: bold;\n\ttext-align: center;\n\tmargin: 0;\n\tfont-size: 0.9rem;\n\tcolor: var(--text1);\n}\n.is-tablet .profile__text {\n\tfont-size: 0.8rem;\n}\n.is-portrait.is-tablet .profile__text {\n\tfont-size: 1rem;\n}\n.highest {\n\tmask: url(${u});\n\t-webkit-mask: url(${u});\n}\n.lowest {\n\tmask: url(${p});\n\t-webkit-mask: url(${p});\n}\n.up {\n\tmask: url(${g});\n\t-webkit-mask: url(${v});\n}\n.down {\n\tmask: url(${g});\n\t-webkit-mask: url(${g});\n}\n.height {\n\tmask: url(${f});\n\t-webkit-mask: url(${f});\n}\n.distance {\n\tmask: url(${m});\n\t-webkit-mask: url(${m});\n}\n.profile__icon {\n\theight: 2em;\n\tmin-width: 2em;\n\tbackground: var(--primary-color);\n\tdisplay: block;\n\tmargin: auto;\n\tmask-size: cover;\n\t-webkit-mask-size: cover;\n}\n.is-tablet .profile__icon {\n\theight: 1.5em;\n\tmin-width: 1.5em;\n}\n.is-portrait.is-tablet .profile__icon {\n\theight: 2em;\n\tmin-width: 2em;\n}\n`,""]),t.exports=_},8326:(t,e,i)=>{var r=i(146);r&&r.__esModule&&(r=r.default),t.exports="string"==typeof r?r:r.toString()},6687:(t,e,i)=>{"use strict";i.r(e);var r=i(3692),a=i(8326),o=i.n(a),n=i(4304),s=i(5261),l=i(540);class c{constructor(t,e,i,r=null){this._attribute=t,this._name=e,this._lightColor=i,this._darkColor=null===r?i:r;const{TranslationService:a,StoreService:o}=l.U.inject("TranslationService","StoreService");this._translationService=a,this._storeService=o}get caption(){return(t=>this._translationService.translate(t))("elevationProfile_"+this._attribute)}get name(){return this._name}get color(){const{media:{darkSchema:t}}=this._storeService.getStore().getState();return t?this._darkColor:this._lightColor}}class d extends c{constructor(t,e,i){super("surface",t,e,i)}}var h=i(9563),_=i(5797),u=i(804),p=i(1921);const g="update_schema",v="update_selected_attribute",f="update_profile_data",m="update_media",b=Object.freeze({FLAT:"flat",GENTLY_UNDULATING:"gentlyUndulating",UNDULATING:"undulating",ROLLING:"rolling",MODERATELY_STEEP:"moderatelySteep",STEEP:"steep"}),T=Object.freeze([{type:b.FLAT,min:0,max:2,color:"#1f8a70"},{type:b.GENTLY_UNDULATING,min:2,max:5,color:"#bedb39"},{type:b.UNDULATING,min:5,max:8,color:"#ffd10f"},{type:b.ROLLING,min:8,max:15,color:"#fd7400"},{type:b.MODERATELY_STEEP,min:15,max:30,color:"#d23600"},{type:b.STEEP,min:30,max:1/0,color:"#691b00"}]),D="alt",L=Object.freeze({labels:[],chartData:[],elevations:[],attrs:[],distUnit:"m",stats:{verticalHeight:0,linearDistance:0}});class x extends n.T{constructor(){super({profile:L,labels:null,data:null,selectedAttribute:D,darkSchema:null,distUnit:null,portrait:!1,minWidth:!1}),this._chart=null,this._elevationProfileAttributeTypes=[];const{ConfigService:t,ElevationService:e,TranslationService:i,UnitsService:r}=l.U.inject("ConfigService","ElevationService","TranslationService","UnitsService");this._translationService=i,this._configService=t,this._elevationService=e,this._unitsService=r,this._drawSelectedAreaBorder=!1,this._mouseIsDown=!1,this._firstLeft=0,this._secondLeft=0,this._top=0,this._bottom=0,this._noAnimationValue=!1,this._unsubscribers=[],this._initSurfaceTypes()}onInitialize(){this.style.width="100%",this._unsubscribers=[this.observe((t=>t.media.darkSchema),(t=>this.signal(g,t))),this.observe((t=>t.elevationProfile.coordinates),(t=>this._getElevationProfile(t))),this.observe((t=>t.media),(t=>this.signal(m,t)),!0)]}update(t,e,i){switch(t){case f:return{...i,profile:e,labels:e.labels,data:e.chartData,distUnit:e.distUnit};case g:return{...i,darkSchema:e};case v:return{...i,selectedAttribute:e};case m:return{...i,portrait:e.portrait,minWidth:e.minWidth}}}onAfterRender(){this._updateOrCreateChart()}onDisconnect(){for(this._destroyChart(),(0,h.g)(x.HIGHLIGHT_FEATURE_ID);this._unsubscribers.length>0;)this._unsubscribers.shift()()}createView(t){const{portrait:e,minWidth:i,profile:{attrs:a}}=t,n=t=>this._translationService.translate(t),s=t.profile?.stats?.sumUp,l=t.profile?.stats?.sumDown,c=t.profile?.stats?.verticalHeight,d=t.profile?.stats?.highestPoint,h=t.profile?.stats?.lowestPoint,_=t.profile?.stats?.linearDistance;return r.dy`
			<style>
				${o()}
			</style>
			<div class="profile ${e?"is-portrait":"is-landscape"} ${i?"is-desktop":"is-tablet"}">
				<span class="profile__options">
					<select id="attrs" @change=${()=>{this._noAnimation=!0;const t=this.shadowRoot.getElementById("attrs"),e=t.options[t.selectedIndex].value;this.signal(v,e)}}>
						${a.map((e=>r.dy`
								<option value="${e.id}" ?selected=${t.selectedAttribute===e.id}>${n("elevationProfile_"+e.id)}</option>
							`))}
					</select>
				</span>
				<div class="chart-container" style="">
					<canvas class="elevationprofile" id="route-elevation-chart"></canvas>
				</div>
				<div class="profile__data" id="route-elevation-chart-footer">
					<div class="profile__box" title="${n("elevationProfile_sumUp")}">
						<div class="profile__icon up"></div>
						<div class="profile__text" id="route-elevation-chart-footer-sumUp">${this._getFooterText(s)}</div>
					</div>
					<div class="profile__box" title="${n("elevationProfile_sumDown")}">
						<div class="profile__icon down"></div>
						<div class="profile__text" id="route-elevation-chart-footer-sumDown">${this._getFooterText(l)}</div>
					</div>
					<div class="profile__box" title="${n("elevationProfile_highestPoint")}">
						<div class="profile__icon highest"></div>
						<div class="profile__text" id="route-elevation-chart-footer-highestPoint">${this._getFooterText(d)}</div>
					</div>
					<div class="profile__box" title="${n("elevationProfile_lowestPoint")}">
						<div class="profile__icon lowest"></div>
						<div class="profile__text" id="route-elevation-chart-footer-lowestPoint">${this._getFooterText(h)}</div>
					</div>
					<div class="profile__box" title="${n("elevationProfile_verticalHeight")}">
						<div class="profile__icon height"></div>
						<div class="profile__text" id="route-elevation-chart-footer-verticalHeight">${(0,u.HA)(c)} m</div>
					</div>
					<div class="profile__box" title="${n("elevationProfile_linearDistance")}">
						<div class="profile__icon distance"></div>
						<div class="profile__text" id="route-elevation-chart-footer-linearDistance">${this._unitsService.formatDistance(_)}</div>
					</div>
				</div>
			</div>
		`}_getFooterText(t){return null==t?"-":`${(0,u.HA)(t)} m`}get _noAnimation(){return this._noAnimationValue}set _noAnimation(t){this._noAnimationValue=t}_enrichAltsArrayWithAttributeData(t,e){const i=t.id;t.values.forEach((t=>{for(let r=t[0];r<=t[1];r++)e.elevations[r][i]=t[2]}))}_enrichProfileData(t){void 0===t.refSystem&&(t.refSystem=(t=>this._translationService.translate(t))("elevationProfile_unknown")),t.distUnit=this._getDistUnit(t);const e=[];t.elevations.forEach((i=>{"km"===t.distUnit?e.push(i.dist/1e3):e.push(i.dist),i.alt=i.z})),t.labels=e,t.chartData=t.elevations.map((t=>t.z)),t.attrs.forEach((e=>{this._enrichAltsArrayWithAttributeData(e,t)})),t.attrs=[{id:"alt"},...t.attrs];const i=this.getModel().selectedAttribute;t.attrs.find((t=>t.id===i))||this.signal(v,D)}_getDistUnit(t){const e=t.elevations[0].dist,i=t.elevations[t.elevations.length-1].dist;return this._unitsService.formatDistance(i-e).includes("km")?"km":"m"}_getChartData(t,e,i){const r=[];return{labels:e,datasets:[{data:i,label:(t=>this._translationService.translate("elevationProfile_elevation_profile"))(),fill:!0,borderWidth:4,backgroundColor:e=>{const i=this.getModel().selectedAttribute;if(r[i]||(r[i]={}),!r[i].backgroundColor){if(!e.chart.chartArea)return x.BACKGROUND_COLOR;r[i].backgroundColor=this._getBackground(e.chart,t,i)}return r[i].backgroundColor},borderColor:e=>{const i=this.getModel().selectedAttribute;if(r[i]||(r[i]={}),!r[i].borderColor){if(!e.chart.chartArea)return x.BORDER_COLOR;r[i].borderColor=this._getBorder(e.chart,t,i)}return r[i].borderColor},tension:.1,pointRadius:0,spanGaps:!0,maintainAspectRatio:!1}]}}_getBackground(t,e,i){return"surface"===i?this._getTextTypeGradient(t,e,i):x.BACKGROUND_COLOR}_getBorder(t,e,i){switch(i){case"slope":return this._getSlopeGradient(t,e);case"surface":return this._getTextTypeGradient(t,e,i);default:return this._getFixedColorGradient(t,x.BORDER_COLOR)}}_addAttributeType(t){this._elevationProfileAttributeTypes[t._attribute]||(this._elevationProfileAttributeTypes[t._attribute]=[]),this._elevationProfileAttributeTypes[t._attribute].push(t)}_getElevationProfileAttributeType(t,e){return this._elevationProfileAttributeTypes[t].find((t=>t._name===e))}_initSurfaceTypes(){this._addAttributeType(new d("asphalt","#222222","#444444")),this._addAttributeType(new d("gravel","#eeeeee","#dddddd")),this._addAttributeType(new d("missing","#2222ee","#ee2222"))}_getTextTypeGradient(t,e,i){const{ctx:r,chartArea:a}=t,o=r.createLinearGradient(a.left,0,a.right,0),n=e.elevations.length,s=a.width/n,l=e.elevations[0][i];let c,d=this._getElevationProfileAttributeType(i,l);return o.addColorStop(0,d.color),e.elevations.forEach(((t,r)=>{if(0===r)return;if(r===e.elevations.length-1){const t=s/a.width*r;return void o.addColorStop(t,d.color)}const n=t[i];if(c=this._getElevationProfileAttributeType(i,n),d===c)return;const l=s/a.width*r;o.addColorStop(l,d.color),d=c,o.addColorStop(l,d.color)})),o}_getSlopeGradient(t,e){const{ctx:i,chartArea:r}=t,a=i.createLinearGradient(r.left,0,r.right,0),o=e.elevations.length,n=r.width/o;return e?.elevations.forEach(((t,e)=>{if((0,p.hj)(t.slope)){const i=n/r.width*e,o=Math.abs(t.slope),s=T.find((t=>t.min<=o&&t.max>o));a.addColorStop(i,s.color)}})),a}_getFixedColorGradient(t,e){const{ctx:i,chartArea:r}=t,a=i.createLinearGradient(r.left,0,r.right,0);return a.addColorStop(0,e),a.addColorStop(1,e),a}async _getElevationProfile(t){const e=t=>this._translationService.translate(t);if(Array.isArray(t)&&t.length>=2)try{const e=await this._elevationService.getProfile(t);e?(this._enrichProfileData(e),this.signal(f,e)):this.signal(f,L)}catch(t){console.error(t),(0,_.z)(e("elevationProfile_could_not_load"),_.T.ERROR),this.signal(f,L)}else this.signal(f,L)}_getChartConfig(t,e,i,r){const a=this,o=t=>this._translationService.translate(t),n=e=>{const i=t.labels.indexOf(e.parsed.x);return t.elevations[i]},s=t=>"string"==typeof t?parseFloat(t.replace(",",".")):t;return{type:"line",data:this._getChartData(t,e,i),plugins:[{afterRender(){a.dispatchEvent(new CustomEvent("chartJsAfterRender",{bubbles:!0}))}},{id:"terminateHighlightFeatures",beforeEvent(t,e){e?.event?.native&&["mouseout","pointerup"].includes(e.event.native.type)&&(0,h.g)(x.HIGHLIGHT_FEATURE_ID)}},{id:"shortenLeftEndOfScale",beforeInit:t=>{t.options.scales.x.min=Math.min(...t.data.labels),t.options.scales.x.max=Math.max(...t.data.labels)}},{id:"drawVerticalLineAtMousePosition",afterTooltipDraw(t,e){const i=e.tooltip.caretX,{scales:r,ctx:a}=t,o=r.y;a.beginPath(),t.ctx.moveTo(i,o.getPixelForValue(o.max,0)),t.ctx.strokeStyle="#ff0000",t.ctx.lineTo(i,o.getPixelForValue(o.min,0)),t.ctx.stroke()}}],options:{responsive:!0,animation:{duration:this._noAnimation?0:600,delay:this._noAnimation?0:300},maintainAspectRatio:!1,scales:{x:{type:"linear",title:{display:!0,text:`${o("elevationProfile_distance")} ${r?`[${r}]`:""}`,color:x.DEFAULT_TEXT_COLOR},ticks:{color:x.DEFAULT_TEXT_COLOR}},y:{type:"linear",beginAtZero:!1,title:{display:!0,text:o("elevationProfile_alt")+" [m]",color:x.DEFAULT_TEXT_COLOR},ticks:{color:x.DEFAULT_TEXT_COLOR}}},events:["pointermove","pointerup","mouseout"],plugins:{title:{align:"end",display:!0,text:t.refSystem,color:x.DEFAULT_TEXT_COLOR},legend:{display:!1},tooltip:{displayColors:!1,mode:"index",intersect:!1,callbacks:{title:t=>{const e=t[0],i=n(e);this.setCoordinates([i.e,i.n]);const a="km"===r?1e3*s(e.label):s(e.label),l=this._unitsService.formatDistance(a);return o("elevationProfile_distance")+": "+l},label:e=>{const i=[],r=this.getModel().selectedAttribute,a=n(e);let s=a[r],l=o("elevationProfile_"+r)+": ";const c=t.attrs.find((t=>t.id===r));if("string"!=typeof s&&(s=(0,u.HA)(s)),c.prefix?l+=c.prefix+" "+s:l+=s,r===D)return l+=" m",l;{const t=o("elevationProfile_"+D)+": "+a[D]+" m";i.push(t)}return c.unit&&(l+=" "+c.unit),i.push(l),i}}}}}}}setCoordinates(t){(0,h.g)(x.HIGHLIGHT_FEATURE_ID),(0,h.Lq)({id:x.HIGHLIGHT_FEATURE_ID,type:h.c1.TEMPORARY,data:{coordinate:[...t]}})}_createChart(t,e,i,r){const a=this.shadowRoot.querySelector(".elevationprofile").getContext("2d");this._chart=new s.ZP(a,this._getChartConfig(t,e,i,r)),this._noAnimation=!1}_destroyChart(){this._chart&&(this._chart.clear(),this._chart.destroy(),delete this._chart)}_updateOrCreateChart(){const{profile:t,labels:e,data:i,distUnit:r}=this.getModel();this._destroyChart(),this._createChart(t,e,i,r)}static get IS_DARK(){const{StoreService:t}=l.U.inject("StoreService"),{media:{darkSchema:e}}=t.getStore().getState();return e}static get DEFAULT_TEXT_COLOR_DARK(){return"rgb(240, 243, 244)"}static get DEFAULT_TEXT_COLOR_LIGHT(){return"rgb(92, 106, 112)"}static get DEFAULT_TEXT_COLOR(){return x.IS_DARK?x.DEFAULT_TEXT_COLOR_DARK:x.DEFAULT_TEXT_COLOR_LIGHT}static get BACKGROUND_COLOR_DARK(){return"rgb(38, 74, 89)"}static get BACKGROUND_COLOR_LIGHT(){return"#e3eef4"}static get BACKGROUND_COLOR(){return x.IS_DARK?x.BACKGROUND_COLOR_DARK:x.BACKGROUND_COLOR_LIGHT}static get BORDER_COLOR_DARK(){return"rgb(9, 157, 220)"}static get BORDER_COLOR_LIGHT(){return"#2c5a93"}static get BORDER_COLOR(){return x.IS_DARK?x.BORDER_COLOR_DARK:x.BORDER_COLOR_LIGHT}static get HIGHLIGHT_FEATURE_ID(){return"#elevationProfileHighlightFeatureId"}static get tag(){return"ba-elevation-profile"}}window.customElements.get(x.tag)||window.customElements.define(x.tag,x)},5534:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiPjwhLS1NSVQgTGljZW5zZS0tPjxwYXRoIGQ9Im0xNDUuMDY3IDIxNS40NjcgNzEuNDY3LTcwLjQgNTEyIDUxMlYzNzAuMTM0aDEwMC4yNjd2NDU4LjY2N0gzNzAuMTM0VjcyOC41MzRoMjg4eiIvPjwvc3ZnPgo="},6077:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTI0IDQyLjctOS05IDIuOS0yLjkgNC4xIDQuMTV2LTIxLjlsLTQuMSA0LjE1LTIuOS0yLjkgOS05IDkgOS0yLjkgMi45LTQuMS00LjE1djIxLjlsNC4xLTQuMTUgMi45IDIuOVoiLz48L3N2Zz48IS0tTUlUIExpY2Vuc2UtLT4K"},9346:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiPjwhLS1NSVQgTGljZW5zZS0tPjxwYXRoIGQ9Im0xMTMuMDY3IDUxMiAxOTItMTkyIDYxLjg2NyA2MS44NjctODguNTMzIDg3LjQ2N2g0NjcuMmwtODguNTMzLTg3LjQ2N0w3MTguOTM1IDMyMGwxOTIgMTkyLTE5MiAxOTItNjEuODY3LTYxLjg2NyA4OC41MzMtODcuNDY3aC00NjcuMmw4OC41MzMgODcuNDY3TDMwNS4wNjcgNzA0eiIvPjwvc3ZnPgo="},5360:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTEwLjEgNDAuNy0yLjgtMi44NUwzMS43IDEzLjVoLTE0di00aDIwLjh2MjAuOGgtNFYxNi4yNVoiLz48L3N2Zz48IS0tTUlUIExpY2Vuc2UtLT4K"},1077:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTI0IDMxLjUgMTEuMyAxOC44bDIuODUtMi44NUwyNCAyNS44bDkuODUtOS44NSAyLjg1IDIuODVaIi8+PC9zdmc+PCEtLU1JVCBMaWNlbnNlLS0+Cg=="},2933:t=>{"use strict";t.exports="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0ibTE0LjE1IDMxLjQtMi44NS0yLjg1TDI0IDE1LjlsMTIuNyAxMi42LTIuODUgMi44NUwyNCAyMS41WiIvPjwvc3ZnPjwhLS1NSVQgTGljZW5zZS0tPgo="}}]);