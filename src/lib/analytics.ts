import { FUNNEL_NAME, FUNNEL_STEPS, getFunnelStep } from '$lib/constants/funnel';
import { trackMetaCustomEvent, trackMetaLead, trackMetaPageView, trackMetaViewContent } from '$lib/meta-pixel';
import { loadUtms } from '$lib/utm';

export const GA4_MEASUREMENT_ID = 'G-69CQC95H4R';

export type AdvanceMethod =
	| 'navigation'
	| 'button_click'
	| 'auto'
	| 'video_end'
	| 'quiz_solved'
	| 'quiz_skip'
	| 'puzzle_solved'
	| 'interaction';

let pendingAdvanceMethod: AdvanceMethod = 'navigation';

function getCampaignParams(): Record<string, string> {
	const utms = loadUtms();

	return {
		...(utms.utm_source && { campaign_source: utms.utm_source }),
		...(utms.utm_medium && { campaign_medium: utms.utm_medium }),
		...(utms.utm_campaign && { campaign_name: utms.utm_campaign }),
		...(utms.utm_term && { campaign_term: utms.utm_term }),
		...(utms.utm_content && { campaign_content: utms.utm_content })
	};
}

function getFunnelParams(): Record<string, string | number> {
	return {
		funnel_name: FUNNEL_NAME,
		total_steps: FUNNEL_STEPS.length,
		...getCampaignParams()
	};
}

export function setAdvanceMethod(method: AdvanceMethod): void {
	pendingAdvanceMethod = method;
}

export function consumeAdvanceMethod(): AdvanceMethod {
	const method = pendingAdvanceMethod;
	pendingAdvanceMethod = 'navigation';
	return method;
}

export function trackPageView(pagePath: string, pageTitle?: string): void {
	if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
		window.gtag('event', 'page_view', {
			page_path: pagePath,
			page_title: pageTitle ?? document.title,
			page_location: `${window.location.origin}${pagePath}`,
			...getCampaignParams()
		});
	}

	trackMetaPageView();
}

export function trackFunnelStepView(pathname: string): void {
	const step = getFunnelStep(pathname);
	if (!step) return;

	const params = {
		...getFunnelParams(),
		step_index: step.index,
		step_id: step.id,
		step_name: step.name,
		step_path: step.path
	};

	trackEvent('funnel_step_view', params);
	trackMetaCustomEvent('FunnelStepView', params);

	if (step.path === '/arquivos') {
		trackEvent('generate_lead', params);
		trackMetaLead(params);
	}
}

export function trackFunnelAdvance(fromPathname: string, toPathname: string): void {
	const fromStep = getFunnelStep(fromPathname);
	const toStep = getFunnelStep(toPathname);
	if (!fromStep || !toStep) return;

	const params = {
		...getFunnelParams(),
		from_step_index: fromStep.index,
		from_step_id: fromStep.id,
		from_step_name: fromStep.name,
		to_step_index: toStep.index,
		to_step_id: toStep.id,
		to_step_name: toStep.name,
		advance_method: consumeAdvanceMethod()
	};

	trackEvent('funnel_step_complete', params);
	trackMetaCustomEvent('FunnelStepComplete', params);
}

export function trackAcceptMissionClick(): void {
	const params = {
		...getFunnelParams(),
		content_name: 'Aceitar Missão',
		content_category: 'landing',
		step_id: 'landing',
		step_index: 1
	};

	trackMetaViewContent(params);
	trackEvent('view_content', params);
}

export function trackReceiveFilesClick(destinationUrl: string): void {
	const step = getFunnelStep('/arquivos');
	if (!step) return;

	const params = {
		...getFunnelParams(),
		step_index: step.index,
		step_id: step.id,
		step_name: step.name,
		destination_url: destinationUrl
	};

	trackEvent('receive_files_click', params);
	trackMetaCustomEvent('ReceiveFilesClick', params);
}

export function trackEvent(
	eventName: string,
	params?: Record<string, string | number | boolean>
): void {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

	window.gtag('event', eventName, params);
}
