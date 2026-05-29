export const META_PIXEL_ID = '1419751732330468';

type MetaEventParams = Record<string, string | number | boolean>;

function canTrack(): boolean {
	return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function trackMetaPageView(): void {
	if (!canTrack()) return;

	window.fbq('track', 'PageView');
}

export function trackMetaCustomEvent(eventName: string, params?: MetaEventParams): void {
	if (!canTrack()) return;

	window.fbq('trackCustom', eventName, params);
}

export function trackMetaLead(params?: MetaEventParams): void {
	if (!canTrack()) return;

	window.fbq('track', 'Lead', params);
}

export function trackMetaViewContent(params?: MetaEventParams): void {
	if (!canTrack()) return;

	window.fbq('track', 'ViewContent', params);
}
