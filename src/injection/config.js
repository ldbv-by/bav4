import { GeoResourceInfoService } from '@src/modules/geoResourceInfo/services/GeoResourceInfoService';
import { oafModule } from '@src/modules/oaf/injection';
import { olModule } from '@src/modules/olMap/injection';
import { BvvMfp3Encoder } from '@src/modules/olMap/services/Mfp3Encoder';
import { SearchResultService } from '@src/modules/search/services/SearchResultService';
import { topicsModule } from '@src/modules/topics/injection';
import { AuthPlugin } from '@src/plugins/AuthPlugin';
import { BeforeUnloadPlugin } from '@src/plugins/BeforeUnloadPlugin';
import { ChipsPlugin } from '@src/plugins/ChipsPlugin';
import { ComparePlugin } from '@src/plugins/ComparePlugin';
import { ContextClickPlugin } from '@src/plugins/ContextClickPlugin';
import { DrawPlugin } from '@src/plugins/DrawPlugin';
import { ElevationProfilePlugin } from '@src/plugins/ElevationProfilePlugin';
import { EmbedReadyPlugin } from '@src/plugins/EmbedReadyPlugin';
import { EncodeStatePlugin } from '@src/plugins/EncodeStatePlugin';
import { ExportMfpPlugin } from '@src/plugins/ExportMfpPlugin';
import { FeatureCollectionPlugin } from '@src/plugins/FeatureCollectionPlugin';
import { FeatureInfoPlugin } from '@src/plugins/FeatureInfoPlugin';
import { FileStoragePlugin } from '@src/plugins/FileStoragePlugin';
import { GeolocationPlugin } from '@src/plugins/GeolocationPlugin';
import { GlobalErrorPlugin } from '@src/plugins/GlobalErrorPlugin';
import { HighlightPlugin } from '@src/plugins/HighlightPlugin';
import { IframeContainerPlugin } from '@src/plugins/IframeContainerPlugin';
import { IframeGeometryIdPlugin } from '@src/plugins/IframeGeometryIdPlugin';
import { IframeStatePlugin } from '@src/plugins/IframeStatePlugin';
import { ImportPlugin } from '@src/plugins/ImportPlugin';
import { LayersPlugin } from '@src/plugins/LayersPlugin';
import { LegendsPlugin } from '@src/plugins/LegendsPlugin';
import { MainMenuPlugin } from '@src/plugins/MainMenuPlugin';
import { MeasurementPlugin } from '@src/plugins/MeasurementPlugin';
import { MediaPlugin } from '@src/plugins/MediaPlugin';
import { NavigationRailPlugin } from '@src/plugins/NavigationRailPlugin';
import { ObserveStateForEncodingPlugin } from '@src/plugins/ObserveStateForEncodingPlugin';
import { PositionPlugin } from '@src/plugins/PositionPlugin';
import { PublicWebComponentPlugin } from '@src/plugins/PublicWebComponentPlugin';
import { RoutingPlugin } from '@src/plugins/RoutingPlugin';
import { SearchPlugin } from '@src/plugins/SearchPlugin';
import { SharePlugin } from '@src/plugins/SharePlugin';
import { TimeTravelPlugin } from '@src/plugins/TimeTravelPlugin';
import { ToolsPlugin } from '@src/plugins/ToolsPlugin';
import { TopicsPlugin } from '@src/plugins/TopicsPlugin';
import { AdministrationService } from '@src/services/AdministrationService';
import { AuthService } from '@src/services/AuthService';
import { BaaCredentialService } from '@src/services/BaaCredentialService';
import { ChipsConfigurationService } from '@src/services/ChipsConfigurationService';
import { ElevationService } from '@src/services/ElevationService';
import { EnvironmentService } from '@src/services/EnvironmentService';
import { OlExportVectorDataService } from '@src/services/ExportVectorDataService';
import { FeatureInfoService } from '@src/services/FeatureInfoService';
import { FeedbackService } from '@src/services/FeedbackService';
import { FileSaveService } from '@src/services/FileSaveService';
import { GeoResourceLegendService } from '@src/services/GeoResourceLegendService';
import { GeoResourceService } from '@src/services/GeoResourceService';
import { HtmlPrintService } from '@src/services/HtmlPrintService';
import { BvvHttpService } from '@src/services/HttpService';
import { IconService } from '@src/services/IconService';
import { ImportOafService } from '@src/services/ImportOafService';
import { ImportStaService } from '@src/services/ImportStaService';
import { ImportVectorDataService } from '@src/services/ImportVectorDataService';
import { ImportWmsService } from '@src/services/ImportWmsService';
import { MapService } from '@src/services/MapService';
import { BvvMfpService } from '@src/services/MfpService';
import { OlCoordinateService } from '@src/services/OlCoordinateService';
import { BvvPredefinedConfigurationService } from '@src/services/PredefinedConfigurationService';
import { ProcessEnvConfigService } from '@src/services/ProcessEnvConfigService';
import { Proj4JsService } from '@src/services/Proj4JsService';
import { BvvRoutingService } from '@src/services/RoutingService';
import { SecurityService } from '@src/services/SecurityService';
import { ShareService } from '@src/services/ShareService';
import { SourceTypeService } from '@src/services/SourceTypeService';
import { StoreService } from '@src/services/StoreService';
import { TopicsService } from '@src/services/TopicsService';
import { TranslationService } from '@src/services/TranslationService';
import { UnitsService } from '@src/services/UnitsService';
import { UrlService } from '@src/services/UrlService';
import { $injector } from '.';
import { fileStorageServiceFactory } from './factories';

