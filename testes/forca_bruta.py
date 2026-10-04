import requests

for i in range(1, 21):
    resposta = requests.post(
        'http://localhost:3000/login',
        json={'email': 'admin@email.com', 'password': f'senhaerrada{i}'}
    )
    print(f'Tentativa {i}: status {resposta.status_code}')