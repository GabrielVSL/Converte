import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM respostas ORDER BY data_envio DESC');
        const linhas = result.rows;

        const respostasFormatadas = linhas.map((linha: any) => {
            const respostasDoForms = JSON.parse(linha.dados_json);
            return {
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
        
        if (!body.nome_aluno || !body.professor) {
            return json({ erro: "Dados obrigatórios ausentes" }, { status: 400 });
        }

        await db.execute({
            sql: 'INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)',
            args: [body.nome_aluno, body.professor, JSON.stringify(body.respostas)]
        });

        return json({ sucesso: true });
    } catch (erro) {
        console.error("🚨 ERRO REAL DO TURSO NO POST:", erro);
        return json({ erro: "Falha interna ao salvar no banco" }, { status: 500 });
    }
}