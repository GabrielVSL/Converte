import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import JSZip from 'jszip';
import pkg from 'file-saver';
const { saveAs } = pkg;
import { formatarTexto } from './formatadores';

// --- Função Auxiliar de Busca Blindada ---
function pegarResposta(r: any, palavraChave: string) {
    let chave = Object.keys(r).find(k => k.trim().toLowerCase() === palavraChave.trim().toLowerCase());
    if (!chave) chave = Object.keys(r).find(k => k.toLowerCase().includes(palavraChave.toLowerCase()));
    return chave ? r[chave] : null;
}

// --- Formatação com Mensagem Profissional para Vazios ---
function formatarDocx(valor: any, textoVazio = "Não avaliado neste componente / Não se aplica") {
    const txt = formatarTexto(valor);
    return (txt && txt !== '-' && txt !== 'undefined') ? txt : textoVazio;
}

// --- Função Principal Exportada ---
export async function gerarFicheiroDOCX(alunoSelecionado: string, respostasDoAluno: any[]) {
    if (!alunoSelecionado || respostasDoAluno.length === 0) return false;

    try {
        const response = await fetch('/template_pei.docx');
        if (!response.ok) throw new Error("Template não encontrado na pasta static");
        const arrayBuffer = await response.arrayBuffer();

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

                    let lp_met = naoAplica, lp_hab = naoAplica;
                    let mat_met = naoAplica, mat_hab = naoAplica;
                    let cie_met = naoAplica, cie_hab = naoAplica;
                    let hge_met = naoAplica, hge_hab = naoAplica;

                    if (componente.includes('portugu') || componente.includes('letra')) {
                        lp_met = formatarDocx(metodologiaForm, "Não preenchido");
                        lp_hab = formatarDocx(habilidadesForm, "Não preenchido");
                    } else if (componente.includes('matem')) {
                        mat_met = formatarDocx(metodologiaForm, "Não preenchido");
                        mat_hab = formatarDocx(habilidadesForm, "Não preenchido");
                    } else if (componente.includes('ciência') || componente.includes('natureza') || componente.includes('biologia')) {
                        cie_met = formatarDocx(metodologiaForm, "Não preenchido");
                        cie_hab = formatarDocx(habilidadesForm, "Não preenchido");
                    } else if (componente.includes('hist') || componente.includes('geograf') || componente.includes('humanas')) {
                        hge_met = formatarDocx(metodologiaForm, "Não preenchido");
                        hge_hab = formatarDocx(habilidadesForm, "Não preenchido");
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

        if (respostasDoAluno.length === 1) {
            const r = respostasDoAluno[0];
            const nomeProf = r['Professor'] ? r['Professor'].split(' ')[0] : 'Prof';
            const blob = criarBlobDocx([r]);
            saveAs(blob, `PEI_${nomeLimpo}_${nomeProf}.docx`);
        } else {
            const zipFile = new JSZip();
            respostasDoAluno.forEach((r, index) => {
                const blob = criarBlobDocx([r]);
                const nomeProf = r['Professor'] ? r['Professor'].split(' ')[0] : `Prof_${index}`;
                zipFile.file(`PEI_${nomeLimpo}_${nomeProf}.docx`, blob);
            });
            const zipBlob = await zipFile.generateAsync({ type: "blob" });
            saveAs(zipBlob, `PEIs_${nomeLimpo}_COMPLETO.zip`);
        }
        
        return true; // Sucesso
    } catch (erro) {
        console.error("Erro ao gerar DOCX:", erro);
        return false; // Erro
    }
}