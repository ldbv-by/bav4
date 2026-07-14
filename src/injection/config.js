import { $injector } from '.';
import { StoreService } from '@src/services/StoreService';
import { OlCoordinateService } from '@src/services/OlCoordinateService';
import { EnvironmentService } from '@src/services/EnvironmentService';
import { ProcessEnvConfigService } from '@src/services/ProcessEnvConfigService';
import { BvvHttpService } from '@src/services/HttpService';
import { TranslationService } from '@src/services/TranslationService';
import { ShareService } from '@src/services/ShareService';
import { UnitsService } from '@src/services/UnitsService';
import { FileSaveService } from '@src/services/FileSaveService';
import { GeoResourceService } from '@src/services/GeoResourceService';
import { UrlService } from '@src/services/UrlService';
import { IconService } from '@src/services/IconService';
import { MapService } from '@src/services/MapService';
import { mapModule } from '@src/modules/olMap/injection';
import { oafModule } from '@src/modules/oaf/injection';
import { AdministrationService } from '@src/services/AdministrationService';
import { TopicsService } from '@src/services/TopicsService';
import { topicsModule } from '@src/modules/topics/injection';
import { LayersPlugin } from '@src/plugins/LayersPlugin';
import { PositionPlugin } from '@src/plugins/PositionPlugin';
import { TopicsPlugin } from '@src/plugins/TopicsPlugin';
import { ChipsPlugin } from '@src/plugins/ChipsPlugin';
import { HighlightPlugin } from '@src/plugins/HighlightPlugin';
import { SearchResultService } from '@src/modules/search/services/SearchResultService';
import { MediaPlugin } from '@src/plugins/MediaPlugin';
import { DrawPlugin } from '@src/plugins/DrawPlugin';
import { MeasurementPlugin } from '@src/plugins/MeasurementPlugin';
import { ContextClickPlugin } from '@src/plugins/ContextClickPlugin';
import { GeolocationPlugin } from '@src/plugins/GeolocationPlugin';
import { FeatureInfoPlugin } from '@src/plugins/FeatureInfoPlugin';
import { MainMenuPlugin } from '@src/plugins/MainMenuPlugin';
import { NavigationRailPlugin } from '@src/plugins/NavigationRailPlugin';
import { FeatureInfoService } from '@src/services/FeatureInfoService';
import { GeoResourceInfoService } from '@src/modules/geoResourceInfo/services/GeoResourceInfoService';
import { ImportVectorDataService } from '@src/services/ImportVectorDataService';
import { OlExportVectorDataService } from '@src/services/ExportVectorDataService';
import { SourceTypeService } from '@src/services/SourceTypeService';
import { ImportPlugin } from '@src/plugins/ImportPlugin';
import { SecurityService } from '@src/services/SecurityService';
import { ImportWmsService } from '@src/services/ImportWmsService';
import { BaaCredentialService } from '@src/services/BaaCredentialService';
import { SearchPlugin } from '@src/plugins/SearchPlugin';
import { EncodeStatePlugin } from '@src/plugins/EncodeStatePlugin';
import { BvvMfpService } from '@src/services/MfpService';
import { ChipsConfigurationService } from '@src/services/ChipsConfigurationService';
import { ExportMfpPlugin } from '@src/plugins/ExportMfpPlugin';
import { Proj4JsService } from '@src/services/Proj4JsService';
import { BvvMfp3Encoder } from '@src/modules/olMap/services/Mfp3Encoder';
import { ElevationProfilePlugin } from '@src/plugins/ElevationProfilePlugin';
import { ElevationService } from '@src/services/ElevationService';
import { IframeStatePlugin } from '@src/plugins/IframeStatePlugin';
import { ObserveStateForEncodingPlugin } from '@src/plugins/ObserveStateForEncodingPlugin';
import { SharePlugin } from '@src/plugins/SharePlugin';
import { FeedbackService } from '@src/services/FeedbackService';
import { GeoResourceLegendService } from '@src/services/GeoResourceLegendService';
import { IframeContainerPlugin } from '@src/plugins/IframeContainerPlugin';
import { ToolsPlugin } from '@src/plugins/ToolsPlugin';
import { IframeGeometryIdPlugin } from '@src/plugins/IframeGeometryIdPlugin';
import { BeforeUnloadPlugin } from '@src/plugins/BeforeUnloadPlugin';
import { BvvRoutingService } from '@src/services/RoutingService';
import { RoutingPlugin } from '@src/plugins/RoutingPlugin';
import { AuthService } from '@src/services/AuthService';
import { GlobalErrorPlugin } from '@src/plugins/GlobalErrorPlugin';
import { AuthPlugin } from '@src/plugins/AuthPlugin';
import { fileStorageServiceFactory } from './factories';
import { FileStoragePlugin } from '@src/plugins/FileStoragePlugin';
import { TimeTravelPlugin } from '@src/plugins/TimeTravelPlugin';
import { BvvPredefinedConfigurationService } from '@src/services/PredefinedConfigurationService';
import { ComparePlugin } from '@src/plugins/ComparePlugin';
import { FeatureCollectionPlugin } from '@src/plugins/FeatureCollectionPlugin';
import { ImportOafService } from '@src/services/ImportOafService';
import { HtmlPrintService } from '@src/services/HtmlPrintService';
import { PublicWebComponentPlugin } from '@src/plugins/PublicWebComponentPlugin';
import { EmbedReadyPlugin } from '@src/plugins/EmbedReadyPlugin';
import { ImportStaService } from '@src/services/ImportStaService';
import { LegendsPlugin } from '@src/plugins/LegendsPlugin';

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
	.registerModule(mapModule)
	.registerModule(topicsModule)
	.registerModule(oafModule)
	.ready();

export const init = true;
