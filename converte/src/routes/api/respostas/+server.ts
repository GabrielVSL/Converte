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
        
        // --- NOVA LÓGICA DE SINCRONIZAÇÃO EM LOTE (Array) ---
        // Se o corpo da requisição for uma Lista (vindo do nosso Modal Sync)
        if (Array.isArray(body)) {
            let inseridos = 0;
            for (const registro of body) {
                // Validação rigorosa: só insere se tiver os nomes
                if (registro.nome_aluno && registro.professor) {
                    await db.execute({
                        sql: 'INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)',
                        args: [registro.nome_aluno, registro.professor, JSON.stringify(registro.respostas)]
                    });
                    inseridos++;
                }
            }
            return json({ sucesso: true, inseridos });
        }

        // --- LÓGICA NORMAL DE 1 REGISTRO (vindo do Make.com/Forms) ---
        if (!body.nome_aluno || !body.professor) {
            return json({ erro: "Dados obrigatórios ausentes" }, { status: 400 });
        }

        await db.execute({
            sql: 'INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)',
            args: [body.nome_aluno, body.professor, JSON.stringify(body.respostas)]
        });

        return json({ sucesso: true });
    } catch (erro) {
        // Log para você ver no terminal se der erro
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
        
        return json({ sucesso: true, mensagem: 'Registo excluído com sucesso' });
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

        // Separa o ID e recria o objeto JSON de respostas (removendo o id da payload do JSON interno)
        const { id, "Nome do Aluno": nome_aluno, "Professor": professor, ...respostasDoForms } = body;

        // Atualiza no banco Turso
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