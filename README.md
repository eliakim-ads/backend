# DevFlix API

API REST acadêmica para consultar categorias, cursos e aulas de um catálogo de tecnologia. O projeto é a base do backend que um frontend ou cliente HTTP, como o Bruno, pode consumir.

## 1. Funcionalidades

- Listar categorias armazenadas no PostgreSQL em ordem crescente de ID.
- Verificar a conexão da API com o banco de dados em `GET /health`.
- Listar cursos por título e consultar um curso pelo ID, incluindo a categoria e as aulas em ordem de posição.
- Popular o catálogo de exemplo com o seed do Prisma e cadastrar outras categorias pelo Prisma Studio.

## 2. Tecnologias utilizadas

- Node.js, NestJS e TypeScript para a API.
- PostgreSQL 17 para persistência e Prisma ORM 7 para consultas e migrações.
- Docker e Docker Compose para executar o PostgreSQL localmente.
- Jest e Supertest para testes e Bruno para requisições manuais.

## 3. Organização do projeto

```text
src/
├── categories/           # Controller, service e módulo de categorias
├── courses/              # Listagem e consulta de cursos com suas aulas
├── health/               # Verificação da conexão com o banco
├── prisma/               # Integração do Prisma com o NestJS
├── generated/prisma/     # Cliente Prisma gerado a partir do schema
└── main.ts               # Inicialização da API
prisma/
├── migrations/           # Histórico de migrações do PostgreSQL
├── schema.prisma         # Modelo de dados
└── seed.ts               # Categorias, cursos e aulas de exemplo
API Devflix/              # Coleção de requisições do Bruno
test/                     # Teste de ponta a ponta
compose.yaml              # PostgreSQL, verificação de saúde e volume
.env.example              # Configuração local de exemplo
```

## 4. Pré-requisitos na outra máquina

- Node.js 24 e npm.
- Git, se você for clonar o repositório.
- Docker Desktop no Windows ou macOS. No Linux, Docker Engine em execução com o plugin Docker Compose.
- Portas locais `5432` para o PostgreSQL e `3000` para a API.

Abra o Docker Desktop e aguarde a inicialização. Os comandos abaixo verificam se o Docker Compose está disponível e se o Docker responde.

```sh
docker compose version
docker info
```

O Docker Compose inicia o PostgreSQL. A API roda com Node.js na própria máquina.

## 5. Instalação

Clone o repositório e instale as dependências. Se você copiou a pasta do projeto, execute apenas `npm ci` na pasta que contém `package.json` e `compose.yaml`. Antes de clonar na outra máquina, confirme que a branch escolhida já contém os arquivos de configuração descritos neste README.

```sh
git clone https://github.com/eliakim-ads/backend.git
cd backend
npm ci
```

## 6. Variáveis de ambiente

Na pasta do projeto, copie `.env.example` para `.env`. Se já existir um `.env`, confira se o endereço do banco corresponde ao serviço em `compose.yaml`.

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux ou macOS:

```sh
cp .env.example .env
```

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão do Prisma com o banco local em `127.0.0.1:5432`. O arquivo de exemplo já corresponde ao Compose. |
| `PORT` | Porta HTTP da API. É opcional e o padrão é `3000`. |

As credenciais de exemplo são para desenvolvimento local. O arquivo `.env` está no `.gitignore`.

## 7. Executar o DevFlix

### Subir o PostgreSQL

```sh
docker compose up -d --wait
docker compose ps
```

Na primeira execução, o Docker baixa a imagem do PostgreSQL 17. O serviço `postgres` deve aparecer como saudável (`healthy`). Para investigar uma falha ao subir o banco, consulte `docker compose logs postgres`.

### Aplicar as migrações e popular o catálogo de exemplo

