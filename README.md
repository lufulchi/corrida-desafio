# corrida do desafio

Placar do Super Team Creator Challenge do the news.

- De hora em hora, o GitHub Actions puxa do Meta as inscrições de cada anúncio do desafio e monta o `challenge-race.html`.
- Uma rotina do Claude baixa esse arquivo e republica a página do desafio.

O repositório é público para a rotina conseguir baixar o arquivo sem login. Ele não guarda credenciais: o token do Meta fica nos secrets do repositório.
