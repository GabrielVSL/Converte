export const SECTIONS = {
    'Identificação': ['Componente(s) Curricular(es)', 'Modalidade de Ensino', 'Necessidades Relacionadas'],
    'Perfil do Aluno': ['Autonomia nas Rotinas', 'Comunicação Eficaz', 'Relação com Colegas e Professores', 'Comportamento e Interação', 'Comunicação', 'Limites e Agressividade'],
    'Currículo PEI': ['Área do Currículo PEI', 'Metodologia (Português)', 'Habilidades Adquiridas (Português)', 'Metodologia (Matemática)', 'Habilidades Adquiridas (Matemática)', 'Metodologia (Ciências)', 'Habilidades Adquiridas (Ciências)', 'Metodologia (Hist. Geo.)', 'Habilidades Adquiridas (Hist. Geo.)'],
    'Plano e Metas': ['Adaptações Necessárias', 'Recursos de Apoio', 'Metas e Objetivos do PEI', 'Observações Finais']
};

// --- LÓGICA DE NEGÓCIO ---
export function formatarTexto(texto: any): string {
    if (!texto) return "";

    // 1. Lida com Arrays do JSON
    if (typeof texto === 'string' && texto.startsWith('[') && texto.endsWith(']')) {
        try { 
            const array = JSON.parse(texto);
            if (Array.isArray(array)) {
                return array.length > 1 ? '• ' + array.join('\n• ') : array[0];
            }
        } catch { /* Ignora erros de parse */ }
    }

    // 2. Lida com os pontos e vírgulas do Excel (Padrão do MS Forms)
    if (typeof texto === 'string' && texto.includes(';')) {
        const itens = texto.split(';')
            .map(item => item.trim())
            .filter(item => item.length > 0);
            
        if (itens.length > 1) {
            return '• ' + itens.join('\n• ');
        } else if (itens.length === 1) {
            return itens[0];
        }
    }

    // 3. Texto normal
    return String(texto).trim();
}