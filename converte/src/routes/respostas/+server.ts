// src/routes/api/respostas/+server.ts
import { json } from '@sveltejs/kit';
import db from '$lib/server/db';

export function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM respostas ORDER BY data_envio DESC');
        const linhas = stmt.all();

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
        return json({ erro: "Falha ao ler dados do banco" }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        
        // Validação de segurança: se não vier o nome do aluno, rejeita.
        if (!body.nome_aluno || !body.professor) {
            return json({ erro: "Dados obrigatórios ausentes" }, { status: 400 });
        }
        
        const stmt = db.prepare('INSERT INTO respostas (nome_aluno, professor, dados_json) VALUES (?, ?, ?)');
        // Salvamos as respostas exatas que vierem no objeto "respostas" do JSON
        stmt.run(body.nome_aluno, body.professor, JSON.stringify(body.respostas));

        return json({ sucesso: true });
    } catch (erro) {
        return json({ erro: "Falha interna ao salvar no banco" }, { status: 500 });
    }
}