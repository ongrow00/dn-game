import { goto } from '$app/navigation';
import { setAdvanceMethod, type AdvanceMethod } from '$lib/analytics';

export function advanceTo(href: string, method: AdvanceMethod = 'navigation') {
	setAdvanceMethod(method);
	return goto(href);
}
