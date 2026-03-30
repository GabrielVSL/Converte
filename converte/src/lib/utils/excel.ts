// --- FUNÇÕES "ANTI-FALHAS" PARA LER O EXCEL ---
// (Garante que encontramos os nomes mesmo com espaços invisíveis do Forms)

export function getValorResiliente(obj: any, chavesPossiveis: string[]) {
    if (!obj) return '';
    const chavesObj = Object.keys(obj);
    for (const cp of chavesPossiveis) {
        const encontrada = chavesObj.find(k => k.trim().toLowerCase() === cp.toLowerCase());
        if (encontrada) return obj[encontrada];
    }
    return '';
}

export function getAluno(reg: any) { 
    return getValorResiliente(reg, ['Nome do aluno', 'Nome do(a) Aluno(a)', 'Aluno']); 
}

export function getProf(reg: any) { 
    return getValorResiliente(reg, ['Nome', 'Professor']); 
}

export function getData(reg: any) { 
    return getValorResiliente(reg, ['Hora de conclusão', 'Carimbo de data/hora', 'Data']); 
}