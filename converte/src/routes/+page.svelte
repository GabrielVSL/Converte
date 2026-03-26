<script lang="ts">
    import { onMount } from 'svelte';

    // --- ESTADOS ---
    let respostas = $state<any[]>([]);
    let carregando = $state(true);
    let alunoSelecionado = $state<string>('');

    // --- VALORES DERIVADOS (Métricas do Dashboard) ---
    // Pega todos os nomes, remove duplicatas e ordena
    let alunosUnicos = $derived([...new Set(respostas.map(r => r['Nome do Aluno']))].filter(Boolean).sort());
    
    // Filtra as respostas para o aluno que clicarmos
    let respostasDoAluno = $derived(alunoSelecionado ? respostas.filter(r => r['Nome do Aluno'] === alunoSelecionado) : []);

    // --- BUSCA AUTOMÁTICA (Ao carregar a tela) ---
    onMount(async () => {
        try {
            // O Front-end bate na API que acabamos de criar no +server.ts
            const requisicao = await fetch('/api/respostas');
            respostas = await requisicao.json();
        } catch (erro) {
            console.error("Erro ao buscar dados:", erro);
        } finally {
            carregando = false; // Tira o aviso de "Carregando..."
        }
    });

    function gerarPDF() { window.print(); }
</script>

<main class="max-w-5xl mx-auto p-8 font-sans text-gray-800">
    <div class="print:hidden">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard PEI</h1>

        {#if carregando}
            <div class="text-center p-10 bg-gray-50 rounded-lg animate-pulse">
                <p class="text-xl text-gray-500 font-semibold">Sincronizando dados com a nuvem...</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div class="bg-blue-600 text-white p-6 rounded-xl shadow-md">
                    <p class="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">Alunos Atendidos</p>
                    <p class="text-4xl font-black">{alunosUnicos.length}</p>
                </div>
                <div class="bg-green-600 text-white p-6 rounded-xl shadow-md">
                    <p class="text-green-100 text-sm font-bold uppercase tracking-wider mb-1">Total de Formulários</p>
                    <p class="text-4xl font-black">{respostas.length}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div class="p-4 bg-gray-50 border-b border-gray-200">
                        <h2 class="font-bold text-gray-700">Selecione um Aluno</h2>
                    </div>
                    <ul class="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {#each alunosUnicos as aluno}
                            <li>
                                <button 
                                    class="w-full text-left p-4 hover:bg-blue-50 transition-colors {alunoSelecionado === aluno ? 'bg-blue-100 font-bold text-blue-800 border-l-4 border-blue-600' : 'text-gray-700'}"
                                    onclick={() => alunoSelecionado = aluno}
                                >
                                    {aluno}
                                </button>
                            </li>
                        {/each}
                    </ul>
                </div>

                <div class="md:col-span-2">
                    {#if alunoSelecionado}
                        <div class="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h2 class="text-xl font-bold text-gray-800">Relatório de {alunoSelecionado}</h2>
                            <button 
                                onclick={gerarPDF}
                                class="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-black transition-colors"
                            >
                                Baixar PDF
                            </button>
                        </div>
                    {:else}
                        <div class="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 p-10 text-center">
                            Selecione um aluno na lista ao lado para visualizar o relatório e gerar o PDF.
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    {#if alunoSelecionado && respostasDoAluno.length > 0}
        <section class="bg-white rounded-lg print:shadow-none print:p-0 print:block hidden">
            <div class="border-b-2 border-gray-800 pb-4 mb-6 mt-10">
                <h2 class="text-2xl font-bold uppercase tracking-wider text-center">Plano Educacional Individualizado</h2>
                <h3 class="text-xl mt-4"><strong>Aluno(a):</strong> {alunoSelecionado}</h3>
            </div>

            {#each respostasDoAluno as respostaProfessor, index}
                <div class="mb-8 p-4 border border-gray-200 rounded print:border-none print:p-0 print:mb-6" style="break-inside: avoid;">
                    <h4 class="font-bold text-lg text-blue-700 print:text-black mb-4 border-b pb-2">
                        Professor(a): {respostaProfessor['Professor'] || `Registro ${index + 1}`}
                    </h4>
                    
                    <div class="grid grid-cols-1 gap-4">
                        {#each Object.entries(respostaProfessor) as [pergunta, resposta]}
                            {#if pergunta !== 'Nome do Aluno' && pergunta !== 'Carimbo de data/hora'}
                                <div class="bg-gray-50 p-3 rounded print:bg-transparent print:p-0">
                                    <p class="font-semibold text-sm text-gray-600 print:text-gray-800">{pergunta}</p>
                                    <p class="mt-1 text-gray-900 whitespace-pre-wrap">{resposta}</p>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/each}
        </section>
    {/if}
</main>

<style>
    /* Força a seção a aparecer apenas na impressão */
    @media print {
        .print\:block { display: block !important; }
        .hidden { display: none !important; }
    }
</style>