import 'dotenv/config';
import express, {type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Inicializa a conexão com o banco
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json()); // Permite que a API entenda JSON

const PORT = 3001;

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/products' , async (req: Request, res: Response) => {
    try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.get('/products/:id', async (req: Request, res: Response): Promise<any> => {
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
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar o produto' });
  }
});


app.listen(PORT, () => {
    console.log('servidor em http://localhost:${PORT}');
});



