const STORAGE_KEY = 'dnjp_utm_params';

export const UTM_KEYS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_term',
	'utm_content',
	'utm_id'
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

type StoredUtmParams = UtmParams & { captured_at?: string };

export function captureFromUrl(searchParams: URLSearchParams): UtmParams {
	const params: UtmParams = {};

	for (const key of UTM_KEYS) {
		const value = searchParams.get(key);
		if (value) params[key] = value;
	}

	return params;
}

export function saveUtms(params: UtmParams, mode: 'first' | 'last' = 'first'): void {
	if (typeof localStorage === 'undefined') return;
	if (Object.keys(params).length === 0) return;

	if (mode === 'first' && localStorage.getItem(STORAGE_KEY)) return;

	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({ ...params, captured_at: new Date().toISOString() } satisfies StoredUtmParams)
	);
}

export function loadUtms(): UtmParams {
	if (typeof localStorage === 'undefined') return {};

	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};

		const parsed = JSON.parse(raw) as StoredUtmParams;

		return UTM_KEYS.reduce<UtmParams>((acc, key) => {
			if (parsed[key]) acc[key] = parsed[key];
			return acc;
		}, {});
	} catch {
		return {};
	}
}

export function appendUtmsToUrl(baseUrl: string, utms: UtmParams): string {
	const url = new URL(baseUrl);

	for (const key of UTM_KEYS) {
		const value = utms[key];
		if (value) url.searchParams.set(key, value);
	}

	return url.toString();
}
