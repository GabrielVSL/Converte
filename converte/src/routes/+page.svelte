<script lang="ts">
    import { onMount } from 'svelte';

    // --- ESTADOS ---
    let respostas = $state<any[]>([]);
    let carregando = $state(true);
    let alunoSelecionado = $state<string>('');
    let busca = $state('');

    // --- LÓGICA DE FILTRO E MÉTRICAS ---
    let alunosUnicos = $derived(
        [...new Set(respostas.map(r => r['Nome do Aluno']))]
            .filter(Boolean)
            .filter(nome => nome.toLowerCase().includes(busca.toLowerCase()))
            .sort()
    );
    
    let respostasDoAluno = $derived(
        alunoSelecionado ? respostas.filter(r => r['Nome do Aluno'] === alunoSelecionado) : []
    );

    onMount(async () => {
        try {
            const requisicao = await fetch('/api/respostas');
            respostas = await requisicao.json();
        } catch (erro) {
            console.error("Erro:", erro);
        } finally {
            carregando = false;
        }
    });

    // --- FUNÇÕES DE EXPORTAÇÃO ---
    function gerarPDF() { window.print(); }

    function baixarCSV() {
        if (respostas.length === 0) return;
        const headers = Object.keys(respostas[0]).join(",");
        const rows = respostas.map(r => 
            Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
        ).join("\n");
        
        const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_pei_${new Date().toLocaleDateString()}.csv`;
        link.click();
    }

    // Função auxiliar para limpar textos de arrays vindos do Forms ["Item"] -> Item
    function formatarTexto(texto: any) {
        if (typeof texto === 'string' && texto.startsWith('[') && texto.endsWith(']')) {
            try {
                return JSON.parse(texto).join(", ");
            } catch { return texto; }
        }
        return texto;
    }
</script>

<main class="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
    <header class="bg-white border-b border-slate-200 p-6 print:hidden shadow-sm">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Plantei! <span class="text-blue-600">Dashboard PEI</span>
                </h1>
                <p class="text-slate-500 text-sm">Gestão de Planos Educacionais Individualizados</p>
            </div>
            <div class="flex gap-3">
                <button onclick={baixarCSV} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm">
                    <span>📥 Exportar Excel</span>
                </button>
                <button onclick={gerarPDF} disabled={!alunoSelecionado} class="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-100">
                    <span>📄 Gerar Relatório PDF</span>
                </button>
            </div>
        </div>
    </header>

    <div class="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <aside class="md:col-span-4 lg:col-span-3 space-y-4 print:hidden">
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-400 uppercase">Alunos</p>
                    <p class="text-2xl font-black text-slate-800">{alunosUnicos.length}</p>
                </div>
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p class="text-xs font-bold text-slate-400 uppercase">Registros</p>
                    <p class="text-2xl font-black text-slate-800">{respostas.length}</p>
                </div>
            </div>

            <div class="relative">
                <input 
                    bind:value={busca}
                    placeholder="Buscar aluno..." 
                    class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                <span class="absolute left-3 top-3.5 opacity-30">🔍</span>
            </div>

            <nav class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div class="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Lista de Alunos</div>
                <ul class="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {#each alunosUnicos as aluno}
                        <li>
                            <button 
                                onclick={() => alunoSelecionado = aluno}
                                class="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors {alunoSelecionado === aluno ? 'bg-blue-50 border-l-4 border-blue-600' : ''}"
                            >
                                <span class="text-sm font-semibold {alunoSelecionado === aluno ? 'text-blue-700' : 'text-slate-600'}">{aluno}</span>
                                <span class="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-400 font-medium">
                                    {respostas.filter(r => r['Nome do Aluno'] === aluno).length}
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
            </nav>
        </aside>

        <section class="md:col-span-8 lg:col-span-9">
            {#if alunoSelecionado}
                <article class="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none min-h-[80vh]">
                    <div class="p-8 bg-slate-900 text-white flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:pb-4">
                        <div>
                            <h2 class="text-sm font-bold uppercase tracking-[0.2em] opacity-70">Documento Oficial PEI</h2>
                            <p class="text-2xl font-black italic">Colégio São Paulo da Cruz</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm opacity-70">Ano Letivo</p>
                            <p class="font-bold">2026</p>
                        </div>
                    </div>

                    <div class="p-8 print:p-0">
                        <div class="mb-10">
                            <p class="text-slate-400 text-xs font-bold uppercase mb-1">Nome do Aluno(a)</p>
                            <h3 class="text-3xl font-black text-slate-900 border-b-4 border-blue-600 inline-block pb-2 print:border-black">{alunoSelecionado}</h3>
                        </div>

                        <div class="space-y-12">
                            {#each respostasDoAluno as reg, i}
                                <div class="relative pl-6 border-l-2 border-slate-100 print:border-slate-300 print:mb-12" style="break-inside: avoid;">
                                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 print:bg-black"></div>
                                    
                                    <div class="flex justify-between items-end mb-6">
                                        <h4 class="text-lg font-extrabold text-blue-800 print:text-black">
                                            Professor(a): {reg['Professor']}
                                        </h4>
                                        <span class="text-xs font-mono text-slate-400 uppercase tracking-tighter">REF-ID: {i+1}</span>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl print:bg-transparent print:p-0 print:grid-cols-1">
                                        {#each Object.entries(reg) as [chave, valor]}
                                            {#if !['Nome do Aluno', 'Professor'].includes(chave) && valor}
                                                <div class="space-y-1">
                                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{chave}</p>
                                                    <p class="text-sm text-slate-700 leading-relaxed font-medium">
                                                        {formatarTexto(valor)}
                                                    </p>
                                                </div>
                                            {/if}
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>

                        <div class="hidden print:grid grid-cols-2 gap-20 mt-20 text-center">
                            <div class="border-t border-black pt-2 text-xs uppercase font-bold">Assinatura do Professor</div>
                            <div class="border-t border-black pt-2 text-xs uppercase font-bold">Coordenação Pedagógica</div>
                        </div>
                    </div>
                </article>
            {:else}
                <div class="h-full min-h-[60vh] flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 space-y-4 shadow-inner">
                    <div class="text-6xl">📝</div>
                    <p class="text-lg font-medium">Selecione um aluno para gerar o relatório</p>
                </div>
            {/if}
        </section>
    </div>
</main>

<style>
    :global(body) {
        background-color: #f8fafc;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
    }

    @media print {
        @page { size: auto; margin: 15mm; }
        body { background: white; }
        main { background: white; padding: 0; max-width: 100%; }
        .print\:hidden { display: none !important; }
        .print\:shadow-none { shadow: none !important; }
        .print\:border-none { border: none !important; }
        .print\:block { display: block !important; }
    }
</style>