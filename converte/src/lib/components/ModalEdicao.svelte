<script lang="ts">
    let { 
        registroEmEdicao = $bindable(), 
        carregando, 
        SECTIONS, 
        fecharModalEdicao, 
        salvarEdicao 
    } = $props();
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center print:hidden">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onclick={fecharModalEdicao}></div>
    
    <div class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeSlideIn">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
                <h2 class="text-lg font-extrabold text-slate-800">Editar Plano Educacional (PEI)</h2>
                <p class="text-xs text-slate-500 font-medium mt-0.5">Alterando dados de: <strong class="text-blue-600">{registroEmEdicao['Nome do Aluno']}</strong></p>
            </div>
            <button onclick={fecharModalEdicao} class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <form onsubmit={salvarEdicao} class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Aluno</label>
                    <input bind:value={registroEmEdicao['Nome do Aluno']} class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700" required />
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Professor(a)</label>
                    <input bind:value={registroEmEdicao['Professor']} class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700" required />
                </div>
            </div>

            {#each Object.entries(SECTIONS) as [nomeSecao, camposDaSecao]}
                <div class="space-y-4">
                    <h3 class="text-sm font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg inline-block">{nomeSecao}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each (camposDaSecao as string[]) as campo}
                            <div class="space-y-1.5 {['Adaptações Necessárias', 'Metas e Objetivos do PEI', 'Observações Finais'].includes(campo) ? 'md:col-span-2' : ''}">
                                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight block">{campo}</label>
                                <textarea 
                                    bind:value={registroEmEdicao[campo]} 
                                    class="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700 min-h-[80px] resize-y custom-scrollbar"
                                ></textarea>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
            <button type="submit" id="btn-submit-edicao" class="hidden"></button>
        </form>

        <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button onclick={fecharModalEdicao} type="button" class="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancelar
            </button>
            <button onclick={() => document.getElementById('btn-submit-edicao')?.click()} disabled={carregando} class="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                {#if carregando}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {/if}
                Salvar Alterações
            </button>
        </div>
    </div>
</div>