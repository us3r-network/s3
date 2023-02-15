import ReactGA from 'react-ga4';
import { UaEventOptions } from 'react-ga4/types/ga4';

const TRACKING_ID = 'G-J6GQEHQ5H8';

// Enable debug mode on the local development environment
// const isDev = process.env.NODE_ENV === 'development';
ReactGA.initialize(TRACKING_ID);

export function sendEvent(payload: UaEventOptions) {
  ReactGA.event(payload);
}

export function sendPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path });
}
