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

// export interface ProductData {
//     id: number;
//     title: string;
//     description: string;
//     price: number;
//     imageURL: string;
//     isFeatured?: boolean;
// }

const mockProducts = [
    {
        id: 1,
        title: "Notebook",
        description: "Um notebook poderoso",
        price: 4500.00,
        imageURL: "/images/notebook.png",
        isFeatured: true
    },
    {
        id: 2,
        title: "Mouse",
        description: "Mouse com fio",
        price: 30.00,
        imageURL: "/images/mouse.png",
        isFeatured: true
    }
];

app.get('/' , async (req: Request, res: Response) => {
    try {
    const products = await prisma.product.findMany();
    res.json(products); // Retorna os produtos do banco
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});


// app.get('/api/products' , (req: Request, res: Response) => {
//     console.log('Requisição para /api/products recebida.');
//     res.json(mockProducts);
// });

app.listen(PORT, () => {
    console.log('servidor em http://localhost:${PORT}');
});



