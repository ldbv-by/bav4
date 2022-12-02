import './i18n';
import { AltitudeProfile } from './components/AltitudeProfile';

if (!window.customElements.get(AltitudeProfile.tag)) {
  window.customElements.define(AltitudeProfile.tag, AltitudeProfile);
}