$injector
	.registerSingleton('ProjectionService', new Proj4JsService())
	.registerSingleton('AuthService', new AuthService())
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.register('HttpService', BvvHttpService)
	.register('EnvironmentService', EnvironmentService)
	.registerSingleton('TranslationService', new TranslationService())
	.register('CoordinateService', OlCoordinateService)
	.register('MapService', MapService)
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('TopicsService', new TopicsService())
	.registerSingleton('ElevationService', new ElevationService())
	.register('SearchResultService', SearchResultService)
	.register('ShareService', ShareService)
	.register('UnitsService', UnitsService)
	.register('FileSaveService', FileSaveService)
	.registerFactory('FileStorageService', fileStorageServiceFactory)
	.register('UrlService', UrlService)
	.registerSingleton('IconService', new IconService())
	.register('AdministrationService', AdministrationService)
	.register('FeatureInfoService', FeatureInfoService)
	.registerSingleton('GeoResourceInfoService', new GeoResourceInfoService())
	.register('ImportVectorDataService', ImportVectorDataService)
	.register('ExportVectorDataService', OlExportVectorDataService)
	.register('ImportWmsService', ImportWmsService)
	.registerSingleton('ImportOafService', new ImportOafService())
	.register('ImportStaService', ImportStaService)
	.register('HtmlPrintService', HtmlPrintService)
	.registerSingleton('SourceTypeService', new SourceTypeService())
	.register('Mfp3Encoder', BvvMfp3Encoder)
	.registerSingleton('SecurityService', new SecurityService())
	.registerSingleton('BaaCredentialService', new BaaCredentialService())
	.registerSingleton('MfpService', new BvvMfpService())
	.registerSingleton('ChipsConfigurationService', new ChipsConfigurationService())
	.registerSingleton('FeedbackService', new FeedbackService())
	.registerSingleton('RoutingService', new BvvRoutingService())
	.register('PredefinedConfigurationService', BvvPredefinedConfigurationService)
	.registerSingleton('GeoResourceLegendService', new GeoResourceLegendService())
	.registerSingleton('GlobalErrorPlugin', new GlobalErrorPlugin())
	.registerSingleton('AuthPlugin', new AuthPlugin())
	.registerSingleton('EmbedReadyPlugin', new EmbedReadyPlugin())
	.registerSingleton('DrawPlugin', new DrawPlugin())
	.registerSingleton('RoutingPlugin', new RoutingPlugin())
	.registerSingleton('TopicsPlugin', new TopicsPlugin())
	.registerSingleton('ChipsPlugin', new ChipsPlugin())
	.registerSingleton('LayersPlugin', new LayersPlugin())
	.registerSingleton('LegendsPlugin', new LegendsPlugin())
	.registerSingleton('PositionPlugin', new PositionPlugin())
	.registerSingleton('HighlightPlugin', new HighlightPlugin())
	.registerSingleton('MediaPlugin', new MediaPlugin())
	.registerSingleton('MeasurementPlugin', new MeasurementPlugin())
	.registerSingleton('GeolocationPlugin', new GeolocationPlugin())
	.registerSingleton('ContextClickPlugin', new ContextClickPlugin())
	.registerSingleton('FeatureInfoPlugin', new FeatureInfoPlugin())
	.registerSingleton('MainMenuPlugin', new MainMenuPlugin())
	.registerSingleton('NavigationRailPlugin', new NavigationRailPlugin())
	.registerSingleton('ImportPlugin', new ImportPlugin())
	.registerSingleton('SearchPlugin', new SearchPlugin())
	.registerSingleton('ExportMfpPlugin', new ExportMfpPlugin())
	.registerSingleton('ElevationProfilePlugin', new ElevationProfilePlugin())
	.registerSingleton('IframeStatePlugin', new IframeStatePlugin())
	.registerSingleton('IframeContainerPlugin', new IframeContainerPlugin())
	.registerSingleton('SharePlugin', new SharePlugin())
	.registerSingleton('ToolsPlugin', new ToolsPlugin())
	.registerSingleton('FileStoragePlugin', new FileStoragePlugin())
	.registerSingleton('BeforeUnloadPlugin', new BeforeUnloadPlugin())
	.registerSingleton('IframeGeometryIdPlugin', new IframeGeometryIdPlugin())
	.registerSingleton('EncodeStatePlugin', new EncodeStatePlugin())
	.registerSingleton('TimeTravelPlugin', new TimeTravelPlugin())
	.registerSingleton('ComparePlugin', new ComparePlugin())
	.registerSingleton('FeatureCollectionPlugin', new FeatureCollectionPlugin())
	.registerSingleton('PublicWebComponentPlugin', new PublicWebComponentPlugin())
	.registerSingleton('ObserveStateForEncodingPlugin', new ObserveStateForEncodingPlugin())
	.registerModule(olModule)
	.registerModule(topicsModule)
	.registerModule(oafModule)
	.ready();

export const init = true;
