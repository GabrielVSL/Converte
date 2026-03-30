<script lang="ts">
    import { onMount } from 'svelte';
    import PizZip from 'pizzip';
    import Docxtemplater from 'docxtemplater';
    
    import pkg from 'file-saver';
    const { saveAs } = pkg;

    // --- Importação dos nossos Componentes Filhos ---
    import Header from '$lib/components/Header.svelte';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import MainContent from '$lib/components/MainContent.svelte';
    import ModalEdicao from '$lib/components/ModalEdicao.svelte';
    import ModalSync from '$lib/components/ModalSync.svelte';

    // --- ESTADOS GLOBAIS ---
    let respostas = $state<any[]>([]);
    let carregando = $state(true);
    let alunoSelecionado = $state<string>('');
    let busca = $state('');
    let professorFiltro = $state<string>('');

    // --- ESTADOS DA UI ---
    let gerando = $state(false);
    let scrolled = $state(false);
    let mounted = $state(false);
    let modalEdicaoAberto = $state(false);
    let modalSyncAberto = $state(false);
    let registroEmEdicao = $state<any>(null);

    // --- AGRUPAMENTO DE SEÇÕES ---
    const SECTIONS = {
        'Identificação': ['Componente(s) Curricular(es)', 'Modalidade de Ensino', 'Necessidades Relacionadas'],
        'Perfil do Aluno': ['Autonomia nas Rotinas', 'Comunicação Eficaz', 'Relação com Colegas e Professores', 'Comportamento e Interação', 'Comunicação', 'Limites e Agressividade'],
        'Currículo PEI': ['Área do Currículo PEI', 'Metodologia (Português)', 'Habilidades Adquiridas (Português)', 'Metodologia (Matemática)', 'Habilidades Adquiridas (Matemática)', 'Metodologia (Ciências)', 'Habilidades Adquiridas (Ciências)', 'Metodologia (Hist. Geo.)', 'Habilidades Adquiridas (Hist. Geo.)'],
        'Plano e Metas': ['Adaptações Necessárias', 'Recursos de Apoio', 'Metas e Objetivos do PEI', 'Observações Finais']
    };

    // --- VARIÁVEIS DERIVADAS ---
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

    // --- LÓGICA DE BUSCA DE DADOS ---
    async function buscarDados() {
        carregando = true;
        try {
            const requisicao = await fetch('/api/respostas');
            const dadosBrutos = await requisicao.json();

            // --- O "TRADUTOR" CENTRAL ---
            // Pega todas as perguntas exatas que o seu Dashboard espera
            const camposEsperados = Object.values(SECTIONS).flat();

            respostas = dadosBrutos.map(reg => {
                const regLimpo = { ...reg }; // Faz uma cópia da linha do banco
                const chavesNoBanco = Object.keys(regLimpo);

                for (const campoExato of camposEsperados) {
                    // Procura se a pergunta veio do Excel com letra minúscula ou espaço extra
                    const chaveQueVeioDoExcel = chavesNoBanco.find(k => 
                        k.replace(/\u00A0/g, " ").trim().toLowerCase() === campoExato.toLowerCase()
                    );
                    
                    if (chaveQueVeioDoExcel) {
                        // Transfere o valor para a chave com o nome PERFEITO que o sistema espera
                        regLimpo[campoExato] = regLimpo[chaveQueVeioDoExcel];
                        
                        // Apaga a chave velha/suja se o nome era diferente, para evitar lixo
                        if (chaveQueVeioDoExcel !== campoExato) {
                            delete regLimpo[chaveQueVeioDoExcel];
                        }
                    }
                }
                return regLimpo;
            });

        } catch (erro) {
            console.error("Erro:", erro);
        } finally {
            carregando = false;
        }
    }

    // --- INICIALIZAÇÃO ---
    onMount(() => {
        mounted = true;
        
        const handleScroll = () => { scrolled = window.scrollY > 10; };
        window.addEventListener('scroll', handleScroll);

        buscarDados(); // Apenas chamamos ela aqui na montagem inicial
        
        return () => window.removeEventListener('scroll', handleScroll);
    });

    // --- LÓGICA DE NEGÓCIO ---
    function formatarTexto(texto: any) {
        if (!texto) return "";
        
        // 1. Lida com Arrays do JSON (Caso o dado venha do Make.com)
        if (typeof texto === 'string' && texto.startsWith('[') && texto.endsWith(']')) {
            try { 
                const array = JSON.parse(texto);
                if (Array.isArray(array)) {
                    // Se tem mais de 1 item, cria uma lista com "•". Se não, retorna limpo.
                    return array.length > 1 ? '• ' + array.join('\n• ') : array[0];
                }
            } catch { /* Se não for JSON válido, segue para a próxima verificação */ }
        }

        // 2. Lida com os pontos e vírgulas do Excel (Padrão do MS Forms)
        if (typeof texto === 'string' && texto.includes(';')) {
            // Divide o texto onde tem ';', limpa os espaços e remove os vazios (o ';' que sobra no final)
            const itens = texto.split(';')
                .map(item => item.trim())
                .filter(item => item.length > 0); 

            // Se virou mais de um item, transforma numa lista pontuada e com quebra de linha
            if (itens.length > 1) {
                return '• ' + itens.join('\n• ');
            } 
            // Se era só um item que o professor digitou com um ';' sem querer no final, retorna limpo
            else if (itens.length === 1) {
                return itens[0];
            }
        }

        // 3. Se for texto normal, só remove espaços extras das pontas
        return String(texto).trim();
    }

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

    async function excluirRegistro(idRegistro: string | number) {
        if (!confirm('Tem certeza que deseja excluir este PEI? Esta ação não pode ser desfeita.')) return;
        carregando = true;

        try {
            const resposta = await fetch(`/api/respostas?id=${idRegistro}`, { method: 'DELETE' });
            if (!resposta.ok) throw new Error('Falha ao excluir no banco de dados');

            respostas = respostas.filter(r => r.id !== idRegistro);
            alert('Registro excluído com sucesso!');
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
            alert("Erro ao excluir o registro. Tente novamente.");
        } finally {
            carregando = false;
        }
    }

    function abrirModalEdicao(registro: any) {
        registroEmEdicao = JSON.parse(JSON.stringify(registro));
        for (const key in registroEmEdicao) {
            if (key !== 'id') registroEmEdicao[key] = formatarTexto(registroEmEdicao[key]);
        }
        modalEdicaoAberto = true;
    }

    function fecharModalEdicao() {
        modalEdicaoAberto = false;
        registroEmEdicao = null;
    }

    async function salvarEdicao(event: SubmitEvent) {
        event.preventDefault();
        carregando = true;

        try {
            const resposta = await fetch('/api/respostas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registroEmEdicao)
            });

            if (!resposta.ok) throw new Error('Falha ao atualizar no banco de dados');

            respostas = respostas.map(r => r.id === registroEmEdicao.id ? registroEmEdicao : r);
            fecharModalEdicao();
            alert('Registro atualizado com sucesso!');
        } catch (erro) {
            console.error("Erro ao salvar edição:", erro);
            alert("Erro ao salvar as alterações.");
        } finally {
            carregando = false;
        }
    }
