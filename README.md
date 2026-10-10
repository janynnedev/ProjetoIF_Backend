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