import { privacyPolicyProvider } from './privacyPolicy.provider';
import { coordinateSelectProvider } from './coordinateSelect.provider';
import { provide as baseLayerInfoProvider } from './baseLayerInfo.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateSelectProvider', coordinateSelectProvider);
translationService.register('baseLayerInfoProvider', baseLayerInfoProvider);
translationService.register('privacyPolicyProvider', privacyPolicyProvider);
