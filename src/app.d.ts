// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
		fbq: {
			(action: 'init', pixelId: string): void;
			(action: 'track', eventName: 'PageView' | 'Lead' | 'ViewContent', params?: Record<string, unknown>): void;
			(
				action: 'trackCustom',
				eventName: string,
				params?: Record<string, unknown>
			): void;
			callMethod?: (...args: unknown[]) => void;
			queue: unknown[][];
			push: (...args: unknown[]) => void;
			loaded: boolean;
			version: string;
		};
		_fbq: Window['fbq'];
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
