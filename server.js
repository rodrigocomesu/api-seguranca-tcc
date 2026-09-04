const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')
const bcrypt = require('bcrypt')
const db = new Database('banco.db')





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

app.use(cors()) //middleware que autoriza o frontend de outra origem acessar o backend

app.use(express.json()) //middleware converte o corpo das requisições em JSON


   // rota pra olhar as contas do banco de dados depois apagar.
// app.get('/debug/users', (req, res) => {
//     const users = db.prepare('SELECT * FROM users').all()
//     res.json(users)
// })

//sempre no final da pagina
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
}) 