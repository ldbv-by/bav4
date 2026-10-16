import { $injector } from '../../../injection';
import { provide as baseLayerInfoProvider } from './baseLayerInfo.provider';
import { coordinateSelectProvider } from './coordinateSelect.provider';
import { privacyPolicyProvider } from './privacyPolicy.provider';

const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateSelectProvider', coordinateSelectProvider);
translationService.register('baseLayerInfoProvider', baseLayerInfoProvider);
translationService.register('privacyPolicyProvider', privacyPolicyProvider);
