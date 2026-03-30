<script lang="ts">
    let { 
        scrolled,  
        gerarDOCX, 
        alunoSelecionado, 
        gerando,
        abrirModalSync // <-- ADICIONE ISTO AQUI
    } = $props();
</script>

<header class="sticky top-0 z-50 bg-white p-4 lg:px-6 print:hidden transition-all duration-300 {scrolled ? 'shadow-[0_1px_0_0_#2563EB,0_4px_6px_-1px_rgba(0,0,0,0.05)]' : 'border-b border-slate-200'}">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded bg-blue-600 shadow-sm shadow-blue-600/50"></div>
            <div>
                <h1 class="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">Dashboard PEI</h1>
                <p class="text-slate-500 text-xs font-medium">Gestão de Planos Educacionais Individualizados</p>
            </div>
        </div>
        <div class="flex gap-3">
            <button 
                onclick={abrirModalSync} 
                title="Sincronizar ou recuperar dados do Forms (.csv / .xlsx)" 
                class="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-all shadow-sm"
            >
                <svg class="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span class="hidden md:inline">Sincronizar</span>
            </button>
            <button onclick={gerarDOCX} disabled={!alunoSelecionado || gerando} title="Gerar documento oficial no Word" class="relative flex items-center justify-center min-w-[180px] gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-600/30 overflow-hidden">
                {#if gerando}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Gerando...</span>
                {:else}
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    <span>Gerar DOCX</span>
                {/if}
            </button>
        </div>
    </div>
</header>