import 'dotenv/config';
import express, {type Request, type Response, type NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { z, ZodError } from 'zod'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// Inicializa a conexão com o banco
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL não configurada.');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json()); // Permite que a API entenda JSON

app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, msg: 'API de produtos no ar!' });
});

//Aula 4 - Autenticação JWT: validação, hash e token com validade de sete dias.
const emailSchema = z.string().trim().toLowerCase().pipe(z.email('E-mail inválido'));
const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  name: z.string().trim().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
});
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'A senha é obrigatória'),
});
const publicUser = { id: true, email: true, name: true, createdAt: true } as const;
type PublicUser = { id: number; email: string; name: string | null; createdAt: Date };
type AuthRequest = Request & { user?: PublicUser };

function validationError(error: ZodError) {
  return {
    error: 'Dados inválidos',
    issues: error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })),
  };
}

function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET!, { algorithm: 'HS256', expiresIn: '7d' });
}

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? '');
  if (!match) { res.status(401).json({ error: 'Token ausente ou inválido' }); return; }
  let userId: number;
  try {
    const payload = jwt.verify(match[1]!, JWT_SECRET!, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !Number.isSafeInteger(payload.userId) || payload.userId <= 0) {
      res.status(401).json({ error: 'Token ausente ou inválido' }); return;
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: 'Token ausente ou inválido' }); return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser });
    if (!user) { res.status(401).json({ error: 'Token ausente ou inválido' }); return; }
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Erro interno de autenticação' });
  }
}

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));
  const { email, password, name } = parsed.data;
  try {
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name: name ?? null },
      select: publicUser,
    });
    return res.status(201).json({ message: 'Usuário cadastrado com sucesso', token: signToken(user.id), user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(validationError(parsed.error));
  try {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !await bcrypt.compare(parsed.data.password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const { id, email, name, createdAt } = user;
    return res.status(200).json({ message: 'Login realizado com sucesso', token: signToken(id), user: { id, email, name, createdAt } });
  } catch {
    return res.status(500).json({ error: 'Erro interno ao autenticar usuário' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  return res.status(200).json({ user: req.user });
});

app.get('/api/products' , async (_req: Request, res: Response) => {
    try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const productId = Number(req.params.id);
    
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'O ID fornecido não é um número válido' });
    }
    
    const product = await prisma.product.findUnique({
      where: { id: productId } 
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar o produto' });
  }
});

//Schemas Zod: createProductSchema e updateProductSchema
// Schema de criação de produto
export const createProductSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres.'),
  price: z.coerce.number().positive('Preço deve ser maior que zero.'),
  imageUrl: z.string().min(1, 'imageUrl não pode ser vazio.'),
  isFeatured: z.coerce.boolean().optional().default(false),
});
/**
 *  POST /api/products/
 */
app.post('/api/products' , authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createProductSchema.parse(req.body)    
    const newProduct = await prisma.product.create({data});
    return res.status(201).json(newProduct);
  } catch (error) {
    if (error instanceof ZodError){
      return res.status(400).json({ 
        error: 'Payload inválido',
        issues: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
    })
  }
  console.error('POST /api/products error: ', error)
  return res.status(500).json({ error: 'Erro interno ao criar produto.' })
}
});

// Schema de atualização  de produto
const updateProductSchema = createProductSchema.partial()
/**
 * PUT /api/products/:id - atualização parcial com validação
 */
app.put('/api/products/:id' , authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido. Use um inteiro positivo.' });
  }

  try {
    const parsed = updateProductSchema.parse(req.body)
    const data = {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(parsed.description !== undefined && { description: parsed.description }),
      ...(parsed.price !== undefined && { price: parsed.price }),
      ...(parsed.imageUrl !== undefined && { imageUrl: parsed.imageUrl }),
      ...(parsed.isFeatured !== undefined && { isFeatured: parsed.isFeatured }),
    }
    const updated = await prisma.product.update({ where: { id }, data })
    return res.status(200).json(updated)
  } catch (error) {
    if (error instanceof ZodError){
      return res.status(400).json({ 
        error: 'Payload inválido',
        issues: error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado.' })
    }
    console.error(`PUT /api/products/${req.params.id} error: `, error)
    return res.status(500).json({ error: 'Erro interno ao atualizar produto.' })
  }
});

/**
 * DELETE /api/products/:id - remove produto
 */
app.delete('/api/products/:id' , authMiddleware, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido. Use um inteiro positivo.' });
  }

  try {   
    await prisma.product.delete({ where: { id }})
    return res.status(204).send()
  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Produto não encontrado.' })
    }
    console.error(`DELETE /api/products/${req.params.id} error: `, error)
    return res.status(500).json({ error: 'Erro interno ao deletar produto.' })  
  }
});

const PORT = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) throw new Error('PORT inválida.');
app.listen(PORT, () => {
    console.log(`servidor em http://localhost:${PORT}`);
});



