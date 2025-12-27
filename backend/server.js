// Importa os módulos necessários
const express = require('express'); // Framework web Express.js
const sqlite3 = require('sqlite3').verbose(); // Biblioteca para SQLite
const cors = require('cors'); // NOVO: Módulo para habilitar CORS

// Cria uma instância do aplicativo Express
const app = express();

// Define a porta em que o servidor irá escutar
const PORT = process.env.PORT || 3000;

// NOVO: Middleware para habilitar CORS
// Isso permite que requisições de outras origens (como o seu frontend) acessem este backend.
// Para desenvolvimento, 'origin: '*' ' permite qualquer origem. Em produção, você limitaria a domínios específicos.
app.use(cors({
    origin: '*', // Permitir requisições de qualquer origem durante o desenvolvimento
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));


// Middleware para processar requisições JSON (importante para receber dados do frontend)
app.use(express.json());

// --- Configuração do Banco de Dados SQLite ---

// Conecta ou cria o banco de dados 'database.sqlite'
// O banco de dados é armazenado em um arquivo dentro da pasta 'backend'.
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Cria a tabela 'atletas' se ela não existir
        db.run(`
            CREATE TABLE IF NOT EXISTS atletas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                sexo TEXT NOT NULL,
                idade INTEGER NOT NULL,
                peso REAL NOT NULL,
                altura INTEGER NOT NULL,
                faixa TEXT NOT NULL
            );
        `, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela atletas:', err.message);
            } else {
                console.log('Tabela atletas verificada/criada com sucesso.');
                // Exemplo: Insere alguns dados de teste se a tabela estiver vazia
                db.get("SELECT COUNT(*) as count FROM atletas", (err, row) => {
                    if (err) {
                        console.error('Erro ao contar atletas:', err.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log("Inserindo dados de exemplo na tabela atletas...");
                        db.run("INSERT INTO atletas (nome, sexo, idade, peso, altura, faixa) VALUES (?, ?, ?, ?, ?, ?)",
                            ["Weder Teste", "Masculino", 25, 75.5, 175, "Azul"], function(err) { // Usamos 'function' para ter acesso ao 'this.lastID'
                                if (err) { console.error('Erro ao inserir atleta de teste:', err.message); }
                                else { console.log(`Atleta de teste 1 inserido com ID: ${this.lastID}`); }
                            });
                        db.run("INSERT INTO atletas (nome, sexo, idade, peso, altura, faixa) VALUES (?, ?, ?, ?, ?, ?)",
                            ["Maria Teste", "Feminino", 30, 60.2, 160, "Branca"], function(err) {
                                if (err) { console.error('Erro ao inserir atleta de teste:', err.message); }
                                else { console.log(`Atleta de teste 2 inserido com ID: ${this.lastID}`); }
                            });
                        db.run("INSERT INTO atletas (nome, sexo, idade, peso, altura, faixa) VALUES (?, ?, ?, ?, ?, ?)",
                            ["João Teste", "Masculino", 15, 62.0, 168, "Verde"], function(err) {
                                if (err) { console.error('Erro ao inserir atleta de teste:', err.message); }
                                else { console.log(`Atleta de teste 3 inserido com ID: ${this.lastID}`); }
                            });
                    }
                });
            }
        });
    }
});

// --- ROTAS (Endpoints da API) ---

// Rota raiz (para teste básico)
app.get('/', (req, res) => {
    res.send('Bem-vindo ao backend do Gerador de Chaveamento de Jiu-Jitsu com SQLite!');
});

// 1. Rota para OBTER TODOS os atletas (READ all)
app.get('/atletas', (req, res) => {
    const sql = "SELECT * FROM atletas";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ "error": err.message }); // 500 Internal Server Error
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// 2. Rota para OBTER UM ÚNICO atleta pelo ID (READ one)
app.get('/atletas/:id', (req, res) => {
    const { id } = req.params; // Captura o ID da URL
    const sql = "SELECT * FROM atletas WHERE id = ?";
    const params = [id]; // Os parâmetros são passados como um array
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ "message": "Atleta não encontrado." }); // 404 Not Found
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// 3. Rota para CRIAR um novo atleta (CREATE)
app.post('/atletas', (req, res) => {
    const { nome, sexo, idade, peso, altura, faixa } = req.body; // Pega os dados do corpo da requisição

    // Validação básica dos dados
    if (!nome || !sexo || !idade || !peso || !altura || !faixa) {
        res.status(400).json({ "error": "Todos os campos são obrigatórios (nome, sexo, idade, peso, altura, faixa)." });
        return;
    }

    const sql = 'INSERT INTO atletas (nome, sexo, idade, peso, altura, faixa) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [nome, sexo, idade, peso, altura, faixa];

    db.run(sql, params, function(err) { // Usamos 'function' para ter acesso ao 'this.lastID'
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({ // 201 Created
            "message": "success",
            "data": {
                id: this.lastID, // Retorna o ID do novo atleta inserido
                nome, sexo, idade, peso, altura, faixa
            }
        });
    });
});

// 4. Rota para ATUALIZAR um atleta existente (UPDATE)
app.put('/atletas/:id', (req, res) => {
    const { id } = req.params; // ID do atleta a ser atualizado
    const { nome, sexo, idade, peso, altura, faixa } = req.body; // Novos dados

    // Validação básica
    if (!nome || !sexo || !idade || !peso || !altura || !faixa) {
        res.status(400).json({ "error": "Todos os campos são obrigatórios para atualização (nome, sexo, idade, peso, altura, faixa)." });
        return;
    }

    const sql = `UPDATE atletas SET
                    nome = ?,
                    sexo = ?,
                    idade = ?,
                    peso = ?,
                    altura = ?,
                    faixa = ?
                 WHERE id = ?`;
    const params = [nome, sexo, idade, peso, altura, faixa, id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (this.changes === 0) { // 'this.changes' indica o número de linhas afetadas
            res.status(404).json({ "message": "Atleta não encontrado para atualização." });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes,
            "data": { id, nome, sexo, idade, peso, altura, faixa }
        });
    });
});

// 5. Rota para EXCLUIR um atleta (DELETE)
app.delete('/atletas/:id', (req, res) => {
    const { id } = req.params; // ID do atleta a ser excluído

    const sql = 'DELETE FROM atletas WHERE id = ?';
    const params = [id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ "message": "Atleta não encontrado para exclusão." });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes,
            "id": id
        });
    });
});


// Inicia o servidor e o faz escutar na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse a raiz: http://localhost:${PORT}`);
    console.log(`API Atletas: http://localhost:${PORT}/atletas`);
});