const form = document.getElementById('pacienteForm')
const pacienteId = 1  // fixo até implementar o jwt corretamente


fetch(`http://localhost:3000/pacientes`)
    .then(resposta => resposta.json())
    .then(pacientes => {
        
        const paciente = pacientes.find(p => p.id === pacienteId)

        
        if (paciente) {
            document.getElementById('name').value = paciente.name || ''
            document.getElementById('cpf').value = paciente.cpf || ''
            document.getElementById('birthDate').value = paciente.birthDate || ''
            document.getElementById('sex').value = paciente.sex || ''
            document.getElementById('phone').value = paciente.phone || ''
            document.getElementById('weight').value = paciente.weight || ''
            document.getElementById('symptoms').value = paciente.symptoms || ''
        }
    })


form.addEventListener('submit', (evento) => {
    evento.preventDefault()

    const dados = {
        name: document.getElementById('name').value,
        cpf: document.getElementById('cpf').value,
        birthDate: document.getElementById('birthDate').value,
        sex: document.getElementById('sex').value,
        phone: document.getElementById('phone').value,
        weight: document.getElementById('weight').value,
        symptoms: document.getElementById('symptoms').value
    }

    fetch(`http://localhost:3000/pacientes/${pacienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(resposta => resposta.json())
        .then(() => {
            alert('Dados salvos!')
        })
})