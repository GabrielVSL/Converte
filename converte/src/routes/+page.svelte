<script lang="ts">
    import { onMount } from 'svelte';
    import PizZip from 'pizzip';
    import Docxtemplater from 'docxtemplater';
    import JSZip from 'jszip';
    
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
    let etapaFiltro = $state<string>('');

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
    
    // Atualize para incluir a etapa na filtragem
    let respostasFiltradas = $derived(respostas.filter(r => {
        const matchBusca = busca === '' || (r['Nome do Aluno'] && r['Nome do Aluno'].toLowerCase().includes(busca.toLowerCase()));
        const matchProf = professorFiltro === '' || r['Professor'] === professorFiltro;
        const matchEtapa = etapaFiltro === '' || r['Etapa'] === etapaFiltro; // <-- NOVO
        return matchBusca && matchProf && matchEtapa;
    }));

    // Faça o mesmo para as respostas do aluno selecionado
    let respostasDoAluno = $derived(
        respostas.filter(r => 
            r['Nome do Aluno'] === alunoSelecionado && 
            (professorFiltro === '' || r['Professor'] === professorFiltro) &&
            (etapaFiltro === '' || r['Etapa'] === etapaFiltro) // <-- NOVO
        )
    );

// --- LÓGICA DE BUSCA DE DADOS ---
    async function buscarDados() {
        carregando = true;
        try {
            const requisicao = await fetch('/api/respostas');
            const dadosBrutos = await requisicao.json();

            const camposEsperados = Object.values(SECTIONS).flat();
            
            respostas = dadosBrutos.map((reg: any) => {
                const regLimpo = { ...reg };
                const chavesNoBanco = Object.keys(regLimpo);

                // --- CORREÇÃO CIRÚRGICA DOS NOMES ---
                let nomeAlunoCorreto = regLimpo['Nome do Aluno'];
                let nomeProfCorreto = regLimpo['Professor']; // Atualmente está recebendo o email

                for (const chave of chavesNoBanco) {
                    // Limpa espaços invisíveis do MS Forms (\u00A0 e \u200B)
                    const chaveLimpa = chave.replace(/[\u00A0\u200B]/g, " ").trim().toLowerCase();
                    
                    // Puxa o nome real do aluno, ignorando a chave corrompida com "Sem Nome"
                    if (chaveLimpa === 'nome do aluno' && regLimpo[chave] && regLimpo[chave] !== 'Sem Nome') {
                        nomeAlunoCorreto = regLimpo[chave];
                    }
                    
                    // A coluna "Nome" pura do Forms é quem guarda o nome real da professora
                    if (chaveLimpa === 'nome' && regLimpo[chave]) {
                        nomeProfCorreto = regLimpo[chave];
                    }
                }

                regLimpo['Nome do Aluno'] = nomeAlunoCorreto !== 'Sem Nome' ? nomeAlunoCorreto : 'Nome Não Informado';
                regLimpo['Professor'] = nomeProfCorreto;
                // ------------------------------------

                for (const campoExato of camposEsperados) {
                    const chaveQueVeioDoExcel = chavesNoBanco.find(k => 
                        k.replace(/[\u00A0\u200B]/g, " ").trim().toLowerCase() === campoExato.trim().toLowerCase()
                    );
                    
                    if (chaveQueVeioDoExcel) {
                        regLimpo[campoExato] = regLimpo[chaveQueVeioDoExcel];
                        if (chaveQueVeioDoExcel !== campoExato) {
                            delete regLimpo[chaveQueVeioDoExcel];
                        }
                    }
                }
                return regLimpo;
            });

        } catch (erro) {
            console.error("Erro ao buscar dados:", erro);
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

            // --- Função Auxiliar de Busca Blindada ---
            const pegarResposta = (r: any, palavraChave: string) => {
                let chave = Object.keys(r).find(k => k.trim().toLowerCase() === palavraChave.trim().toLowerCase());
                if (!chave) chave = Object.keys(r).find(k => k.toLowerCase().includes(palavraChave.toLowerCase()));
                return chave ? r[chave] : null;
            };

            // --- Formatação com Mensagem Profissional para Vazios ---
            const formatarDocx = (valor: any, textoVazio = "Não avaliado neste componente / Não se aplica") => {
                const txt = formatarTexto(valor);
                return (txt && txt !== '-' && txt !== 'undefined') ? txt : textoVazio;
            };

            // --- Função de Renderização do Template ---
            const criarBlobDocx = (respostasDoDoc: any[]) => {
                const zipDoc = new PizZip(arrayBuffer);
                const doc = new Docxtemplater(zipDoc, { paragraphLoop: true, linebreaks: true });

                doc.render({
                    nome_aluno: alunoSelecionado,
                    ano: new Date().getFullYear(),
                    registros: respostasDoDoc.map(r => {
                        const componente = String(pegarResposta(r, 'Componente') || "").toLowerCase();
                        const metodologiaForm = pegarResposta(r, 'metodologia de trabalho');
                        const habilidadesForm = pegarResposta(r, 'habilidades/aprendizados');
                        const naoAplica = "Não se aplica a esta disciplina";

                        // Roteamento Inteligente da Metodologia
                        let lp_met = naoAplica, lp_hab = naoAplica;
                        let mat_met = naoAplica, mat_hab = naoAplica;
                        let cie_met = naoAplica, cie_hab = naoAplica;
                        let hge_met = naoAplica, hge_hab = naoAplica;

                        if (componente.includes('portugu') || componente.includes('letra')) {
                            lp_met = formatarDocx(metodologiaForm, "Não preenchido"); lp_hab = formatarDocx(habilidadesForm, "Não preenchido");
                        } else if (componente.includes('matem')) {
                            mat_met = formatarDocx(metodologiaForm, "Não preenchido"); mat_hab = formatarDocx(habilidadesForm, "Não preenchido");
                        } else if (componente.includes('ciência') || componente.includes('natureza') || componente.includes('biologia')) {
                            cie_met = formatarDocx(metodologiaForm, "Não preenchido"); cie_hab = formatarDocx(habilidadesForm, "Não preenchido");
                        } else if (componente.includes('hist') || componente.includes('geograf') || componente.includes('humanas')) {
                            hge_met = formatarDocx(metodologiaForm, "Não preenchido"); hge_hab = formatarDocx(habilidadesForm, "Não preenchido");
                        }

                        return {
                            professor: formatarDocx(r['Professor'], "Não informado"),
                            componentes_curriculares: formatarDocx(pegarResposta(r, 'Componente'), "Não informado"),
                            modalidade_ensino: formatarDocx(pegarResposta(r, 'Modalidade de ensino')),
                            necessidades_relacionadas: formatarDocx(pegarResposta(r, 'necessidades relacionada')),

                            autonomia_rotinas: formatarDocx(pegarResposta(r, 'autonomia nas rotinas')),
                            comunicacao_eficaz: formatarDocx(pegarResposta(r, 'comunica de forma eficaz')),
                            relacao_colegas_professores: formatarDocx(pegarResposta(r, 'Relação com colegas')),
                            comportamento_interacao: formatarDocx(pegarResposta(r, 'comportamento, autorregulação')),
                            comunicacao: formatarDocx(pegarResposta(r, 'Comunicação')),
                            limites_agressividade: formatarDocx(pegarResposta(r, 'Limites e agressividade')),
                            area_curriculo_pei: formatarDocx(pegarResposta(r, 'Área do Currículo PEI')),

                            lp_metodologia: lp_met,
                            lp_habilidades: lp_hab,
                            mat_metodologia: mat_met,
                            mat_habilidades: mat_hab,
                            cie_metodologia: cie_met,
                            cie_habilidades: cie_hab,
                            hge_metodologia: hge_met,
                            hge_habilidades: hge_hab,

                            adaptacoes_necessarias: formatarDocx(pegarResposta(r, 'Adaptações necessárias')),
                            recursos_apoio: formatarDocx(pegarResposta(r, 'Recursos de apoio')),
                            metas_objetivos_pei: formatarDocx(pegarResposta(r, 'Metas e objetivos')),
                            observacoes_finais: formatarDocx(pegarResposta(r, 'Observações finais'))
                        };
                    })
                });

                return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            };

            const nomeLimpo = alunoSelecionado.replace(/\s+/g, '_');

            // --- LÓGICA DO SELETOR: ZIP OU DOCX ---
            if (respostasDoAluno.length === 1) {
                // Filtro ativo: Baixa 1 DOCX
                const r = respostasDoAluno[0];
                const nomeProf = r['Professor'] ? r['Professor'].split(' ')[0] : 'Prof';
                const blob = criarBlobDocx([r]);
                saveAs(blob, `PEI_${nomeLimpo}_${nomeProf}.docx`);
            } else {
                // Sem filtro: Baixa um ZIP com os DOCX de todos os professores
                const zipFile = new JSZip();
                
                respostasDoAluno.forEach((r, index) => {
                    const blob = criarBlobDocx([r]);
                    const nomeProf = r['Professor'] ? r['Professor'].split(' ')[0] : `Prof_${index}`;
                    zipFile.file(`PEI_${nomeLimpo}_${nomeProf}.docx`, blob);
                });

                const zipBlob = await zipFile.generateAsync({ type: "blob" });
                saveAs(zipBlob, `PEIs_${nomeLimpo}_COMPLETO.zip`);
            }

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
            bind:busca={busca} bind:professorFiltro={professorFiltro} bind:etapaFiltro={etapaFiltro} bind:alunoSelecionado={alunoSelecionado}
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