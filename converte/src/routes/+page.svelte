<script lang="ts">
    import { onMount } from 'svelte';
    import PizZip from 'pizzip';
    import Docxtemplater from 'docxtemplater';
    
    import pkg from 'file-saver';
    const { saveAs } = pkg;

    // --- ESTADOS ---
    let respostas = $state<any[]>([]);
    let carregando = $state(true);
    let alunoSelecionado = $state<string>('');
    let busca = $state('');
    let professorFiltro = $state<string>('');

    // --- ESTADOS (UX/Animações) ---
    let gerando = $state(false);
    let scrolled = $state(false);
    let mounted = $state(false);

    // --- AGRUPAMENTO DE SEÇÕES (Nova estrutura visual) ---
    const SECTIONS = {
        'Identificação': ['Componente(s) Curricular(es)', 'Modalidade de Ensino', 'Necessidades Relacionadas'],
        'Perfil do Aluno': ['Autonomia nas Rotinas', 'Comunicação Eficaz', 'Relação com Colegas e Professores', 'Comportamento e Interação', 'Comunicação', 'Limites e Agressividade'],
        'Currículo PEI': ['Área do Currículo PEI', 'Metodologia (Português)', 'Habilidades Adquiridas (Português)', 'Metodologia (Matemática)', 'Habilidades Adquiridas (Matemática)', 'Metodologia (Ciências)', 'Habilidades Adquiridas (Ciências)', 'Metodologia (Hist. Geo.)', 'Habilidades Adquiridas (Hist. Geo.)'],
        'Plano e Metas': ['Adaptações Necessárias', 'Recursos de Apoio', 'Metas e Objetivos do PEI', 'Observações Finais']
    };

    // --- LÓGICA DE FILTRO E MÉTRICAS ---
    let alunosUnicos = $derived(
        [...new Set(respostas.map(r => r['Nome do Aluno']))]
            .filter(Boolean)
            .filter(nome => String(nome).toLowerCase().includes(busca.toLowerCase()))
            .sort()
    );

    let professoresUnicos = $derived(
        [...new Set(respostas.map(r => r['Professor']))]
            .filter(Boolean)
            .sort()
    );
    
    let respostasDoAluno = $derived(
        respostas.filter(r => {
            const ehOAlunoCerto = alunoSelecionado ? r['Nome do Aluno'] === alunoSelecionado : false;
            const ehOProfessorCerto = professorFiltro ? r['Professor'] === professorFiltro : true;
            return ehOAlunoCerto && ehOProfessorCerto;
        })
    );

