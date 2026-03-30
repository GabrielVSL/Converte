<script lang="ts">
    import Papa from 'papaparse';
    import * as XLSX from 'xlsx';
    import ModalSincronizacaoPreview from './ModalSincronizacaoPreview.svelte';
    import { getAluno, getProf, getData } from '$lib/utils/excel';

    // Recebendo as props obrigatórias do pai
    let { fecharModalSync, respostasAtuais, atualizarRespostas, SECTIONS, formatarTexto } = $props();

    // --- ESTADOS ---
    let arquivoUpload = $state<File | null>(null);
    let lendo = $state(false);
    let importando = $state(false);
    let registrosExtraidos = $state<any[]>([]);
    
    // Filtros de UI
    let filtroProfessor = $state('');
    let filtroData = $state('');

    // Estado para controlar o modal de preview detalhado
    let registroParaPreview = $state<any>(null);

    // Estado da tabela visual (lista mestre de sincronização)
    let listaSincronizacao = $state<{selecionado: boolean, reg: any}[]>([]);


    // --- REATIVIDADE DE COMPARAÇÃO (Cérebro do Sincronizador) ---
    $effect(() => {
        // Se não leu nada ainda, limpa a lista
        if (registrosExtraidos.length === 0) {
            listaSincronizacao = [];
            return;
        }

        // 1. Filtra as respostas do Excel baseadas nos inputs e na comparação com o banco
        const filtradosDoExcel = registrosExtraidos.filter(reg => {
            const nomeAluno = getAluno(reg);
            const nomeProf = getProf(reg);
            
            // Validação mínima
            if (!nomeAluno || !nomeProf) return false;

            // Filtro de Professor da UI
            if (filtroProfessor && !String(nomeProf).toLowerCase().includes(filtroProfessor.toLowerCase())) return false;
            
            // Filtro de Data da UI (Converte DD/MM/YYYY do excel para Data JS)
            const dataRegRaw = getData(reg);
            if (filtroData && dataRegRaw && dataRegRaw.includes('/')) {
                const partesData = dataRegRaw.split(' ')[0].split('/');
                if (partesData.length === 3) {
                    const dReg = new Date(`${partesData[2]}-${partesData[1]}-${partesData[0]}`);
                    const dFilt = new Date(filtroData);
                    if (dReg < dFilt) return false;
                }
            }

            // --- VERIFICAÇÃO DE DUPLICATAS ---
            const jaExisteNoBanco = respostasAtuais.some(r => 
                String(r['Nome do Aluno']).trim().toLowerCase() === String(nomeAluno).trim().toLowerCase() &&
                String(r['Professor']).trim().toLowerCase() === String(nomeProf).trim().toLowerCase()
            );

            // Só incluímos se NÃO existir no banco
            return !jaExisteNoBanco; 
        });

        // 2. Constrói a lista de sincronização visual, marcando todos como selecionados por padrão
        listaSincronizacao = filtradosDoExcel.map(reg => ({ selecionado: true, reg }));
    });

    // Variáveis Derivadas para UX
    let qtdSelecionados = $derived(listaSincronizacao.filter(item => item.selecionado).length);
    let todosSelecionados = $derived(listaSincronizacao.length > 0 && qtdSelecionados === listaSincronizacao.length);
    
    // Controlar checkbox mestre (marcar/desmarcar todos)
    function toggleTodos(evento: Event) {
        const checkbox = evento.target as HTMLInputElement;
        listaSincronizacao = listaSincronizacao.map(item => ({ ...item, selecionado: checkbox.checked }));
    }


    // --- LEITURA DE ARQUIVO (Excel Inteligente) ---
    async function lerArquivo(evento: Event) {
        const input = evento.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        
        arquivoUpload = input.files[0];
        lendo = true;
        const nomeDoArquivo = arquivoUpload.name.toLowerCase();

        registrosExtraidos = [];

        if (nomeDoArquivo.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonBruto = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];
                    
                    // --- CORREÇÃO: A MÁGICA DA LIMPEZA VOLTOU! ---
                    // O Forms coloca espaços invisíveis (\u00A0) nos títulos. Isso limpa todos eles.
                    registrosExtraidos = jsonBruto.map(linha => {
                        const linhaLimpa: any = {};
                        for (let chave in linha) {
                            linhaLimpa[chave.replace(/\u00A0/g, " ").trim()] = linha[chave];
                        }
                        return linhaLimpa;
                    });
                    
                } catch (err) {
                    alert("Erro ao decodificar o arquivo Excel. Verifique se não está corrompido.");
                } finally {
                    lendo = false;
                }
            };
            reader.readAsArrayBuffer(arquivoUpload);
        } else if (nomeDoArquivo.endsWith('.csv')) {
            Papa.parse(arquivoUpload, {
                header: true, skipEmptyLines: true,
                complete: function(results) { 
                    registrosExtraidos = results.data; 
                    lendo = false; 
                },
                error: function(err) { 
                    alert("Erro ao ler o CSV: " + err.message); 
                    lendo = false; 
                }
            });
        }
    }


    // --- EXECUÇÃO FINAL DA IMPORTAÇÃO ---
    async function realizarImportacao() {
        const itensConfirmados = listaSincronizacao.filter(item => item.selecionado);
        if (itensConfirmados.length === 0) return;
        importando = true;

        const payload = itensConfirmados.map(item => {
            const regRaw = item.reg; 
            const nomeAlunoValido = getAluno(regRaw);
            const nomeProfValido = getProf(regRaw);
            
            if (!nomeAlunoValido || !nomeProfValido) return null;

            const respostasLimpasDoForms = { ...regRaw };
            const colunasMetadadosLixo = ['ID', 'Id', 'id', 'Hora de início', 'Hora de conclusão', 'Email', 'Nome', 'Nome do aluno', 'Nome do(a) Aluno(a)', 'Aluno', 'Professor', 'Carimbo de data/hora', 'Data'];
            
            for (const chaveBruta of Object.keys(respostasLimpasDoForms)) {
                if (colunasMetadadosLixo.some(lixo => lixo.toLowerCase() === chaveBruta.trim().toLowerCase())) {
                    delete respostasLimpasDoForms[chaveBruta];
                }
            }

            return { 
                nome_aluno: nomeAlunoValido, 
                professor: nomeProfValido, 
                respostas: respostasLimpasDoForms 
            };
        }).filter(Boolean);

        if (payload.length === 0) {
            alert("Nenhum dado válido encontrado para importar após a validação.");
            importando = false;
            return;
        }

        try {
            const res = await fetch('/api/respostas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Erro na API ao salvar dados.");

            alert(`${payload.length} registros sincronizados e salvos no banco com sucesso!`);
            atualizarRespostas(); 
            fecharModalSync(); 
        } catch (erro) {
            console.error(erro);
            alert("Ocorreu um erro ao salvar os dados no banco. Verifique o terminal.");
        } finally {
            importando = false;
        }
    }
</script>

<div class="fixed inset-0 z-[100] flex items-center justify-center print:hidden">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick={fecharModalSync}></div>
    
    <div class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeSlideIn border border-slate-100">
        
        <div class="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <div>
                <h2 class="text-xl font-black text-slate-900 tracking-tight">Sincronização Integrada</h2>
                <p class="text-xs text-slate-500 font-medium mt-1">Selecione registros do Excel (.xlsx ou .csv) para importar ao banco Turso</p>
            </div>
            <button onclick={fecharModalSync} class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-slate-50/50">
            <div class="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 hover:border-blue-400 transition-all relative">
                <input 
                    type="file" 
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                    onchange={lerArquivo} 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                {#if lendo}
                    <div class="flex flex-col items-center gap-3">
                        <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p class="text-sm font-bold text-blue-700">Lendo planilha...</p>
                    </div>
                {:else}
                    <div class="text-5xl mb-3">📈</div>
                    <p class="text-sm font-bold text-slate-700">{arquivoUpload ? arquivoUpload.name : 'Clique ou arraste a planilha oficial do Forms (.xlsx ou .csv)'}</p>
                    <p class="text-xs text-slate-400 mt-1.5">O sistema detecta automaticamente o formato e ignora registros já salvos.</p>
                {/if}
            </div>

            {#if registrosExtraidos.length > 0}
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Filtrar por Professor</label>
                        <input bind:value={filtroProfessor} placeholder="Ex: Carlos ou Dirlene" class="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-slate-300" />
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Respostas a partir de</label>
                        <input type="date" bind:value={filtroData} class="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700" />
                    </div>
                </div>

                <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-lg shadow-slate-900/5 transition-all">
                    <div class="max-h-72 overflow-y-auto custom-scrollbar">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                                <tr>
                                    <th class="p-4 w-12 text-center">
                                        <input type="checkbox" checked={todosSelecionados} onchange={toggleTodos} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-slate-300" />
                                    </th>
                                    <th class="p-4 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Nome do Aluno (Clique para Preview)</th>
                                    <th class="p-4 font-extrabold text-slate-600 uppercase tracking-wider text-[10px]">Professor(a)</th>
                                    <th class="p-4 font-extrabold text-slate-600 uppercase tracking-wider text-[10px] text-right">Data de Envio</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                {#each listaSincronizacao as item, i}
                                    {@const nAluno = getAluno(item.reg)}
                                    {@const nProf = getProf(item.reg)}
                                    {@const dEnv = getData(item.reg)}
                                    
                                    <tr class="hover:bg-slate-50/70 transition-colors {item.selecionado ? 'bg-blue-50/30' : ''}">
                                        <td class="p-4 text-center">
                                            <input type="checkbox" bind:checked={item.selecionado} class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-slate-300" />
                                        </td>
                                        <td class="p-4">
                                            <button 
                                                onclick={() => registroParaPreview = item.reg} 
                                                class="text-left group"
                                                title="Ver respostas completas deste aluno"
                                            >
                                                <span class="font-bold text-slate-900 group-hover:text-blue-700 group-hover:underline transition-all">
                                                    {nAluno || 'Nome Não Encontrado'}
                                                </span>
                                                <span class="text-blue-500 opacity-0 group-hover:opacity-100 ml-1 text-xs">🔍</span>
                                            </button>
                                        </td>
                                        <td class="p-4 font-semibold text-slate-700">{nProf || 'Não Informado'}</td>
                                        <td class="p-4 text-xs font-medium text-slate-500 text-right whitespace-nowrap">{dEnv || '-'}</td>
                                    </tr>
                                {:else}
                                    <tr>
                                        <td colspan="4" class="p-12 text-center text-slate-400 font-medium">
                                            <div class="text-3xl mb-3">🤷‍♂️</div>
                                            Nenhuma resposta nova encontrada no Excel para os filtros aplicados.
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="bg-slate-100/50 p-3.5 border-t border-slate-200 flex justify-between items-center shrink-0">
                        <span class="text-xs text-slate-500 font-medium">Total lido do arquivo: <strong>{registrosExtraidos.length}</strong></span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-400 uppercase">A Importar:</span>
                            <span class="text-2xl font-black text-green-600 leading-none">{qtdSelecionados}</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="px-6 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button onclick={fecharModalSync} type="button" class="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                Cancelar
            </button>
            <button onclick={realizarImportacao} disabled={qtdSelecionados === 0 || importando} class="px-8 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2.5">
                {#if importando}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                {:else}
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    <span>Importar {qtdSelecionados} Registros</span>
                {/if}
            </button>
        </div>
    </div>
</div>

{#if registroParaPreview}
    <ModalSincronizacaoPreview 
        reg={registroParaPreview} 
        {SECTIONS} 
        {formatarTexto} 
        fecharPreview={() => registroParaPreview = null} 
    />
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    
    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeSlideIn {
        animation: fadeSlideIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
</style>