# Projeto IFSudesteMG - Tecnologias Backend

## Loja de Produtos
### Criar package.json
`npm init -y`
	
### Criar Projeto Typescript com Express
`npm install -D typescript @types/node @types/express tsx`

### Instalar o Express
`npm install express`

### Subir o Docker 
`docker-compose up -d`

### Instalar o Prisma 
`npm install -D prisma`

### Instalar o Prisma Client
`npm install @prima/client`

### Executar Prisma
`npx prisma init`

### Database URL no .env
Informar a DatabaseURL do banco de dados no Prisma em .env :
`DATABASE_URL="postgresql://admin:senha123@localhost:5432/catalogo_produtos?schema=public" `

### Migrations no Prisma
Com o Prisma, é necessário criar uma nova migration a cada alteração realizada no banco de dados: 
`npx prisma migrate dev --name init`

Após criada a nova migração, é necessário resetar o reset do Prima:
`npx prima migrate reset`
	
E depois reexecuta o `npx prisma migrate dev --name init`

### Visualizar o Prisma Studio
`npx prisma studio`

### Popular o banco de dados Prisma 
`npx prisma db seed`

### Exceutar o projeto 
`npm run dev`

### necessário instalar cors
`npm install cors`
### Config cors para typescript
`npm install -D @types/cors`
### install zod 
`npm install zod`
### Import do Zod
o pacote `z` é responsável pela validação de caracteres do zod 
e o `ZodError` é responsável pelas validações de erro para tratar o erro e apresentar de forma mais amigável
o parâmetro `coerce` do Zod tenta converter uma string para número


# Tarefa 3 
## Endpoints

| Método | Caminho | Acesso | Sucesso |
|---|---|---|---|
| GET | `/` | Público | 200 |
| POST | `/api/auth/register` | Público | 201 |
| POST | `/api/auth/login` | Público | 200 |
| GET | `/api/auth/me` | Bearer JWT | 200 |
| GET | `/api/products` | Público | 200 |
| GET | `/api/products/:id` | Público | 200 |
| POST | `/api/products` | Bearer JWT | 201 |
| PUT | `/api/products/:id` | Bearer JWT | 200 |
| DELETE | `/api/products/:id` | Bearer JWT | 204 |

### Registro

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{"name":"Usuário Teste","email":"usuario.teste@example.com","password":"123456"}
```

`name` é opcional. O e-mail é validado e normalizado; a senha precisa ter pelo menos seis caracteres. O registro retorna `message`, `token` e `user`, sem senha ou hash. Um e-mail já cadastrado retorna **409**. O hash bcrypt é armazenado no PostgreSQL.

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{"email":"usuario.teste@example.com","password":"senha123"}
```

Credenciais corretas retornam `message`, `token` e `user`; credenciais incorretas retornam **401**. O JWT usa `JWT_SECRET`, contém `userId` e expira em sete dias.

### Perfil e produtos protegidos

Use `Authorization: Bearer SEU_TOKEN` em `/api/auth/me` e nas rotas de escrita. Token ausente, inválido ou expirado retorna **401**. `GET /api/auth/me` retorna `{ "user": { ... } }`, sem senha.

Criação de produto:

```json
{"title":"Monitor","description":"Monitor de 24 polegadas","price":799.9,"imageUrl":"/images/monitor.png","isFeatured":false}
```

Atualização parcial em `PUT /api/products/:id`:

```json
{"price":699.9}
```

Payload inválido retorna **400** com `issues`; produto inexistente retorna **404**. O DELETE autenticado retorna **204**.