onMount(() => {
        mounted = true;
        
        const handleScroll = () => { scrolled = window.scrollY > 10; };
        window.addEventListener('scroll', handleScroll);

        // Isolamos a parte async em uma função interna
        const buscarDados = async () => {
            try {
                const requisicao = await fetch('/api/respostas');
                respostas = await requisicao.json();
            } catch (erro) {
                console.error("Erro:", erro);
            } finally {
                carregando = false;
            }
        };
        
        buscarDados(); // Chama a função

        // O retorno da limpeza agora é síncrono, o TypeScript fica feliz!
        return () => window.removeEventListener('scroll', handleScroll);
    });

    // --- FUNÇÕES DE EXPORTAÇÃO ---
    async function gerarDOCX() {
        if (!alunoSelecionado || respostasDoAluno.length === 0) return;
        gerando = true;

        try {
            const response = await fetch('/template_pei.docx');
            if (!response.ok) throw new Error("Template não encontrado na pasta static");
            const arrayBuffer = await response.arrayBuffer();

            const zip = new PizZip(arrayBuffer);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            doc.render({
                nome_aluno: alunoSelecionado,
                ano: new Date().getFullYear(),
                registros: respostasDoAluno.map(r => ({
                    professor: formatarTexto(r['Professor']) || "Não informado",
                    componentes_curriculares: formatarTexto(r['Componente(s) Curricular(es)']) || "-",
                    modalidade_ensino: formatarTexto(r['Modalidade de Ensino']) || "-",
                    necessidades_relacionadas: formatarTexto(r['Necessidades Relacionadas']) || "-",
                    autonomia_rotinas: formatarTexto(r['Autonomia nas Rotinas']) || "-",
                    comunicacao_eficaz: formatarTexto(r['Comunicação Eficaz']) || "-",
                    relacao_colegas_professores: formatarTexto(r['Relação com Colegas e Professores']) || "-",
                    comportamento_interacao: formatarTexto(r['Comportamento e Interação']) || "-",
                    comunicacao: formatarTexto(r['Comunicação']) || "-",
                    limites_agressividade: formatarTexto(r['Limites e Agressividade']) || "-",
                    area_curriculo_pei: formatarTexto(r['Área do Currículo PEI']) || "-",
                    lp_metodologia: formatarTexto(r['Metodologia (Português)']) || "-",
                    lp_habilidades: formatarTexto(r['Habilidades Adquiridas (Português)']) || "-",
                    mat_metodologia: formatarTexto(r['Metodologia (Matemática)']) || "-",
                    mat_habilidades: formatarTexto(r['Habilidades Adquiridas (Matemática)']) || "-",
                    cie_metodologia: formatarTexto(r['Metodologia (Ciências)']) || "-",
                    cie_habilidades: formatarTexto(r['Habilidades Adquiridas (Ciências)']) || "-",
                    hge_metodologia: formatarTexto(r['Metodologia (Hist. Geo.)']) || "-",
                    hge_habilidades: formatarTexto(r['Habilidades Adquiridas (Hist. Geo.)']) || "-",
                    adaptacoes_necessarias: formatarTexto(r['Adaptações Necessárias']) || "-",
                    recursos_apoio: formatarTexto(r['Recursos de Apoio']) || "-",
                    metas_objetivos_pei: formatarTexto(r['Metas e Objetivos do PEI']) || "-",
                    observacoes_finais: formatarTexto(r['Observações Finais']) || "-"
                }))
            });

            const blob = doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            saveAs(blob, `PEI_${alunoSelecionado.replace(/\s+/g, '_')}.docx`);
        } catch (erro) {
            console.error("Erro ao gerar DOCX:", erro);
            alert("Erro ao gerar o documento. Verifique o console.");
        } finally {
            gerando = false;
        }
    }

    function baixarCSV() {
        if (respostas.length === 0) return;
        const headers = Object.keys(respostas[0]).join(",");
        const rows = respostas.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_pei_${new Date().toLocaleDateString()}.csv`;
        link.click();
    }

    function formatarTexto(texto: any) {
        if (typeof texto === 'string' && texto.startsWith('[') && texto.endsWith(']')) {
            try { return JSON.parse(texto).join(", "); } catch { return texto; }
        }
        return texto;
    }
</script>

<main class="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-200">
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
                <button onclick={baixarCSV} title="Exportar dados brutos para Excel (.csv)" class="group flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    <svg class="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                    <span>Exportar CSV</span>
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

    <div class="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
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

        <section class="md:col-span-8 lg:col-span-9 relative min-h-[70vh]">
            {#if !alunoSelecionado}
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl animated-dash-border shadow-sm print:hidden">
                    <div class="bg-blue-50 p-6 rounded-full mb-6">
                        <svg class="w-16 h-16 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-700 mb-1">Selecione um aluno</h3>
                    <p class="text-sm text-slate-400">O relatório completo será exibido aqui.</p>
                </div>
            {:else}
                {#key alunoSelecionado}
                    <article class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none animate-fadeSlideIn">
                        
                        <div class="p-8 bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] text-white flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:pb-4">
                            <div>
                                <div class="flex items-center gap-3 mb-1">
                                    <span class="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 uppercase tracking-widest print:border-black print:text-black">PEI</span>
                                    <h2 class="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Documento Oficial</h2>
                                </div>
                                <p class="text-3xl font-black tracking-tight mt-1">Colégio São Paulo da Cruz</p>
                            </div>
                            <div class="text-right">
                                <div class="bg-white/10 border border-white/20 backdrop-blur-md px-5 py-2.5 rounded-xl print:border-none print:p-0 text-center">
                                    <p class="text-[10px] opacity-70 uppercase tracking-widest mb-0.5">Ano Letivo</p>
                                    <p class="text-xl font-bold leading-none">{new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>

                        <div class="p-8 print:p-0 print:pt-6">
                            
                            <div class="flex items-center gap-5 mb-6">
                                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0 print:border print:border-black print:text-black print:bg-transparent">
                                    {alunoSelecionado.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="text-slate-400 text-xs font-bold uppercase mb-1 tracking-wider">Nome do Aluno(a)</p>
                                    <h3 class="text-3xl font-black text-slate-900 leading-none">{alunoSelecionado}</h3>
                                    <p class="text-sm text-slate-500 mt-2 font-medium">
                                        {respostasDoAluno.length} registro{respostasDoAluno.length !== 1 ? 's' : ''} encontrado{respostasDoAluno.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div class="w-full h-px bg-blue-100 mb-8 print:bg-black"></div>

                            {#if respostasDoAluno.length === 0}
                                 <div class="flex items-start gap-3 p-5 bg-amber-50 rounded-xl border border-amber-200/60 shadow-sm mb-8">
                                    <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <div>
                                        <h4 class="text-sm font-bold text-amber-900">Nenhum registro encontrado</h4>
                                        <p class="text-sm text-amber-700 mt-1">Este aluno não possui respostas cadastradas pelo professor selecionado no filtro atual.</p>
                                    </div>
                                 </div>
                            {/if}

                            <div class="space-y-5">
                                {#each respostasDoAluno as reg, i}
                                    <div class="relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden print:border-none print:shadow-none print:mb-16 opacity-0 animate-cardIn" style="animation-delay: {i * 80}ms; animation-fill-mode: forwards; break-inside: avoid;">
                                        
                                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 print:hidden"></div>
                                        
                                        <div class="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 print:bg-transparent print:border-b-2 print:border-black print:px-0">
                                            <div class="flex items-center gap-2.5">
                                                <svg class="w-5 h-5 text-blue-600 print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                                </svg>
                                                <h4 class="text-base font-extrabold text-blue-900 print:text-black">
                                                    Professor(a): {reg['Professor']}
                                                </h4>
                                            </div>
                                            <span class="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md tracking-tighter shadow-sm print:hidden">REF-ID: {i+1}</span>
                                        </div>

                                        <div class="p-6 print:p-0 print:pt-4">
                                            {#each Object.entries(SECTIONS) as [nomeSecao, camposDaSecao]}
                                                {#if camposDaSecao.some(campo => reg[campo] && String(reg[campo]).trim() !== '')}
                                                    <div class="mb-8 last:mb-0">
                                                        <h5 class="text-xs font-bold uppercase text-blue-600 tracking-widest mb-4 mt-2 border-b border-blue-100 pb-1.5 print:text-black print:border-black">
                                                            {nomeSecao}
                                                        </h5>
                                                        
                                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-1 print:gap-4">
                                                            {#each camposDaSecao as campo}
                                                                {#if reg[campo] && String(reg[campo]).trim() !== ''}
                                                                    {@const valorFormatado = formatarTexto(reg[campo])}
                                                                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-blue-50/40 transition-colors print:bg-transparent print:border-none print:p-0 {String(valorFormatado).length > 80 ? 'md:col-span-2' : ''}">
                                                                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 print:text-slate-600">{campo}</p>
                                                                        <p class="text-sm text-slate-700 leading-relaxed font-medium print:text-black whitespace-pre-wrap">{valorFormatado}</p>
                                                                    </div>
                                                                {/if}
                                                            {/each}
                                                        </div>
                                                    </div>
                                                {/if}
                                            {/each}
                                        </div>

                                        <div class="hidden print:grid grid-cols-3 gap-8 mt-12 mb-4 px-4 text-center">
                                            <div class="border-t border-black pt-2 text-[10px] uppercase font-bold">
                                                Professor(a)<br/>{reg['Professor']}
                                            </div>
                                            <div class="border-t border-black pt-2 text-[10px] uppercase font-bold mt-3">
                                                Coordenação Pedagógica
                                            </div>
                                            <div class="border-t border-black pt-2 text-[10px] uppercase font-bold mt-3">
                                                Direção Escolar
                                            </div>
                                        </div>

                                    </div>
                                {/each}
                            </div>

                        </div>
                    </article>
                {/key}
            {/if}
        </section>
    </div>
</main>

<style>
    :global(body) { background-color: #F8FAFC; }

    /* Custom Scrollbar (Mantida) */
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }

    /* --- Animations --- */
    @keyframes fadeSlideRight {
        from { opacity: 0; transform: translateX(-15px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .animate-fadeSlideRight {
        animation: fadeSlideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeSlideIn {
        animation: fadeSlideIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    /* Nova Animação dos Cards Staggered */
    @keyframes cardIn {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-cardIn {
        /* A duração fica aqui, o delay está inline no HTML */
        animation: cardIn 350ms ease-out forwards;
    }

    /* Skeleton Shimmer (Mantida) */
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

    /* Animated Dashed Border for Empty State (Mantida) */
    .animated-dash-border {
        background-image: 
            linear-gradient(90deg, #cbd5e1 50%, transparent 50%), 
            linear-gradient(90deg, #cbd5e1 50%, transparent 50%), 
            linear-gradient(0deg, #cbd5e1 50%, transparent 50%), 
            linear-gradient(0deg, #cbd5e1 50%, transparent 50%);
        background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
        background-size: 16px 2px, 16px 2px, 2px 16px, 2px 16px;
        background-position: left top, right bottom, left bottom, right top;
        animation: borderDance 1.2s infinite linear;
    }
    @keyframes borderDance {
        0% { background-position: 0 0, 100% 100%, 0 100%, 100% 0; }
        100% { background-position: 16px 0, calc(100% - 16px) 100%, 0 calc(100% - 16px), 100% 16px; }
    }

    /* --- Print Styles --- */
    @media print {
        @page { size: auto; margin: 15mm; }
        body { background: white; }
        main { background: white; padding: 0; max-width: 100%; }
        .print\:hidden { display: none !important; }
        .print\:shadow-none { box-shadow: none !important; }
        .print\:border-none { border: none !important; }
    }
</style>