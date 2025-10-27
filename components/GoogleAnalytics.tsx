'use client';

import { GoogleAnalytics as GA } from 'nextjs-google-analytics';

export function GoogleAnalytics() {
  return <GA trackPageViews />;
}