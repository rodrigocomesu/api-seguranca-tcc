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

                linha.innerHTML = `
                    <td>${paciente.name || ''}</td>
                    <td>${paciente.cpf || ''}</td>
                    <td>${paciente.birthDate || ''}</td>
                    <td>${paciente.phone || ''}</td>
                    <td>
                        <button onclick="deletarPaciente(${paciente.id})">Deletar</button>
                    </td>
                `

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