const PANDA_PLAYER_ORIGIN = 'https://player-vz-bfe71eb2-486.tv.pandavideo.com.br';
const PANDA_CDN_ORIGIN = 'https://b-vz-bfe71eb2-486.tv.pandavideo.com.br';
const PANDA_CONFIG_ZONE = 'vz-bfe71eb2-486';

export type PandaStoryVideo = {
	videoId: string;
	iframeId: string;
	embedSrc: string;
	hlsUrl: string;
	/** Duração aproximada (fallback até o HLS carregar) */
	durationSec: number;
};

type PandaHeadLink = {
	rel: string;
	href: string;
	as?: 'style' | 'fetch';
};

function buildEmbedSrc(videoId: string): string {
	const query = new URLSearchParams({
		v: videoId,
		autoplay: 'true',
		smartAutoplay: 'true',
		saveProgress: 'false',
		hideControlsOnStart: 'true',
		preload: 'true',
		controls: ''
	});
	return `${PANDA_PLAYER_ORIGIN}/embed/?${query}`;
}

function createPandaStoryVideo(videoId: string, durationSec: number): PandaStoryVideo {
	return {
		videoId,
		iframeId: `panda-${videoId}`,
		embedSrc: buildEmbedSrc(videoId),
		hlsUrl: `${PANDA_CDN_ORIGIN}/${videoId}/720p/video.m3u8`,
		durationSec
	};
}

/** Story 1 — /historia */
export const PANDA_VD001 = createPandaStoryVideo('f9b4509b-60ac-4b77-8386-771dccb3bd3c', 10.7333);

/** Story 2 — /historia-2 */
export const PANDA_VD002 = createPandaStoryVideo('2e0cb49f-e912-4af4-b62a-5b8b71cefd0b', 20.6);

/** Story 3 — /historia-3 */
export const PANDA_VD003 = createPandaStoryVideo('7efe32ba-cd9e-4dc4-99e6-ee6f73ae2a12', 21.5333);

/** Story 4 — /historia-4 */
export const PANDA_VD004 = createPandaStoryVideo('983da663-2729-4049-9575-6ffc51fff7a5', 22.8667);

const PANDA_FACETIME_VIDEO_ID = '25128ac6-b45f-4fef-b10d-bc5c4f802b3d';

/** Embed FaceTime ativo — vídeo 9:16 (padding-top 177.78% no script Panda) */
function buildFacetimeEmbedSrc(videoId: string): string {
	const query = new URLSearchParams({
		v: videoId,
		autoplay: 'true',
		smartAutoplay: 'true',
		saveProgress: 'false',
		hideControlsOnStart: 'true',
		preload: 'true',
		controls: ''
	});
	return `${PANDA_PLAYER_ORIGIN}/embed/?${query}`;
}

/** Vídeo de fundo — FaceTime ativo (/chamada-2/ativa) */
export const PANDA_FACETIME_CALL: PandaStoryVideo = {
	videoId: PANDA_FACETIME_VIDEO_ID,
	iframeId: `panda-${PANDA_FACETIME_VIDEO_ID}`,
	embedSrc: buildFacetimeEmbedSrc(PANDA_FACETIME_VIDEO_ID),
	hlsUrl: `${PANDA_CDN_ORIGIN}/${PANDA_FACETIME_VIDEO_ID}/720p/video.m3u8`,
	durationSec: 10.7333
};

/** @deprecated use PANDA_VD001.hlsUrl */
export const PANDA_VD001_HLS_URL = PANDA_VD001.hlsUrl;

/** @deprecated use PANDA_VD001.durationSec */
export const PANDA_VD001_DURATION_SEC = PANDA_VD001.durationSec;

/** Preloads recomendados pela Panda para carregamento rápido do player */
export function getPandaHeadLinks(video: PandaStoryVideo): ReadonlyArray<PandaHeadLink> {
	return [
		{
			rel: 'preload',
			href: `${PANDA_PLAYER_ORIGIN}/embed/css/plyr.css`,
			as: 'style'
		},
		{
			rel: 'preload',
			href: `${PANDA_PLAYER_ORIGIN}/embed/css/styles.css`,
			as: 'style'
		},
		{
			rel: 'preload',
			href: `${PANDA_PLAYER_ORIGIN}/embed/css/pb.css`,
			as: 'style'
		},
		{
			rel: 'preload',
			href: `https://config.tv.pandavideo.com.br/${PANDA_CONFIG_ZONE}/${video.videoId}.json`,
			as: 'fetch'
		},
		{
			rel: 'preload',
			href: `https://config.tv.pandavideo.com.br/${PANDA_CONFIG_ZONE}/config.json`,
			as: 'fetch'
		},
		{ rel: 'dns-prefetch', href: PANDA_CDN_ORIGIN },
		{
			rel: 'preload',
			href: `${PANDA_CDN_ORIGIN}/${video.videoId}/playlist.m3u8`,
			as: 'fetch'
		},
		{ rel: 'prerender', href: video.embedSrc },
		{ rel: 'dns-prefetch', href: PANDA_PLAYER_ORIGIN }
	];
}

/** @deprecated use getPandaHeadLinks(PANDA_VD001) */
export const PANDA_VD001_HEAD_LINKS = getPandaHeadLinks(PANDA_VD001);
