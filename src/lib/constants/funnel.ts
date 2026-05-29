export const FUNNEL_NAME = 'operacao_fragmento';

export type FunnelStep = {
	index: number;
	path: string;
	id: string;
	name: string;
};

export const FUNNEL_STEPS: FunnelStep[] = [
	{ index: 1, path: '/', id: 'landing', name: 'Landing' },
	{ index: 2, path: '/instrucoes', id: 'instrucoes', name: 'Instruções' },
	{ index: 3, path: '/chamada', id: 'chamada_1_tocando', name: 'Chamada 1 — tocando' },
	{ index: 4, path: '/chamada/ativa', id: 'chamada_1_ativa', name: 'Chamada 1 — ativa' },
	{ index: 5, path: '/historia', id: 'historia_1', name: 'História 1' },
	{ index: 6, path: '/pergunta', id: 'pergunta', name: 'Pergunta' },
	{ index: 7, path: '/cena', id: 'cena', name: 'Cena' },
	{ index: 8, path: '/historia-2', id: 'historia_2', name: 'História 2' },
	{ index: 9, path: '/enigma', id: 'enigma', name: 'Enigma' },
	{ index: 10, path: '/quadro', id: 'quadro_evidencias', name: 'Quadro de evidências' },
	{ index: 11, path: '/historia-3', id: 'historia_3', name: 'História 3' },
	{ index: 12, path: '/senha', id: 'senha_enigma', name: 'Senha / enigma' },
	{ index: 13, path: '/mensagem', id: 'mensagem', name: 'Mensagem' },
	{ index: 14, path: '/historia-4', id: 'historia_4', name: 'História 4' },
	{ index: 15, path: '/documento', id: 'documento_puzzle', name: 'Documento / puzzle' },
	{ index: 16, path: '/suspeitos', id: 'suspeitos', name: 'Suspeitos' },
	{ index: 17, path: '/chamada-2', id: 'chamada_2_tocando', name: 'Chamada 2 — tocando' },
	{ index: 18, path: '/chamada-2/ativa', id: 'chamada_2_ativa', name: 'Chamada 2 — ativa' },
	{ index: 19, path: '/acesso', id: 'acesso_liberado', name: 'Acesso liberado' },
	{ index: 20, path: '/arquivos', id: 'oferta_arquivos', name: 'Oferta de arquivos' }
];

export function getFunnelStep(pathname: string): FunnelStep | null {
	return FUNNEL_STEPS.find((step) => step.path === pathname) ?? null;
}
