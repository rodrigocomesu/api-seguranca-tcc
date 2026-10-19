const form = document.getElementById('loginForm')

form.addEventListener('submit', (evento) => {
    evento.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(resposta => resposta.json()) //transforma em json
    .then(dados => {
        if (!dados.token) {                                          
            alert(dados.mensagem || 'Não foi possível fazer login')  
            return                                                   
        }                                                            

        localStorage.setItem('token', dados.token)

        if (dados.role === 'admin') {
            window.location.href = 'admin.html'
        } else {
            window.location.href = 'paciente.html'
        }
    })
    .catch(() => alert('Erro ao conectar com o servidor'))          
})