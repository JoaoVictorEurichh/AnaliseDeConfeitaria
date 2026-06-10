import os
from datetime import datetime
from urllib.parse import urlparse, unquote

import numpy as np
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler

load_dotenv(encoding="utf-8")

app = FastAPI(title="Serviço de IA - Confeitaria")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:senha123@localhost:5432/confeitaria",
)


def obter_conexao():
    parsed = urlparse(DATABASE_URL)
    return psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port or 5432,
        dbname=parsed.path.lstrip("/"),
        user=parsed.username,
        password=unquote(parsed.password or ""),
    )


def buscar_dados_clientes():
    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT
            c.id,
            c.nome,
            c."dataCadastro",
            COUNT(v.id) AS total_pedidos,
            COALESCE(SUM(v."valorTotal"), 0) AS valor_total,
            MAX(v."dataVenda") AS ultima_compra
        FROM "Cliente" c
        LEFT JOIN "Venda" v ON v."clienteId" = c.id
        GROUP BY c.id, c.nome, c."dataCadastro"
        ORDER BY c.id
        """
    )

    linhas = cursor.fetchall()
    cursor.close()
    conn.close()
    return linhas


def construir_features(linhas):
    hoje = datetime.now()
    registros = []

    for linha in linhas:
        cliente_id, nome, data_cadastro, total_pedidos, valor_total, ultima_compra = linha

        dias_cadastro = max(
            (hoje - data_cadastro.replace(tzinfo=None)).days, 1
        ) if data_cadastro else 1

        dias_ultima_compra = (
            (hoje - ultima_compra.replace(tzinfo=None)).days
            if ultima_compra
            else 9999
        )

        total_pedidos = int(total_pedidos)
        valor_total = float(valor_total)
        ticket_medio = valor_total / max(total_pedidos, 1)
        frequencia_mensal = total_pedidos / dias_cadastro * 30

        registros.append(
            {
                "id": cliente_id,
                "nome": nome,
                "total_pedidos": total_pedidos,
                "valor_total": valor_total,
                "ticket_medio": ticket_medio,
                "dias_cadastro": dias_cadastro,
                "dias_ultima_compra": dias_ultima_compra,
                "frequencia_mensal": frequencia_mensal,
            }
        )

    return pd.DataFrame(registros)


def remover_outliers(df: pd.DataFrame, colunas: list) -> pd.DataFrame:
    """Remove outliers usando IQR e faz clipping."""
    df = df.copy()
    for col in colunas:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        limite_inf = q1 - 1.5 * iqr
        limite_sup = q3 + 1.5 * iqr
        df[col] = df[col].clip(limite_inf, limite_sup)
    return df


def treinar_modelo(df: pd.DataFrame):
    colunas_features = [
        "total_pedidos",
        "valor_total",
        "ticket_medio",
        "dias_cadastro",
        "dias_ultima_compra",
        "frequencia_mensal",
    ]

    df = df.drop_duplicates(subset=["id"]).copy()

    # Tratamento
    df = remover_outliers(df, colunas_features)

    # Regra de negocio:
    y = ((df["dias_ultima_compra"] > 30) | (df["total_pedidos"] == 0)).astype(int)

    # Dois produto para treinar
    y_arr = y.to_numpy().copy()
    if len(set(y_arr)) < 2:
        y_arr[0] = 1 - y_arr[0]

    X = df[colunas_features].copy()

    # Min-Max
    scaler = MinMaxScaler()
    X_norm = scaler.fit_transform(X)

    # Treina Random Forest
    modelo = RandomForestClassifier(
        n_estimators=100,
        max_depth=5,
        random_state=42,
    )
    modelo.fit(X_norm, y_arr)

    return modelo, scaler, df, colunas_features


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/clientes-churn")
def clientes_churn():
    try:
        linhas = buscar_dados_clientes()
    except Exception as exc:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"erro": str(exc)})

    if not linhas:
        return {
            "clientes": [],
            "importancia_features": {},
            "total_alto_risco": 0,
            "total_medio_risco": 0,
            "total_baixo_risco": 0,
        }

    df = construir_features(linhas)
    modelo, scaler, df_limpo, colunas = treinar_modelo(df)

    X = df_limpo[colunas].copy()
    X_norm = scaler.transform(X)

    probabilidades = modelo.predict_proba(X_norm)
    if probabilidades.shape[1] == 1:
        only_class = int(modelo.classes_[0])
        prob_churn = probabilidades[:, 0] if only_class == 1 else np.zeros(len(probabilidades))
    else:
        prob_churn = probabilidades[:, 1]

    importancia = dict(
        zip(colunas, modelo.feature_importances_.round(3))
    )

    resultado = []
    for i, (_, linha) in enumerate(df_limpo.iterrows()):
        score_churn = float(prob_churn[i])

        if score_churn >= 0.7:
            classificacao = "Alto risco"
        elif score_churn >= 0.4:
            classificacao = "Médio risco"
        else:
            classificacao = "Baixo risco"

        dias_ult = int(linha["dias_ultima_compra"])
        resultado.append(
            {
                "id": int(linha["id"]),
                "nome": linha["nome"],
                "total_pedidos": int(linha["total_pedidos"]),
                "valor_total": round(float(linha["valor_total"]), 2),
                "ticket_medio": round(float(linha["ticket_medio"]), 2),
                "dias_ultima_compra": None if dias_ult == 9999 else dias_ult,
                "propensao_compra": round((1 - score_churn) * 100, 1),
                "churn_score": round(score_churn * 100, 1),
                "classificacao": classificacao,
            }
        )

    return {
        "clientes": resultado,
        "importancia_features": importancia,
        "total_alto_risco": sum(1 for r in resultado if r["classificacao"] == "Alto risco"),
        "total_medio_risco": sum(1 for r in resultado if r["classificacao"] == "Médio risco"),
        "total_baixo_risco": sum(1 for r in resultado if r["classificacao"] == "Baixo risco"),
    }
