import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import process from "process";

// Cria a conexão com o banco usando a URL do .env
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);

// Inicializa o Prisma passando o adaptador obrigatório
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Semeando banco de dados...')

    // limpa a tabela antes de popular
    await prisma.product.deleteMany
    
    // cria produtos de exemplo 
    const products = await prisma.product.createMany({
        data: [
            {
                title: "Samsung Galaxy Book4 Intel® Core™ i5-1335U, Windows 11 Home, 8GB, 512GB SSD, Iris Xe, 15.6'' Full HD LED, 1.55kg",
                description: "Intel Core i5-1335U, Windows 11 Home, 8 GB, 512 GB SSD, Iris Xe, 15.6'' Full HD LED, 1.55kg",
                price: 4500.00,
                imageUrl: "/images/notebookBook4.png",
                isFeatured: true
            },
            {
                title: "Mouse sem fio Logitech M170 com Design Ambidestro Compacto, Conexão USB e Pilha Inclusa - Preto",
                description: "Design ergonômico, Leve, Portátil, Sem fio",
                price: 59.00,
                imageUrl: "/images/mouseM170.png",
                isFeatured: true
            },
            {
                title: "ELG, F80N, Suporte Articulado de Mesa, Pistão a Gás, Design Compacto e Retrátil, Ergonômico, Monitores 17'' a 35'', 2kg a 9kg, Preto",
                description: "Teclado com fio",
                price: 150.00,
                imageUrl: "/images/suporteF80N.png",
                isFeatured: true
            },
            {
                title: "Combo Teclado e Mouse Sem Fio Logitech MK250 Bluetooth com Conectividade Rápida e Fácil, Design Compacto, Mouse Ambidestro, Layout ABNT2, Construção Durável, Compatível com PC e Mac - Grafite",
                description: "Conecte em segundos: Tecnologia sem fio Bluetooth rápida e fácil — com o Pair and Play, faça o pareamento deste combo de teclado e mouse sem fio Logitech sem a necessidade de uma porta USB",
                price: 128.00,
                imageUrl: "/images/tecladoMK250.png",
                isFeatured: true
            },
            {
                title: "Pc Home Office Core I5 3470, 16 Gb Ddr3, Ssd 240 Gb, Fonte Bivolt",
                description: "Processador Potente: Equipado com um processador Intel Core i5 3470, este computador oferece desempenho confiável para tarefas do dia a dia e trabalho. Memória e Armazenamento Rápidos: Com 16GB (2X8GB) de RAM DDR3 e um SSD de 240GB, este computador garante uma execução suave de aplicativos e um tempo de inicialização rápido",
                price: 900.00,
                imageUrl: "/images/pcHomeI5.png",
                isFeatured: true
            }
        ]
    })

    console.log(`${products.count} produtos criados com sucesso!`)
}

main()
    .catch((e) => {
        console.error('Erro ao popular banco: ', e);
        process.exit(1);
    })
    .finally(async() => {
        await prisma.$disconnect();
    });