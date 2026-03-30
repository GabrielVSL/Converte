<script lang="ts">
    // Recebendo as variáveis e funções necessárias do ficheiro pai
    let { 
        alunoSelecionado, 
        respostasDoAluno, 
        SECTIONS, 
        formatarTexto, 
        abrirModalEdicao, 
        excluirRegistro 
    } = $props();
</script>

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
                                    
                                    <div class="flex items-center gap-4 print:hidden">
                                        <span class="text-[10px] font-mono font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg tracking-tighter shadow-sm">
                                            REF-ID: {i+1}
                                        </span>
                                        <button onclick={() => abrirModalEdicao(reg)} title="Editar este registro" class="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.12l-2.83.893a.75.75 0 01-.95-.95l.892-2.83a4.5 4.5 0 011.12-1.89l13.89-13.89z" /></svg>
                                            <span>Editar</span>
                                        </button>
                                        <button onclick={() => excluirRegistro(reg.id)} title="Excluir este registro permanentemente" class="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm">
                                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            <span>Excluir</span>
                                        </button>
                                    </div>
                                </div>

                                <div class="p-6 print:p-0 print:pt-4">
                                    {#each Object.entries(SECTIONS) as [nomeSecao, camposDaSecao]}
                                        {#if (camposDaSecao as string[]).some(campo => reg[campo] && String(reg[campo]).trim() !== '')}
                                            <div class="mb-8 last:mb-0">
                                                <h5 class="text-xs font-bold uppercase text-blue-600 tracking-widest mb-4 mt-2 border-b border-blue-100 pb-1.5 print:text-black print:border-black">
                                                    {nomeSecao}
                                                </h5>
                                                
                                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-1 print:gap-4">
                                                    {#each (camposDaSecao as string[]) as campo}
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

<style>
    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeSlideIn {
        animation: fadeSlideIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }

    @keyframes cardIn {
        0% { opacity: 0; transform: translateY(12px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-cardIn {
        animation: cardIn 350ms ease-out forwards;
    }

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
</style>