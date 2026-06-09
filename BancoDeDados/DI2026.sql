create table clientes(
	id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100),
    telefone VARCHAR(20),
    data_cadastro DATE

);

create table funcionarios (
	id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    cargo VARCHAR(50),
    salario DECIMAL(10,2)

);

create table categoria_pedido(
	id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome_categoria VARCHAR(50)

);

create table produtos(
	id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    preco DECIMAL(10,2),
    estoque INT,
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria_pedido(id_categoria)

);

create table vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    data_venda DATETIME,
    valor_total DECIMAL(10,2),
    id_cliente INT,
    id_funcionario INT,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id_funcionario)

);

create table itens_venda(
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT,
    id_produto INT,
    quantidade INT,
    preco_unitario DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (id_venda) REFERENCES vendas(id_venda),
    FOREIGN KEY (id_produto) REFERENCES produtos(id_produto)

);

create table fornecedores (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(100)
);

create table compras (
    id_compra INT AUTO_INCREMENT PRIMARY KEY,
    data_compra DATE,
    valor_total DECIMAL(10,2),
    id_fornecedor INT,
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_fornecedor)
);

INSERT INTO categoria_pedido (nome_categoria)
VALUES
('Cafés'),
('Bolos'),
('Salgados'),
('Bebidas');

INSERT INTO produtos (nome, preco, estoque, id_categoria)
VALUES
('Café Expresso', 5.50, 100, 1),
('Café com Leite', 6.50, 60, 1),
('Chá', 5.00, 30, 1),

('Bolos diveros', 14.00, 15, 2),

('Pão de Queijo', 4.50, 80, 3),
('Pão Francês', 15.00, 30, 3),
('Salgados fritos', 9.00, 30, 3),
('Salgados assados', 12.00, 30, 3),

('Suco de Laranja', 10.00, 25, 4),
('Refrigerantes Lata', 5.00, 100, 4),
('Refrigerantes Litro', 10.00, 100, 4);

INSERT INTO clientes (nome, email, telefone, data_cadastro)
VALUES
('João Vitor Eurich','joaodoturvo@gmail.com','42998990561','2026-01-10'),
('Emanuel Souza Stefanes','manu@gmail.com','4291999722','2026-01-15'),
('Allan Carlos Lemos','allanpolaco@gmail.com','42984999204','2026-02-01'),
('Roger Felipe Farias','roger@gmail.com','24991999209','2026-02-10'),
('Nathan Marcondes','nathanzinho@gmail.com','42999890612','2026-03-01');

INSERT INTO funcionarios (nome, cargo, salario)
VALUES
('Carlos Mendes Lemos','Atendente',2200.00),
('Richardy Walter','Atendente',2200.00),
('Fernanda Lima Eurich','Caixa',2200.00),
('Ricardo Alves Farias','Gerente Geral',4500.00);

INSERT INTO fornecedores (nome_empresa, telefone, email)
VALUES
('Café Coamo LTDA','1130814278','contato@cafecoamo.com'),
('Doces União','4236771973','vendas@docesuniao.com'),
('Distribuidora Alimentos PR','4136211480','contato@alimentossp.com'),
('Refrigerantes Brasil LTDA','1119530051','portal@rbbrasil.com');

INSERT INTO compras (data_compra, valor_total, id_fornecedor)
VALUES
('2026-01-05', 1200.00, 1),
('2026-01-12', 850.00, 2),
('2026-01-12', 1350.00, 3),
('2026-01-20', 2100.00, 4);

INSERT INTO vendas
(data_venda, valor_total, id_cliente, id_funcionario)
VALUES
('2026-04-01 08:15:00', 13.50, 1, 1),
('2026-04-01 09:30:00', 20.00, 2, 2),
('2026-04-02 10:00:00', 18.50, 3, 1),
('2026-04-02 14:20:00', 12.00, 4, 2),
('2026-04-03 16:45:00', 22.00, 5, 1);

INSERT INTO itens_venda
(id_venda, id_produto, quantidade, preco_unitario, subtotal)
VALUES

(1, 1, 1, 5.50, 5.50),
(1, 6, 1, 4.50, 4.50),
(1, 9, 1, 6.00, 6.00),

(2, 2, 1, 8.00, 8.00),
(2, 4, 1, 12.00, 12.00),

(3, 3, 1, 6.50, 6.50),
(3, 7, 1, 9.00, 9.00),
(3, 6, 1, 4.50, 4.50),

(4, 4, 1, 12.00, 12.00),

(5, 2, 1, 8.00, 8.00),
(5, 5, 1, 14.00, 14.00);

SELECT p.nome, SUM(iv.quantidade) AS total_vendido
FROM itens_venda iv
JOIN produtos p ON iv.id_produto = p.id_produto
GROUP BY p.nome
ORDER BY total_vendido DESC;

SELECT SUM(valor_total) AS faturamento_total
FROM vendas;

/*
relacionamento entre as tabelas: 

CLIENTES (1) -------- (N) VENDAS

FUNCIONARIOS (1) ---- (N) VENDAS

VENDAS (1) ---------- (N) ITENS_VENDA

PRODUTOS (1) -------- (N) ITENS_VENDA

CATEGORIA_PEDIDO (1) - (N) PRODUTOS

FORNECEDORES (1) ---- (N) COMPRAS


*/