
import { coordinateSelectProvide } from './coordinateSelect.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('coordinateSelectProvider', coordinateSelectProvide);

