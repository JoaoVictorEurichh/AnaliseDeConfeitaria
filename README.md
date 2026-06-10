# Sistema de Análise de Confeitaria

Projeto desenvolvido para o Desafio Integrador — 5° Período, Engenharia de Software, Centro Universitário Campo Real.

## Participantes

| Responsabilidade | GitHub |
|---|---|
| IA e Análise de Dados | [@JoaoVictorEurichh](https://github.com/JoaoVictorEurichh) |
| Backend | [@Allanclms](https://github.com/Allanclms) |
| Banco de Dados | [@rogerfelipe10](https://github.com/rogerfelipe10) |
| Frontend | [@emanuelstefaness](https://github.com/emanuelstefaness) |

---

## Visão Geral

Sistema web para análise de dados de uma confeitaria fictícia. Permite o cadastro de clientes, produtos, categorias, funcionários e vendas, além de gerar relatórios gerenciais e análises preditivas de churn utilizando Inteligência Artificial (Random Forest).

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (TypeScript) + Prisma ORM 6 + PostgreSQL |
| Frontend | React + Vite + Tailwind CSS + Recharts |
| IA / ML | Python + FastAPI + scikit-learn + pandas |

---

## Funcionalidades

- Cadastro de clientes, produtos, categorias, funcionários e vendas
- Controle de estoque com alerta de produtos com quantidade baixa
- Análise de dados com gráficos: top produtos, faturamento por categoria e por cidade
- Relatório gerencial: faturamento total, ticket médio, ranking de top clientes
- Decisão estratégica: previsão de churn e scoring de propensão à compra via Random Forest

---

## Requisitos de Instalação

### Node.js (Backend e Frontend)

```
Node.js 18 ou superior
npm 9 ou superior
```

### Python (Serviço de IA)

```
Python 3.10 ou superior
pip (gerenciador de pacotes Python)
```

### Banco de Dados

```
PostgreSQL 14 ou superior
Banco de dados chamado "confeitaria" criado manualmente
```

### Bibliotecas Python

| Biblioteca | Versão mínima | Finalidade |
|---|---|---|
| fastapi | 0.115.0 | API REST do serviço de IA |
| uvicorn | 0.30.6 | Servidor ASGI |
| psycopg2-binary | 2.9.9 | Conexão com PostgreSQL |
| pandas | 2.3.0 | Manipulação de dados |
| numpy | 2.1.0 | Operações numéricas |
| scikit-learn | 1.5.2 | Modelo Random Forest |
| python-dotenv | 1.0.1 | Variáveis de ambiente |

---

## Como Executar

### 1. Banco de Dados

Crie o banco no PostgreSQL:

```sql
CREATE DATABASE confeitaria;
```

### 2. Backend

```bash
cd backend

# Crie o arquivo .env com sua conexão:
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/confeitaria"

npm install
npx prisma@6 migrate deploy
npx prisma@6 generate
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Serviço de IA (Python)

```bash
cd ia
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

> O arquivo `.env` dentro da pasta `ai/` deve conter a mesma `DATABASE_URL` do backend.

---

## URLs de Acesso

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Serviço de IA | http://localhost:8000 |

---

## Diagrama de Banco de Dados

```mermaid
erDiagram
    CLIENTE {
        int id PK
        string nome
        string email
        string telefone
        string cidade
        string estado
        string pais
        datetime dataCadastro
    }

    FUNCIONARIO {
        int id PK
        string nome
        string cargo
    }

    CATEGORIA {
        int id PK
        string nome
    }

    PRODUTO {
        int id PK
        string nome
        float preco
        int estoque
        int categoriaId FK
    }

    VENDA {
        int id PK
        float valorTotal
        datetime dataVenda
        int clienteId FK
        int funcionarioId FK
    }

    ITEMVENDA {
        int id PK
        int vendaId FK
        int produtoId FK
        int quantidade
        float subtotal
    }

    CLIENTE ||--o{ VENDA : "realiza"
    FUNCIONARIO ||--o{ VENDA : "registra"
    VENDA ||--|{ ITEMVENDA : "contém"
    PRODUTO ||--o{ ITEMVENDA : "incluído em"
    CATEGORIA ||--o{ PRODUTO : "classifica"
```

---

## Tratamento de Dados

O serviço Python aplica as seguintes etapas antes de treinar o modelo Random Forest:

### 1. Remoção de Duplicatas
Registros com o mesmo `id` de cliente são removidos com `drop_duplicates`, garantindo que cada cliente seja representado uma única vez.

### 2. Remoção de Outliers — Método IQR
Para cada variável numérica (`total_pedidos`, `valor_total`, `ticket_medio`, `dias_cadastro`, `dias_ultima_compra`, `frequencia_mensal`), calcula-se o intervalo interquartil:

```
IQR = Q3 - Q1
Limite inferior = Q1 - 1,5 × IQR
Limite superior = Q3 + 1,5 × IQR
```

Valores fora desse intervalo são ajustados por *clipping*, sem remover linhas.

### 3. Normalização Min-Max
Após o tratamento de outliers, todas as features são normalizadas para o intervalo [0, 1]:

```
x_norm = (x - x_min) / (x_max - x_min)
```

Garante que features com escalas diferentes tenham peso equivalente no modelo.

### 4. Rotulagem de Churn
Um cliente é classificado como churn se não comprou nos últimos 30 dias ou não possui nenhum pedido. O Random Forest é treinado com 100 árvores e profundidade máxima de 5.

---

## Modelo Random Forest

| Parâmetro | Valor |
|---|---|
| `n_estimators` | 100 |
| `max_depth` | 5 |
| `random_state` | 42 |

**Features de entrada:** total de pedidos, valor total gasto, ticket médio, dias desde o cadastro, dias desde a última compra, frequência mensal.

**Saída:** probabilidade de churn (0–100%) e classificação em Alto (>70%), Médio (40–70%) ou Baixo (<40%) risco.
