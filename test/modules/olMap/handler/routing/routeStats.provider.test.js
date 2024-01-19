import Polyline from 'ol/format/Polyline';
import { $injector } from '../../../../../src/injection';
import { RouteWarningCriticality } from '../../../../../src/domain/routing';
import { bvvRouteStatsProvider } from '../../../../../src/modules/olMap/handler/routing/routeStats.provider';

const defaultPolylineString =
	'q`jcHmoygAk@|FCh@HtJ\\jHj@`BrCbHJEtArINn@\\t@rAbB~@bBfA|BJh@HnBEj@FNFRNjALz@h@`C^xAHn@FjAD|BDbARbAd@vAJUz@y@HGv@BTChFkA`AGrGq@FLJJjAZ`@MxIt@rEV^e@~@DfBRbBNzEj@r@DnBFxA^bBZX@EhACTjEv@LPF^Af@MfEEb@@FBn@ShDDz@Jj@HVf@~@LPj@d@h@`@pAr@l@XV@FC^lGJv@DJb@JpF\\`@DPH\\R`A~Aj@l@zGlDj@b@rAtAx@lAp@vAl@~AVz@xAdGRl@r@zAf@t@x@~@`Ax@~BpAJNZl@Nj@Ll@Dh@@d@El@Ip@\\HBp@DLFJb@XN^VdAVlB^xDl@fF\\nBf@pBDj@Br@GjAIj@VTd@TfAH~AOPvGLbBFVANBfBN`@Fp@Al@S|BEbB@tAAv@QjCeAzGk@xCMhAG`AMnEf@q@RObBY~@[VOf@c@b@i@h@_A`@qAToAJ{@HwBDSJSHILEL@PHHXH~@Rz@`@l@PJn@VXZLh@Fl@F`@Th@^h@PNh@^^Hh@Af@QNKZ]\\y@d@mBJYJWd@g@TOTG|@I~@?lBZpAC\\Eh@MzDiBjEeC~@q@xBiBrBqBlGiHfBeB|@q@bB_AvAi@j@KvAGr@?r@FfB`@hHhCdDbAtDr@lBh@n@Xp@`@xBxAv@Tn@J|@AlC_@z@G|FKrAKvBYlB]~FyATI`Bk@z@e@d@Ob@KpAM|@EdBWvBV^AzBWn@Zj@d@d@b@T^J^FXBn@Dj@L`@ZHl@AhBOdAJxDhAh@Vb@Nd@Dp@AxAWr@OZ@PFNb@Zh@dApAJDx@NjAb@|Ad@n@VFH@FP@j@NtBhAlCjBdA|@~AhBhCfE`@^v@b@V\\FRHd@ZfC`@D`CEz@JbDv@v@V`Bl@tCjA?PFl@Jd@^|@Tp@r@dE`@~AT`BPx@b@x@\\n@tBxBJV@XCRGJuAb@s@^U\\G\\@~@ATILYRMRCN@Nj@tAZ`A\\r@X^n@xAhCvDhAnAn@`A`@f@tAhAPVX`AVpA`@pAf@pAh@nAp@x@bDjDdAvA|@xAdApBNNpAd@zCbDt@~@vArBPd@Rp@Rf@^`@VNl@Ph@?RDtA`@VJxAx@b@`@bB|BfA~Bb@`Bd@tCfAdINtABb@@jCB`@BTZj@LJ|@d@l@h@d@p@^X`@JL@rA]^BVP^v@VZXLr@RlA~@hAnAhBdBlBbDx@jAVPRDP?HE^_@pAaAHMj@gBTW|A]lDeAz@OhApBbAnAhBjBdAnAp@hATd@Vv@pBfIt@fBx@pAh@l@lAv@vAn@rAr@`@Zp@v@hAdC`@nAp@tCb@zBbA`EdAdDt@nBn@xA`AhBbAbB|@rAn@v@vAvA`CjBPVPc@HKNINCT@JBTTNVb@RlAVNLDPAXvAXEl@@T`@~Az@|BbAjB^b@jAfBh@`AdA|Bp@pAn@t@jBzAnAn@Bf@D^^pAL\\v@bAF^A\\Eb@INX`ARB~An@XP`Ax@VJ`BHj@PvAl@HHFVtA@j@JvB|@lAXh@ZVRNNp@jAp@|@\\VLTVZTTf@^bAj@d@\\bAr@h@\\d@XxAv@HDEv@Cp@C\\GnAANA\\APAT?XALAJg@dCCZZLtAn@jBf@n@b@Xb@HPL^J`@VlFD\\~AjHf@pAf@hAZ`@f@t@p@p@t@n@NTRVf@|@`@v@d@r@bCrC~@pAbAnB|@`C^x@X^PPxAjAj@h@d@x@t@hAj@l@ZLTBn@?pC`@D@l@Pr@d@p@x@d@|@f@nAT~@NdAT|CPnEBjA@NFvACvCBf@`@vF@R?^?f@?f@FbKARAxMBlCTfBJfC|BhPRhC@r@^d@`CpCTn@DNFXJt@R`B~@`F\\jA\\v@`@l@j@f@dAn@`@f@NX\\TbBj@XV|@nBZd@z@p@^d@lB|CjBhC~@z@hA|@|A|@t@r@VP\\Pp@Hj@CpDo@j@Ad@H|Bt@VDV@F?TIj@Qr@MzDSp@F\\RrAbAT^HRR|@x@lFV~@R\\VJP@~BGh@@d@Fj@DX@dAXlBP`@HPn@Hx@Dl@VxEB\\Jl@N\\TVHfADl@`@jCXlCLn@Vx@DNz@`CHd@h@lBX`A|@tB^dA|AxHLz@^tALvA@dAK~ADNp@BFFDR?b@M`AQ~CB`AL`A|@zENlAV~CHlBFhD@zCEnBa@lC_@vBg@vRy@`N_@lFOfDKlC?jANbAXOVE~AMzEuAZA~Bf@~@?^LPLtAxAZVTHRCNKhA_B`@a@r@g@VGzB@`EUr@@p@BdALhAVt@b@bDxBj@d@z@`Ah@x@Jh@NpBFtGE|DfAtDz@p@V^Rh@ZpAHJfAj@j@b@dA@^HzAh@tCTXDl@Tf@`@l@v@dAdAb@T~Aj@nB|@|@l@v@|@PLdCv@zBj@bAl@N\\Z^nA|@fAjAf@lAf@l@h@NxDTh@Vd@FtBCb@DVRfApBx@`AZl@HVlAw@NJT?TKpA}A~@s@n@Wx@SVCjB@jAKt@Ub@Sd@]l@o@^i@Zo@|@wBd@y@t@}@zAsAxDsFVUb@OZCfB?`@Kr@_@p@k@~AmBXYl@]rAi@d@]`AqABIDYCm@~@yAjA}AlD{Dj@s@|@uAf@i@dDkCTKz@M@ODSZk@LIhEoAhHqD`Ao@bA{@f@WnBu@\\YbAqAL_@B_@dAQP?z@^L@NG|@w@~BLxAz@PFh@JRy@Xk@`@c@f@[l@S|Co@\\Of@]ZYz@aAjA}@~@i@lAc@v@U`BStBMtB_@`@Mx@a@^_@r@wAtBqFb@aAbAkBFWD]RqEJmAtAsG`@aC`AeDRiAd@cDH[To@\\k@rDiE`AwANUpC_GR[p@}@|@}@TOnAk@z@Qz@?f@Fh@T^X`AdAvAfBfDjG^\\t@^hADdBIhGg@xBInBZj@b@PTPe@lCz@V\\p@l@hAx@|An@d@Jh@F~EEhAIzAW~D@PQJ\\FNp@PZNJDj@f@D@nAf@x@h@BBFJ@@HVTlALTRVhAz@d@XX@ZK`@a@V`@Rj@HT@DJ~@AbAZKhD]~CTB?P?TCHC\\YRUDGRUZ[r@s@d@a@DCxBm@ZDn@Pj@@rAOJEHC^Y^Ul@GXERKVQF?|COvBq@jANh@B^@FBLHHJDHp@r@fAbBlB`CJL`@Zl@TXFHBj@Nr@Zl@^rApAZd@t@vAx@rAt@lAZb@^Zv@b@NN~@dBPRd@VpAd@d@`@`@l@v@tAv@t@n@^jBl@f@Vr@p@LX^xA^|@h@x@Rb@d@tANZ`@f@vAp@~B|@zCjCVNPFnADRLV\\x@dCR\\|BvC`@fA\\jARpAJZNVlAdB~AhAtCdAVDb@?v@KVANBTuD?CHa@Vc@JKNEHAH?~@@XDx@RpBt@x@b@rB~ApBlA`@ZjA`BZbA`@jBf@lBp@nB`AjAx@x@t@\\dCV|DbAlAPl@F`B[dAI~CRr@V`AvB\\VbEzAb@JrANdBLxA@T~@ZbCRGdDK~C_@bFa@hD_@LEf@e@b@m@d@g@tAyAjAw@h@Kn@GjK]xAA`CZlEnAn@X~@XTEz@q@RGd@Fd@NnBpAj@d@XLx@VVRTXXR^B\\IRS^g@PMTE|@@^Eb@Ql@[T[zBmEXg@`@e@j@g@dAmApAqAb@_@tA}BLi@f@qFV{Ad@kBDUNq@@KP{BA]G]Wm@EQKqASg@GGUCG?m@O]CYHGA[MKUIc@E}@@uECc@?GAGASEYCMAGMs@e@}AWo@a@y@Gi@@_@DUZgBHuCDq@@g@Au@MgASeAc@oDKcBAeAFuANmAl@oDr@aBf@aBl@cCN}@Dw@?}CF{@Hs@T_Aj@sAf@i@z@u@ZkADS_AaA~@`AER[jAIOQCkAhAQRk@tA';
