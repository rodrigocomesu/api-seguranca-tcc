
const tabela = document.getElementById('patientsTableBody')


function carregarPacientes() {
    fetch('http://localhost:3000/pacientes')
        .then(resposta => resposta.json())
        .then(pacientes => {
            tabela.innerHTML = ''  // limpa a tabela antes de preencher

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

// deleta um paciente
function deletarPaciente(id) {
    fetch(`http://localhost:3000/pacientes/${id}`, {
        method: 'DELETE'
    })
        .then(resposta => resposta.json())
        .then(() => {
            carregarPacientes()  // recarrega a tabela
        })
}

// carrega a tabela assim que a página abre
carregarPacientes()