```sh
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

As migrações criam `Category`, `Course` e `Lesson`. Em um banco da etapa anterior, apenas a migração pendente é aplicada. O seed cadastra três categorias, três cursos e quatro aulas de exemplo. Ao repetir o comando, o Prisma atualiza os registros correspondentes pelos slugs e pela posição de cada aula no curso.

### Iniciar a API

```sh
npm run start:dev
```

Deixe o terminal aberto e acesse [a verificação de saúde](http://127.0.0.1:3000/health) ou [a lista de categorias](http://127.0.0.1:3000/categories) na mesma máquina.

### Parar e retomar

Encerre a API com `Ctrl+C`. Para parar o banco, execute `docker compose stop`. Ao voltar, rode `docker compose up -d --wait` e `npm run start:dev`.

O volume `postgres_data` mantém os dados na máquina atual. Na outra máquina, o Compose cria um volume novo. O script SQL carrega os dados de exemplo, e um backup do PostgreSQL é necessário para levar também as categorias cadastradas manualmente.

## 8. Endpoints da API

| Método | Endpoint | Resposta esperada |
| --- | --- | --- |
| GET | `/` | `200 OK` com o texto `Hello World!`. |
| GET | `/health` | `200 OK` com o estado da aplicação e da conexão com o banco. |
| GET | `/categories` | `200 OK` com um array JSON de categorias. O array é vazio quando a tabela está vazia. |
| GET | `/courses` | `200 OK` com os cursos, suas categorias e aulas ordenadas por posição. |
| GET | `/courses/:id` | `200 OK` com o curso solicitado, `400` para parâmetro inválido ou `404` para curso inexistente. |

As rotas são públicas no ambiente local. Uma rota inexistente retorna `404`. Uma falha inesperada durante uma consulta pode retornar `500`. Se a conexão com o banco falhar na inicialização, confira o terminal da API e o estado do serviço `postgres`.

## 9. Exemplo de requisição e resposta

No Bruno, abra a coleção da pasta `API Devflix`, selecione **Listar Categorias** e clique em **Send**. A requisição usa `GET` e tem corpo vazio. Também é possível testar pelo PowerShell.

```powershell
curl.exe -i http://127.0.0.1:3000/categories
curl.exe -i http://127.0.0.1:3000/courses
```

Para consultar um curso específico, use um ID retornado pela listagem em `GET /courses/:id`. Os IDs podem variar entre instalações.

Exemplo de resposta de `GET /categories` quando há uma categoria cadastrada:

```json
[
  {
    "id": 1,
    "name": "Desenvolvimento Frontend",
    "slug": "frontend",
    "createdAt": "2026-11-17T01:17:06.174Z",
    "updatedAt": "2026-11-17T01:17:06.174Z"
  }
]
```

## 10. Modelo de dados e regras de negócio

| Campo de `Category` | Tipo e regra |
| --- | --- |
| `id` | Inteiro, chave primária gerada automaticamente. |
| `name` | Texto obrigatório com o nome da categoria. |
| `slug` | Texto obrigatório e único, como `frontend`. |
| `createdAt` | Data e hora de criação, preenchida automaticamente. |
| `updatedAt` | Data e hora da última atualização, gerenciada pelo Prisma nas operações feitas pelo cliente. |

Para adicionar uma categoria, rode `npx prisma studio` com o PostgreSQL ativo. Abra a tabela **Category**, preencha `name` e um `slug` único, salve e consulte `GET /categories` novamente.

Uma categoria pode ter vários cursos. Cada `Course` pertence a uma categoria, tem slug único e começa como rascunho por padrão (`published: false`). O PostgreSQL impede excluir uma categoria que ainda tem cursos vinculados.

Cada `Lesson` pertence a um curso, guarda um ID de vídeo do YouTube e tem uma posição única dentro do curso. Ao excluir um curso, o PostgreSQL exclui suas aulas vinculadas.

## 11. Testes

```sh
npm test
npm run test:e2e
npm run test:cov
```

O projeto inclui testes unitários para componentes da API e um teste de ponta a ponta para `GET /`. Para o teste de ponta a ponta, deixe o PostgreSQL ativo e configure o `.env`, pois o teste inicializa o módulo principal da aplicação.

Os testes de `CoursesService` usam um mock do Prisma para verificar a listagem, a busca por ID e o erro para um curso inexistente. Eles podem rodar com o banco desligado.

## 12. Extras de Programação Web 2

- **Docker Compose** reproduz o PostgreSQL em outras máquinas e mantém os dados em um volume local.
- **Migrações versionadas** permitem criar a estrutura da tabela a partir de um banco vazio.
- **Bruno** oferece uma requisição pronta para testar a listagem.

## 13. Versionamento acadêmico

O modelo da disciplina prevê uma branch semanal no formato `branch_yyyymmdd`, criada a partir da `main`. Registre as alterações em commits com mensagens claras e integre a branch à `main` ao concluir a atividade.

## 14. Autor e uso acadêmico

- **Autor** · [eliakim-ads](https://github.com/eliakim-ads)
- **Unidade curricular** · Programação Web 2, Senac RJ

Projeto desenvolvido para fins acadêmicos.