// ghRoute object reduced the used properties
const ghRoute = {
	vehicle: 'bvv-bike',
	paths: [
		{
			distance: 42000,
			time: 4200000,
			points_encoded: true,
			points: defaultPolylineString,
			details: {
				surface: [
					[0, 6, 'other'],
					[6, 244, 'asphalt'],
					[244, 251, 'other'],
					[251, 299, 'asphalt'],
					[299, 322, 'other'],
					[322, 651, 'asphalt'],
					[651, 681, 'other'],
					[681, 689, 'ground'],
					[689, 976, 'asphalt'],
					[976, 1040, 'other'],
					[1040, 1041, 'asphalt'],
					[1041, 1067, 'other'],
					[1067, 1090, 'asphalt'],
					[1090, 1130, 'other'],
					[1130, 1135, 'asphalt'],
					[1135, 1202, 'other'],
					[1202, 1207, 'ground']
				],
				road_class: [
					[0, 6, 'track'],
					[6, 7, 'secondary'],
					[7, 16, 'residential'],
					[16, 22, 'tertiary'],
					[22, 36, 'residential'],
					[36, 43, 'cycleway'],
					[43, 45, 'residential'],
					[45, 48, 'cycleway'],
					[48, 52, 'residential'],
					[52, 54, 'unclassified'],
					[54, 60, 'residential'],
					[60, 106, 'tertiary'],
					[106, 144, 'residential'],
					[144, 227, 'tertiary'],
					[227, 237, 'residential'],
					[237, 256, 'track'],
					[256, 266, 'residential'],
					[266, 269, 'unclassified'],
					[269, 289, 'tertiary'],
					[289, 299, 'residential'],
					[299, 328, 'track'],
					[328, 396, 'residential'],
					[396, 440, 'cycleway'],
					[440, 441, 'primary'],
					[441, 454, 'residential'],
					[454, 463, 'tertiary'],
					[463, 474, 'residential'],
					[474, 484, 'unclassified'],
					[484, 655, 'residential'],
					[655, 681, 'track'],
					[681, 689, 'path'],
					[689, 765, 'residential'],
					[765, 766, 'primary'],
					[766, 803, 'cycleway'],
					[803, 812, 'primary'],
					[812, 818, 'unclassified'],
					[818, 826, 'residential'],
					[826, 836, 'unclassified'],
					[836, 898, 'primary'],
					[898, 899, 'unclassified'],
					[899, 910, 'residential'],
					[910, 911, 'unclassified'],
					[911, 992, 'residential'],
					[992, 1040, 'track'],
					[1040, 1050, 'residential'],
					[1050, 1072, 'track'],
					[1072, 1090, 'residential'],
					[1090, 1124, 'track'],
					[1124, 1164, 'residential'],
					[1164, 1202, 'track'],
					[1202, 1207, 'path']
				],
				track_type: [
					[0, 6, 'grade3'],
					[6, 36, 'other'],
					[36, 43, 'grade1'],
					[43, 45, 'other'],
					[45, 48, 'grade1'],
					[48, 237, 'other'],
					[237, 244, 'grade1'],
					[244, 251, 'grade2'],
					[251, 256, 'grade1'],
					[256, 299, 'other'],
					[299, 322, 'grade3'],
					[322, 328, 'grade1'],
					[328, 396, 'other'],
					[396, 440, 'grade1'],
					[440, 655, 'other'],
					[655, 689, 'grade3'],
					[689, 766, 'other'],
					[766, 803, 'grade1'],
					[803, 992, 'other'],
					[992, 1040, 'grade2'],
					[1040, 1050, 'other'],
					[1050, 1067, 'grade2'],
					[1067, 1072, 'grade1'],
					[1072, 1090, 'other'],
					[1090, 1124, 'grade2'],
					[1124, 1164, 'other'],
					[1164, 1196, 'grade2'],
					[1196, 1207, 'grade3']
				]
			}
		}
	]
};

