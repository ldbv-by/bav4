import { Profile } from './components/Profile';
import { ProfileN } from './components/ProfileN';

if (!window.customElements.get(ProfileN.tag)) {
	window.customElements.define(ProfileN.tag, ProfileN);
}
if (!window.customElements.get(Profile.tag)) {
	window.customElements.define(Profile.tag, Profile);
}
