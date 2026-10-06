const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const { z } = require('zod')
const cors = require('cors')
const Database = require('better-sqlite3')
const bcrypt = require('bcrypt')
const db = new Database('banco.db')
const jwt = require('jsonwebtoken')




db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT,
    role TEXT)`)


db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    cpf TEXT,
    birthDate TEXT,
    sex TEXT,
    phone TEXT,
    symptoms TEXT,
    weight REAL)`);


//Criando as 10 contas se estiver vazio

const totalUsers = db.prepare('SELECT COUNT(*) AS total FROM users').get()

if (totalUsers.total === 0) {
    const inserirUser = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)')

    inserirUser.run('admin@email.com', bcrypt.hashSync('admin123', 10), 'admin')

    inserirUser.run('paciente1@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente2@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente3@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente4@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente5@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente6@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente7@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente8@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
    inserirUser.run('paciente9@email.com', bcrypt.hashSync('senha123', 10), 'paciente')
}
const app = express()

app.use(cors({ origin: 'http://127.0.0.1:5500' })) //middleware permite requisicoes apenas do frontend

app.use(express.json()) //middleware converte o corpo das requisições em JSON

app.use(helmet()) //adiciona cabecalhos http na seguranca 


// limita tentativas de login
const limitadorLogin = rateLimit({
    windowMs: 15 * 60 * 1000,  // janela de 15 minutos
    limit: 5,                   // maximo de 5 tentativas por IP
    message: { mensagem: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
})

// regras de validacao dos dados do paciente
const pacienteSchema = z.object({
    name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 digitos numericos'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
    sex: z.enum(['male', 'female', 'other'], { message: 'Sexo invalido' }),
    phone: z.string().min(1, 'Telefone obrigatorio'),
    symptoms: z.string().max(1000, 'Sintomas muito longos'),
    weight: z.number().positive('Peso deve ser maior que zero')
})

function verificarToken(req, res, next) {
   
    const authHeader = req.headers.authorization

   // sem cabeçalho de token, bloqueia
    if (!authHeader) {
        return res.status(401).json({ mensagem: 'Token nao fornecido' })
    }

    // separa o token
    const token = authHeader.split(' ')[1]

    try {
        const dados = jwt.verify(token, 'chave_secreta')
        req.usuario = dados  
        next()  
    } catch (erro) {
        return res.status(401).json({ mensagem: 'Token invalido' })
    }
}


app.post('/login', limitadorLogin, (req, res) => {
    const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(req.body.email)

    if (!user) {
        return res.status(401).json({ mensagem: 'Login ou senha incorretas' })
    }

    const senhaCorreta = bcrypt.compareSync(req.body.password, user.password)

    if (!senhaCorreta) {
        return res.status(401).json({ mensagem: 'Login ou senha incorretas' })
    }

    const token = jwt.sign(
        {id: user.id, role: user.role}, //dados payload que vao no token
        'chave_secreta', //chave secreta pra assinar
        {expiresIn: '1h'} //tempo de expiração
    )
    return res.status(200).json({ token: token, role: user.role })
})

//login vulneravel
app.post('/login-vulneravel', (req, res) => {
    const query = `SELECT * FROM users WHERE email = '${req.body.email}' AND password = '${req.body.password}'`
    const user = db.prepare(query).get()

    if (user) {
        return res.status(200).json({ mensagem: 'Login realizado', email: user.email })
    }
    return res.status(401).json({ mensagem: 'Login ou senha incorretas' })
})


//rotas dos pacientes

app.post('/pacientes', verificarToken, (req, res) => {
    const validacao = pacienteSchema.safeParse(req.body)
    if (!validacao.success) {
        return res.status(400).json({ erros: validacao.error.issues })
    }
    const stmt = db.prepare(`INSERT INTO patients (user_id, name, cpf, birthDate, sex, phone, symptoms, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)

    // user_id vem do token (usuario logado)
    const resultado = stmt.run(req.usuario.id, req.body.name, req.body.cpf, req.body.birthDate, req.body.sex, req.body.phone, req.body.symptoms, req.body.weight)

    res.json({
        id: resultado.lastInsertRowid,
        user_id: req.usuario.id,
        ...req.body
    })
})



app.get('/pacientes', verificarToken, (req, res) => {
    // se for admin, retorna todos
    if (req.usuario.role === 'admin') {
        const pacientes = db.prepare(`SELECT * FROM patients`).all()
        return res.json(pacientes)
    }

    // se for paciente, retorna só os dele filtra pelo user_id do token
    const pacientes = db.prepare(`SELECT * FROM patients WHERE user_id = ?`).all(req.usuario.id)
    res.json(pacientes)
})

app.put('/pacientes/:id', verificarToken, (req, res) => {
    const paciente = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(req.params.id)

    if (!paciente) {
        return res.status(404).json({ mensagem: 'Paciente nao encontrado' })
    }

    // se não é admin nem o dono, bloqueia
    if (req.usuario.role !== 'admin' && paciente.user_id !== req.usuario.id) {
        return res.status(403).json({ mensagem: 'Acesso negado' })
    }

    const stmt = db.prepare(`UPDATE patients SET name = ?, cpf = ?, birthDate = ?, sex = ?, phone = ?, symptoms = ?, weight = ? WHERE id = ?`)
    stmt.run(req.body.name, req.body.cpf, req.body.birthDate, req.body.sex, req.body.phone, req.body.symptoms, req.body.weight, req.params.id)

    res.json({ id: req.params.id, ...req.body })
})


app.delete('/pacientes/:id', verificarToken, (req, res) => {
    const paciente = db.prepare(`SELECT * FROM patients WHERE id = ?`).get(req.params.id)

    if (!paciente) {
        return res.status(404).json({ mensagem: 'Paciente nao encontrado' })
    }

    // se não é admin E não é o dono, bloqueia
    if (req.usuario.role !== 'admin' && paciente.user_id !== req.usuario.id) {
        return res.status(403).json({ mensagem: 'Acesso negado' })
    }

    db.prepare(`DELETE FROM patients WHERE id = ?`).run(req.params.id)
    res.json({ mensagem: 'Paciente removido' })
})



//sempre no final da pagina
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
}) 