const createSimpleGhRoute = (vehicle = null, surface = null, roadClass = null, trackType = null, geometry = null) => {
	const polylinePoints = geometry ? Polyline.writeGeometry(geometry) : defaultPolylineString;

	return {
		vehicle: vehicle ?? 'bike',
		paths: [
			{
				distance: 34200,
				time: 42,
				points_encoded: true,
				points: polylinePoints,
				details: {
					surface: surface ?? [
						[0, 1, 'ground'],
						[2, 4, 'compacted'],
						[5, 12, 'asphalt']
					],
					road_class: roadClass ?? [
						[0, 1, 'track'],
						[2, 10, 'secondary'],
						[11, 14, 'path']
					],
					track_type: trackType ?? [[0, 1, 'grade3']]
				}
			}
		]
	};
};
// profileStats objects reduced the used properties
const evenProfileStats = {
	sumUp: 50,
	sumDown: 50
};
const downHillProfileStats = {
	sumUp: 600,
	sumDown: 300
};

const upHillProfileStats = {
	sumUp: 300,
	sumDown: 600
};
describe('Route statistics provider', () => {
	describe('Bvv route statistics provider', () => {
		const configService = {
			getValue: (value) => (value === 'DEFAULT_LANG' ? 'de' : value)
		};

		beforeAll(() => {
			$injector.registerSingleton('ConfigService', configService);
		});

		describe('when route and profile stats is given', () => {
			it('calculates the statistics for a route', async () => {
				expect(bvvRouteStatsProvider(ghRoute, evenProfileStats)).toBeDefined();
			});
			it('calculates the statistics for a bvv-hike route', async () => {
				const hikeRoute = createSimpleGhRoute('bvv-hike');

				const stats = bvvRouteStatsProvider(hikeRoute, evenProfileStats);

				expect(stats.time).toBeCloseTo(31260000.0, 0);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([50, 50]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('calculates the statistics for a bvv-bike route', async () => {
				const bikeRoute = createSimpleGhRoute('bvv-bike');

				const stats = bvvRouteStatsProvider(bikeRoute, evenProfileStats);

				expect(stats.time).toBe(8508360);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([50, 50]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('calculates the statistics for a bvv-mtb route', async () => {
				const mtbRoute = createSimpleGhRoute('bvv-mtb');

				const stats = bvvRouteStatsProvider(mtbRoute, evenProfileStats);

				expect(stats.time).toBe(6381360);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([50, 50]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('calculates the statistics for a racingbike route', async () => {
				const racingbikeRoute = createSimpleGhRoute('racingbike');

				const stats = bvvRouteStatsProvider(racingbikeRoute, evenProfileStats);

				expect(stats.time).toBeCloseTo(4785257.1, 0);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([50, 50]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('calculates the statistics of a route with uphill profile', async () => {
				const racingbikeRoute = createSimpleGhRoute('racingbike');

				const stats = bvvRouteStatsProvider(racingbikeRoute, upHillProfileStats);

				expect(stats.time).toBeCloseTo(5913085.7, 0);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([300, 600]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('calculates the statistics of a route with downhill profile', async () => {
				const mtbRoute = createSimpleGhRoute('bvv-mtb');

				const stats = bvvRouteStatsProvider(mtbRoute, downHillProfileStats);

				expect(stats.time).toBe(8858160);
				expect(stats.dist).toBe(34200);
				expect(stats.twoDiff).toEqual([600, 300]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});

			it('ignores routedetails with missing property value', async () => {
				const missingPropertySurfaces = [
					[0, 1, null],
					[2, 10, 'compacted']
				];
				const route = createSimpleGhRoute('bvv-hike', missingPropertySurfaces);
				const stats = bvvRouteStatsProvider(route, evenProfileStats);
				expect(stats.details).toEqual(jasmine.objectContaining({ surface: jasmine.objectContaining({ compacted: jasmine.any(Object) }) }));
			});

			describe('with dangerous roadClasses or surfaces', () => {
				const dangerousRoadClass100 = [
					[0, 1, 'path'],
					[2, 10, 'foo']
				];
				const dangerousTrackType_100 = [[0, 1, 'grade4']];
				const dangerousTrackType_200 = [[0, 1, 'grade5']];

				const hikeRoute100 = createSimpleGhRoute('bvv-hike', null, dangerousRoadClass100, dangerousTrackType_100);
				const bikeRoute100 = createSimpleGhRoute('bvv-bike', null, dangerousRoadClass100, dangerousTrackType_100);
				const mtbRoute100 = createSimpleGhRoute('bvv-mtb', null, dangerousRoadClass100, dangerousTrackType_100);
				const racingbikeRoute100 = createSimpleGhRoute('racingbike', null, dangerousRoadClass100, dangerousTrackType_100);

				const hikeRoute200 = createSimpleGhRoute('bvv-hike', null, dangerousRoadClass100, dangerousTrackType_200);
				const bikeRoute200 = createSimpleGhRoute('bvv-bike', null, dangerousRoadClass100, dangerousTrackType_200);

				const dangerousRoadClass300 = [
					[0, 1, 'other'],
					[2, 10, 'foo']
				];
				const dangerousSurface300 = [
					[0, 1, 'ground'],
					[2, 10, 'compacted']
				];
				const trackType_300 = [[0, 1, 'foo']];

				const racingbikeRoute300 = createSimpleGhRoute('racingbike', dangerousSurface300, dangerousRoadClass300, trackType_300);

				const dangerousRoadClass400 = [
					[0, 1, 'track'],
					[2, 10, 'foo']
				];
				const dangerousSurface400 = [
					[0, 1, 'ground'],
					[2, 10, 'foo']
				];
				const dangerousTrackType_400 = [[0, 1, 'grade5']];
				const bikeRoute400 = createSimpleGhRoute('bike', dangerousSurface400, dangerousRoadClass400, dangerousTrackType_400);
				const racingbikeRoute400 = createSimpleGhRoute('racingbike', dangerousSurface400, dangerousRoadClass400, dangerousTrackType_400);
				const dangerousRoadClass500 = [
					[0, 1, 'foo'],
					[2, 10, 'primary']
				];
				const route500 = createSimpleGhRoute('foo', null, dangerousRoadClass500, null);

				it("creates warnings in 'de' (i18n)", async () => {
					const hikeStats100 = bvvRouteStatsProvider(hikeRoute100, downHillProfileStats);
					const bikeStats100 = bvvRouteStatsProvider(bikeRoute100, downHillProfileStats);
					const mtbStats100 = bvvRouteStatsProvider(mtbRoute100, downHillProfileStats);
					const racingbikeStats100 = bvvRouteStatsProvider(racingbikeRoute100, downHillProfileStats);
					const hikeStats200 = bvvRouteStatsProvider(hikeRoute200, downHillProfileStats);
					const bikeStats200 = bvvRouteStatsProvider(bikeRoute200, downHillProfileStats);
					const racingbikeStats300 = bvvRouteStatsProvider(racingbikeRoute300, downHillProfileStats);
					const bikeStats400 = bvvRouteStatsProvider(racingbikeRoute400, downHillProfileStats);
					const racingbikeStats400 = bvvRouteStatsProvider(bikeRoute400, downHillProfileStats);
					const stats500 = bvvRouteStatsProvider(route500, downHillProfileStats);

					expect(mtbStats100.warnings).toEqual(
						jasmine.objectContaining({
							101: {
								message: '(schwieriger) Steig, Trittsicherheit erforderlich. MTB muss evtl. vorher abgestellt oder getragen werden.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(hikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							102: {
								message: '(schwieriger) Steig, Trittsicherheit erforderlich.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(bikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							100: {
								message: '(schwieriger) Steig, Trittsicherheit erforderlich. Fahrrad muss vorher abgestellt werden.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							100: {
								message: '(schwieriger) Steig, Trittsicherheit erforderlich. Fahrrad muss vorher abgestellt werden.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(hikeStats200.warnings).toEqual(
						jasmine.objectContaining({
							201: {
								message: 'schwieriger Steig mit Kletterpassagen; gute Trittsicherheit, ggf. spezielle Ausrüstung erforderlich',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(bikeStats200.warnings).toEqual(
						jasmine.objectContaining({
							200: {
								message:
									'schwieriger Steig mit Kletterpassagen; gute Trittsicherheit, ggf. spezielle Ausrüstung erforderlich; Fahrrad muss vorher abgestellt werden.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats300.warnings).toEqual(
						jasmine.objectContaining({
							300: {
								message: 'Befestigter Weg/Pfad. Rennrad muss evtl. geschoben werden.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[2, 10]]
							},
							301: {
								message: 'Unbefestigter Weg/Pfad. Rennrad muss geschoben werden.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(bikeStats400.warnings).toEqual(
						jasmine.objectContaining({
							400: {
								message: 'Unbefestigter Weg/Pfad. Fahrrad muss evtl. geschoben werden.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats400.warnings).toEqual(
						jasmine.objectContaining({
							400: {
								message: 'Unbefestigter Weg/Pfad. Fahrrad muss evtl. geschoben werden.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(stats500.warnings).toEqual(
						jasmine.objectContaining({
							500: {
								message: 'Evtl. hohes Verkehrsaufkommen',
								criticality: RouteWarningCriticality.HINT,
								segments: [
									[2, 4],
									[5, 10]
								]
							}
						})
					);
				});
				it("creates warnings in 'en' (i18n)", async () => {
					spyOn(configService, 'getValue').and.callFake(() => 'en');

					const hikeStats100 = bvvRouteStatsProvider(hikeRoute100, downHillProfileStats);
					const bikeStats100 = bvvRouteStatsProvider(bikeRoute100, downHillProfileStats);
					const mtbStats100 = bvvRouteStatsProvider(mtbRoute100, downHillProfileStats);
					const racingbikeStats100 = bvvRouteStatsProvider(racingbikeRoute100, downHillProfileStats);
					const hikeStats200 = bvvRouteStatsProvider(hikeRoute200, downHillProfileStats);
					const bikeStats200 = bvvRouteStatsProvider(bikeRoute200, downHillProfileStats);
					const racingbikeStats300 = bvvRouteStatsProvider(racingbikeRoute300, downHillProfileStats);
					const bikeStats400 = bvvRouteStatsProvider(racingbikeRoute400, downHillProfileStats);
					const racingbikeStats400 = bvvRouteStatsProvider(bikeRoute400, downHillProfileStats);
					const stats500 = bvvRouteStatsProvider(route500, downHillProfileStats);

					expect(hikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							102: {
								message: '(Difficult) climb, surefootedness required.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(mtbStats100.warnings).toEqual(
						jasmine.objectContaining({
							101: {
								message: '(Difficult) climb, surefootedness required. MTB may have to be parked or carried beforehand.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);

					expect(bikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							100: {
								message: '(Difficult) climb, sure-footedness required. Bicycle must be parked beforehand.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats100.warnings).toEqual(
						jasmine.objectContaining({
							100: {
								message: '(Difficult) climb, sure-footedness required. Bicycle must be parked beforehand.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(hikeStats200.warnings).toEqual(
						jasmine.objectContaining({
							201: {
								message: 'difficult climb with climbing passages; good surefootedness, special equipment may be required',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(bikeStats200.warnings).toEqual(
						jasmine.objectContaining({
							200: {
								message:
									'difficult trail with climbing sections; good surefootedness, special equipment may be required; bikes must be parked beforehand.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats300.warnings).toEqual(
						jasmine.objectContaining({
							300: {
								message: 'Paved path/trail. Racing bike may have to be pushed.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[2, 10]]
							},
							301: {
								message: 'Unpaved path/trail. Road bike must be pushed.',
								criticality: RouteWarningCriticality.WARNING,
								segments: [[0, 1]]
							}
						})
					);
					expect(bikeStats400.warnings).toEqual(
						jasmine.objectContaining({
							400: {
								message: 'Unpaved path/trail. Bicycle may have to be pushed.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(racingbikeStats400.warnings).toEqual(
						jasmine.objectContaining({
							400: {
								message: 'Unpaved path/trail. Bicycle may have to be pushed.',
								criticality: RouteWarningCriticality.HINT,
								segments: [[0, 1]]
							}
						})
					);
					expect(stats500.warnings).toEqual(
						jasmine.objectContaining({
							500: {
								message: 'Possibly high traffic volume',
								criticality: RouteWarningCriticality.HINT,
								segments: [
									[2, 4],
									[5, 10]
								]
							}
						})
					);
				});
			});
		});

		describe('when route is given', () => {
			it('calculates the statistics for a route', async () => {
				const stats = bvvRouteStatsProvider(ghRoute, null);

				expect(stats.time).toBe(4200000);
				expect(stats.dist).toBe(42000);
				expect(stats.twoDiff).toEqual([]);
				expect(stats.details).toEqual(jasmine.any(Object));
				expect(stats.warnings).toEqual(jasmine.any(Object));
			});
		});
	});
});
