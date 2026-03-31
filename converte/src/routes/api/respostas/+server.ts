import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM respostas ORDER BY data_envio DESC');
        const linhas = result.rows;

        const respostasFormatadas = linhas.map((linha: any) => {
            const respostasDoForms = JSON.parse(linha.dados_json);
            return {
                id: linha.id,
                "Nome do Aluno": linha.nome_aluno,
                "Professor": linha.professor,
                ...respostasDoForms
            };
        });

        return json(respostasFormatadas);
    } catch (erro) {
        console.error("🚨 ERRO NO GET:", erro);
        return json({ erro: "Falha ao ler dados do banco" }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        
        // --- FUNÇÃO DE HIGIENIZAÇÃO DE DADOS (O SEGURANÇA DA BALADA) ---
        // Essa função pega o objeto cru do Forms e limpa chaves e acha os nomes reais
        function limparESepararRegistro(registroSujo: any) {
            let nomeRealAluno = "Nome Não Informado";
            let nomeRealProf = "Professor Não Informado";
            let respostasLimpas: any = {};

            // 1. Vasculha todas as chaves que vieram do n8n/Forms
            const chaves = Object.keys(registroSujo.respostas || registroSujo);

            for (const chave of chaves) {
                // Remove espaços invisíveis (\u00A0) e espaços nas pontas
                const chaveLimpa = chave.replace(/[\u00A0\u200B]/g, " ").trim();
                const valor = (registroSujo.respostas || registroSujo)[chave];

                // 2. Caça a identidade real (Case insensitive)
                if (chaveLimpa.toLowerCase().includes('etapa')) {
                    respostasLimpas['Etapa'] = valor;
                } else if (chaveLimpa.toLowerCase() === 'nome do aluno') {
                    nomeRealAluno = valor;
                } else if (chaveLimpa.toLowerCase() === 'nome') {
                    nomeRealProf = valor;
                } else if (chaveLimpa.toLowerCase() !== 'email' && chaveLimpa.toLowerCase() !== 'professor') {
                    // 3. Salva o resto das perguntas com a chave limpa (sem espaços no final)
                    respostasLimpas[chaveLimpa] = valor;
                }
            }

            // Fallbacks (caso o nome não venha na chave limpa, tenta nas chaves enviadas originalmente)
            if (nomeRealAluno === "Nome Não Informado" && registroSujo.nome_aluno && registroSujo.nome_aluno !== "Sem Nome") {
                nomeRealAluno = registroSujo.nome_aluno;
            }
            // Se o nome do professor não foi achado na coluna "Nome", usa o email que veio em "Professor"
            if (nomeRealProf === "Professor Não Informado" && registroSujo.professor) {
                nomeRealProf = registroSujo.professor;
            }

            return { nome_aluno: nomeRealAluno, professor: nomeRealProf, respostas: respostasLimpas };
        }

        // --- LÓGICA DE SINCRONIZAÇÃO EM LOTE (Array do n8n ou Modal Sync) ---
        if (Array.isArray(body)) {
            let inseridos = 0;
            for (const registroCru of body) {
                // Passa o registro pelo nosso filtro
                const registroLimpo = limparESepararRegistro(registroCru);

                if (registroLimpo.nome_aluno && registroLimpo.professor) {
                    await db.execute({
                        sql: 'INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)',
                        args: [registroLimpo.nome_aluno, registroLimpo.professor, JSON.stringify(registroLimpo.respostas)]
                    });
                    inseridos++;
                }
            }
            return json({ sucesso: true, inseridos });
        }

        // --- LÓGICA DE 1 REGISTRO (Fallback) ---
        const registroUnicoLimpo = limparESepararRegistro(body);
        
        if (!registroUnicoLimpo.nome_aluno || !registroUnicoLimpo.professor) {
            return json({ erro: "Dados obrigatórios ausentes" }, { status: 400 });
        }

        await db.execute({
            sql: 'INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)',
            args: [registroUnicoLimpo.nome_aluno, registroUnicoLimpo.professor, JSON.stringify(registroUnicoLimpo.respostas)]
        });

        return json({ sucesso: true });
        
    } catch (erro) {
        console.error("🚨 ERRO CRÍTICO NO POST:", erro);
        return json({ erro: "Falha interna ao salvar no banco" }, { status: 500 });
    }
}

export async function DELETE({ url }) {
    const id = url.searchParams.get('id');

    if (!id) {
        return json({ erro: 'ID não fornecido' }, { status: 400 });
    }

    try {
        await db.execute({
            sql: 'DELETE FROM respostas WHERE id = ?',
            args: [id]
        });
        
        return json({ sucesso: true, mensagem: 'Registro excluído com sucesso' });
    } catch (erro) {
        console.error("Erro no BD ao excluir:", erro);
        return json({ erro: 'Erro interno ao excluir no banco' }, { status: 500 });
    }
}

export async function PUT({ request }) {
    try {
        const body = await request.json();
        
        if (!body.id) {
            return json({ erro: "ID do registro ausente" }, { status: 400 });
        }

        const { id, "Nome do Aluno": nome_aluno, "Professor": professor, ...respostasDoForms } = body;

        await db.execute({
            sql: 'UPDATE respostas SET nome_aluno = ?, professor = ?, dados_json = ? WHERE id = ?',
            args: [nome_aluno, professor, JSON.stringify(respostasDoForms), id]
        });

        return json({ sucesso: true, mensagem: 'Registro atualizado com sucesso' });
    } catch (erro) {
        console.error("Erro no BD ao atualizar:", erro);
        return json({ erro: 'Erro interno ao atualizar no banco' }, { status: 500 });
    }
}