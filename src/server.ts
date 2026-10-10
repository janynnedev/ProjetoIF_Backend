import 'dotenv/config';
import express, {type Request, type Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import cors from 'cors';
import { z, ZodError } from 'zod'
import { title } from 'node:process';
import path from 'node:path';


// Inicializa a conexão com o banco
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json()); // Permite que a API entenda JSON

// cors básico para dev (front em Vite)
app.use(cors({ origin: 'http://localhost:5173'}))

app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, msg: 'API de produtos no ar!' });
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
app.post('/api/products' , async (req: Request, res: Response) => {
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
app.put('/api/products/:id' , async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido. Use um inteiro positivo.' });
  }

  try {
    const data = updateProductSchema.parse(req.body)    
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
app.delete('/api/products/:id' , async (req: Request, res: Response) => {
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

const PORT = 3001;
app.listen(PORT, () => {
    console.log('servidor em http://localhost:${PORT}');
});



