import { registerPlugin } from '@capacitor/core';

// This registers a proxy to our native AppBlocker plugin
const AppBlocker = registerPlugin('AppBlocker');

export default AppBlocker;
