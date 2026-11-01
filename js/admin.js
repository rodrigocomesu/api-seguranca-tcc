const tabela = document.getElementById('patientsTableBody')
const token = localStorage.getItem('token')  // pega o token guardado no login

function carregarPacientes() {
    fetch('http://localhost:3000/pacientes', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(resposta => resposta.json())
        .then(pacientes => {
            tabela.innerHTML = ''

            pacientes.forEach(paciente => {
                const linha = document.createElement('tr')

                // cada valor entra como texto, sem ser interpretado como HTML
                const campos = [paciente.name, paciente.cpf, paciente.birthDate, paciente.phone,
                                paciente.sex, paciente.weight, paciente.symptoms]
                campos.forEach(valor => {
                    const celula = document.createElement('td')
                    celula.textContent = valor ?? ''
                    linha.appendChild(celula)
                })

                const celulaBotao = document.createElement('td')
                const botao = document.createElement('button')
                botao.textContent = 'Deletar'
                botao.addEventListener('click', () => deletarPaciente(paciente.id))
                celulaBotao.appendChild(botao)
                linha.appendChild(celulaBotao)

                tabela.appendChild(linha)
            })
        })
}

function deletarPaciente(id) {
    fetch(`http://localhost:3000/pacientes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(resposta => resposta.json())
        .then(() => {
            carregarPacientes()
        })
}

carregarPacientes()