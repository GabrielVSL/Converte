<script lang="ts">
    import { getAluno, getProf, getData } from '$lib/utils/excel';

    let { reg, SECTIONS, fecharPreview, formatarTexto } = $props();

    const nomeAluno = $derived(getAluno(reg));
    const nomeProf = $derived(getProf(reg));
    const dataEnvio = $derived(getData(reg));

    // O $derived.by resolve o problema de renderização no Svelte 5
    const respostasReais = $derived.by(() => {
        const resp = { ...reg };
        const lixo = ['ID', 'Id', 'id', 'Hora de início', 'Hora de conclusão', 'Email', 'Nome', 'Nome do aluno', 'Nome do(a) Aluno(a)', 'Aluno', 'Professor', 'Carimbo de data/hora', 'Data'];
        
        for (const chave of Object.keys(resp)) {
            if (lixo.some(l => l.trim().toLowerCase() === chave.trim().toLowerCase())) {
                delete resp[chave];
            }
        }
        return resp;
    });

    // Motor de busca flexível: garante que a pergunta vai ser achada mesmo com diferenças bobas de digitação
    function buscarRespostaSegura(campoDesejado: string) {
        const chavesDisponiveis = Object.keys(respostasReais);
        const chaveMapeada = chavesDisponiveis.find(chaveExcel => 
            chaveExcel.trim().toLowerCase() === campoDesejado.trim().toLowerCase()
        );
        return (chaveMapeada && respostasReais[chaveMapeada]) ? respostasReais[chaveMapeada] : null;
    }
</script>

<div class="fixed inset-0 z-[110] flex items-center justify-center print:hidden">
    <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onclick={fecharPreview}></div>
    
    <div class="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeSlideIn border border-slate-100">
        <div class="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
                <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Preview Detalhado do Excel</h3>
                <p class="text-xl font-black text-slate-900 leading-none">PEI: <span class="text-blue-700">{nomeAluno || 'Sem Nome'}</span></p>
                <p class="text-xs text-slate-500 mt-2 font-medium">Professor(a): {nomeProf || 'Sem Professor'} | Data: {dataEnvio || '-'}</p>
            </div>
            <button onclick={fecharPreview} class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8 bg-slate-50/30">
            {#each Object.entries(SECTIONS) as [nomeSecao, camposDaSecao]}
                {#if (camposDaSecao as string[]).some(campo => buscarRespostaSegura(campo) && String(buscarRespostaSegura(campo)).trim() !== '')}
                    <div class="space-y-4">
                        <h4 class="text-xs font-bold uppercase text-blue-600 tracking-widest bg-white px-3 py-1.5 rounded-full inline-block border border-blue-100 shadow-sm">{nomeSecao}</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {#each (camposDaSecao as string[]) as campo}
                                {@const valorEncontrado = buscarRespostaSegura(campo)}
                                {#if valorEncontrado && String(valorEncontrado).trim() !== ''}
                                    <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors {String(valorEncontrado).length > 80 ? 'md:col-span-2' : ''}">
                                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{campo}</p>
                                        <p class="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{formatarTexto(valorEncontrado)}</p>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/if}
            {/each}

            {#if !Object.entries(SECTIONS).some(([_, campos]) => (campos as string[]).some(c => buscarRespostaSegura(c) && String(buscarRespostaSegura(c)).trim() !== ''))}
                <div class="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200">
                    <span class="text-4xl">⚠️</span>
                    <p class="text-amber-800 font-bold mt-3">Não conseguimos mapear as perguntas do Excel.</p>
                    <p class="text-xs text-amber-600 mt-1">Verifique se o nome das colunas da planilha batem com as configurações (SECTIONS) do sistema.</p>
                </div>
            {/if}
        </div>

        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button onclick={fecharPreview} type="button" class="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm">
                Fechar Visualização
            </button>
        </div>
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeSlideIn { animation: fadeSlideIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
</style>