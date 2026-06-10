# Sistema de Análise de Confeitaria

Projeto desenvolvido para o Desafio Integrador — 5° Período, Engenharia de Software, Centro Universitário Campo Real.

## Visão Geral

Sistema web para análise de dados de uma confeitaria fictícia. Permite o cadastro de clientes, produtos, categorias, funcionários e vendas, além de gerar relatórios gerenciais e análises preditivas de churn utilizando Inteligência Artificial.

## Tecnologias

- **Backend**: NestJS (TypeScript) + Prisma ORM + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Serviço de IA**: Python + FastAPI + scikit-learn (Random Forest)

## Funcionalidades

- Cadastro de clientes (com validação de e-mail), produtos, categorias, funcionários e vendas
- Análise de dados com gráficos: top produtos, faturamento por categoria e por cidade
- Relatório gerencial: faturamento total, ticket médio, top clientes, alerta de estoque baixo
- Módulo de decisão estratégica: previsão de churn e scoring de propensão à compra via Random Forest

## Como rodar

### Pré-requisitos

- Node.js 18+, Python 3.10+ e PostgreSQL instalados
- Banco de dados `confeitaria` criado no PostgreSQL

### Backend

```bash
cd backend

# Criar o arquivo .env com a URL do banco
# Exemplo: DATABASE_URL="postgresql://postgres:senha@localhost:5432/confeitaria"

npm install
npx prisma@6 migrate deploy
npx prisma@6 generate
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Serviço de IA (Python)

```bash
cd python-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## Acessar

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Serviço de IA | http://localhost:8000 |

## Tratamento de Dados

O serviço Python aplica as seguintes etapas antes de treinar o modelo Random Forest:

### 1. Remoção de duplicatas
Registros com o mesmo `id` de cliente são removidos com `drop_duplicates`, garantindo que cada cliente seja representado uma única vez no conjunto de treinamento.

### 2. Remoção de outliers — Método IQR
Para cada feature numérica (`total_pedidos`, `valor_total`, `ticket_medio`, `dias_cadastro`, `dias_ultima_compra`, `frequencia_mensal`), calcula-se o intervalo interquartil:

```
IQR = Q3 - Q1
limite_inferior = Q1 - 1.5 × IQR
limite_superior = Q3 + 1.5 × IQR
```

Valores fora desse intervalo são ajustados (clipping) para os limites, sem remoção de linhas.

### 3. Normalização Min-Max
Após o tratamento de outliers, todas as features são normalizadas para o intervalo [0, 1] com `MinMaxScaler`:

```
x_norm = (x - x_min) / (x_max - x_min)
```

Isso garante que features com escalas diferentes (ex.: dias vs. valor em reais) tenham peso equivalente no modelo.

### 4. Rotulagem e treinamento
O rótulo de churn é gerado por regra de negócio: cliente é considerado churn se não comprou nos últimos 30 dias ou não tem nenhum pedido. O Random Forest é treinado com 100 árvores e profundidade máxima de 5.

## Modelo Random Forest

| Parâmetro | Valor |
|---|---|
| `n_estimators` | 100 |
| `max_depth` | 5 |
| `random_state` | 42 |

**Features de entrada:** total de pedidos, valor total gasto, ticket médio, dias desde o cadastro, dias desde a última compra, frequência mensal de compras.

**Saída:** probabilidade de churn (0–100%) e classificação em Alto, Médio ou Baixo risco.