</script>

<main class="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-blue-200">
    <Header 
        {scrolled} 
        {gerarDOCX} 
        {alunoSelecionado} 
        {gerando} 
        abrirModalSync={() => modalSyncAberto = true} 
    />

    <div class="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <Sidebar 
            {mounted} {alunosUnicos} {respostas} {professoresUnicos} {carregando}
            bind:busca={busca} bind:professorFiltro={professorFiltro} bind:alunoSelecionado={alunoSelecionado}
        />

        <MainContent 
            {alunoSelecionado} {respostasDoAluno} {SECTIONS} {formatarTexto} 
            {abrirModalEdicao} {excluirRegistro} 
        />
    </div>

    {#if modalEdicaoAberto && registroEmEdicao}
        <ModalEdicao 
            bind:registroEmEdicao={registroEmEdicao} {carregando} {SECTIONS} 
            {fecharModalEdicao} {salvarEdicao} 
        />
    {/if}

    {#if modalSyncAberto}
        <ModalSync 
            fecharModalSync={() => modalSyncAberto = false} 
            respostasAtuais={respostas} 
            atualizarRespostas={buscarDados}
            SECTIONS={SECTIONS}
            formatarTexto={formatarTexto}
        />
    {/if}
</main>

<style>
    :global(body) { background-color: #F8FAFC; }

    @media print {
        @page { size: auto; margin: 15mm; }
        body { background: white; }
        main { background: white; padding: 0; max-width: 100%; }
        :global(.print\:hidden) { display: none !important; }
        :global(.print\:shadow-none) { box-shadow: none !important; }
        :global(.print\:border-none) { border: none !important; }
        :global(.print\:bg-transparent) { background-color: transparent !important; }
    }
</style>