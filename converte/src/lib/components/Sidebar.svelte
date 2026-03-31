<script lang="ts">
    // Recebendo os dados e os estados "bindáveis"
    let { 
        mounted,
        alunosUnicos,
        respostas,
        professoresUnicos,
        carregando,
        busca = $bindable(),
        professorFiltro = $bindable(),
        etapaFiltro = $bindable(), // <--- ADICIONE ESTA LINHA AQUI
        alunoSelecionado = $bindable()
    } = $props();
</script>

<aside class="md:col-span-4 lg:col-span-3 space-y-5 print:hidden">
    <div class="flex items-stretch bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden {mounted ? 'animate-fadeSlideRight' : 'opacity-0'}">
        <div class="flex-1 p-4 text-center">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alunos</p>
            <p class="text-2xl font-black text-slate-800 leading-none">{alunosUnicos.length}</p>
        </div>
        <div class="w-[1px] bg-slate-100 my-4"></div>
        <div class="flex-1 p-4 text-center">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registros</p>
            <p class="text-2xl font-black text-blue-600 leading-none">{respostas.length}</p>
        </div>
    </div>

    <div class="space-y-3">
        <div class="relative group">
            <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input bind:value={busca} placeholder="Buscar aluno..." class="w-full pl-10 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm placeholder-slate-400 text-slate-900 font-medium"/>
            {#if busca !== ''}
                <button onclick={() => busca = ''} class="absolute right-3 top-3.5 text-slate-300 hover:text-slate-500 transition-colors"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            {/if}
        </div>
        
        <div class="relative group">
            <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
            <select bind:value={professorFiltro} class="w-full pl-10 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="">Todos os Professores</option>
                {#each professoresUnicos as prof}<option value={prof}>{prof}</option>{/each}
            </select>
            <svg class="absolute right-3.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>

        <div class="relative group">
            <svg class="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
            </svg>
            <select bind:value={etapaFiltro} class="w-full pl-10 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm text-slate-700 font-medium appearance-none cursor-pointer">
                <option value="">Todas as Etapas</option>
                <option value="1ª Etapa">1ª Etapa</option>
                <option value="2ª Etapa">2ª Etapa</option>
                <option value="3ª Etapa">3ª Etapa</option>
            </select>
            <svg class="absolute right-3.5 top-4 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </div>
    </div>

    <nav class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Base de Alunos</span>
        </div>
        
        <div class="max-h-[55vh] overflow-y-auto custom-scrollbar relative">
            {#if carregando}
                <div class="p-3 space-y-3">
                    {#each Array(5) as _}
                        <div class="flex items-center gap-3 p-2">
                            <div class="w-7 h-7 rounded-full bg-slate-100 shimmer-bg shrink-0"></div>
                            <div class="flex-1 space-y-2"><div class="h-3 bg-slate-100 rounded shimmer-bg w-3/4"></div></div>
                        </div>
                    {/each}
                </div>
            {:else}
                <ul class="divide-y divide-slate-50">
                    {#each alunosUnicos as aluno}
                        <li>
                            <button onclick={() => alunoSelecionado = aluno} class="w-full text-left px-4 py-3.5 flex items-center justify-between transition-all duration-200 relative border-l-4 {alunoSelecionado === aluno ? 'border-blue-600 bg-blue-50/50 shadow-[inset_3px_0_0_0_#2563EB]' : 'border-transparent hover:border-blue-300 hover:bg-slate-50'}">
                                <div class="flex items-center gap-3">
                                    <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">{aluno ? aluno.charAt(0).toUpperCase() : '?'}</div>
                                    <span class="text-sm font-semibold truncate max-w-[140px] {alunoSelecionado === aluno ? 'text-blue-900' : 'text-slate-700'}">{aluno}</span>
                                </div>
                                <span class="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-bold shadow-sm">{respostas.filter(r => r['Nome do Aluno'] === aluno && (professorFiltro ? r['Professor'] === professorFiltro : true)).length}</span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </nav>
</aside>

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }

    @keyframes fadeSlideRight {
        from { opacity: 0; transform: translateX(-15px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .animate-fadeSlideRight {
        animation: fadeSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .shimmer-bg {
        background: #f1f5f9;
        background-image: linear-gradient(to right, #f1f5f9 0%, #e2e8f0 20%, #f1f5f9 40%, #f1f5f9 100%);
        background-repeat: no-repeat;
        background-size: 800px 100%;
        animation: placeholderShimmer 1.5s linear infinite forwards;
    }
    @keyframes placeholderShimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
    }
</style>