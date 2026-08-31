import express, {type Request, type Response } from 'express';

const app = express();

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

app.get('/' , (req: Request, res: Response) => {
    res.json({ message: 'Olá'});
});

app.get('/api/products' , (req: Request, res: Response) => {
    console.log('Requisição para /api/products recebida.');
    res.json(mockProducts);
});

app.listen(PORT, () => {
    console.log('servidor em http://localhost:${PORT}');
});



