const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')

const db = new Database('banco.db')


const app = express()


app.use(cors()) //middleware que autoriza o frontend de outra origem acessar o backend

app.use(express.json()) //middleware converte o corpo das requisições em JSON



//sempre no final da pagina
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
}) 