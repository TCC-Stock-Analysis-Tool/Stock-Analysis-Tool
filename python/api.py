from flask import Flask, request, jsonify
from flask_cors import cross_origin
import matplotlib.pyplot as plt
import base64
import io
import yfinance as yf
import numpy as np
from datetime import datetime, timedelta
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
from sklearn.metrics import mean_squared_error
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error, mean_absolute_percentage_error



app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

def backtesting(ativo, data_inicial, data_final, quantidade_acoes, periodo_media_movel, estrategias, parametros_estrategias=None):
    #Obtem os dados históricos do ativo usando yfinance
    df = yf.download(ativo, start=data_inicial, end=data_final)

    #Calcula a média móvel com o período fornecido
    df['media_movel'] = df['Close'].rolling(window=periodo_media_movel).mean()

    # Variáveis de controle
    posicao_atual = 'vendida'
    num_operacoes = 0

    #Listas para armazenar os pontos de compra e venda
    pontos_compra = []
    pontos_venda = []

    log = []

    #Variável para armazenar o lucro total
    lucro_total = 0
    
    sinal_compra = False
    sinal_venda = False

    usar_momentum = 'momentum_negativo' in estrategias and 'stop_loss' in estrategias
    alta_pos_stop = 0

    for i in range(periodo_media_movel, len(df)):
        preco_fechamento = df.iloc[i]['Close']
        media_movel = df.iloc[i]['media_movel']

        # Adiciona condições das estratégias escolhidas
        for estrategia_nome in estrategias:
            if estrategia_nome == 'cruzamento':
                sinal_compra = preco_fechamento < media_movel and posicao_atual == 'vendida'
                sinal_venda = preco_fechamento > media_movel and posicao_atual == 'comprada'
                print('sinal venda dentro do if', sinal_venda)
                if preco_fechamento > media_movel and posicao_atual == 'vendida' and usar_momentum:
                    alta_pos_stop = alta_pos_stop + 1
                if sinal_venda: 
                    break
            elif estrategia_nome == 'stop_loss':
                if parametros_estrategias and 'stop_loss' in parametros_estrategias:
                   stop_loss_config = parametros_estrategias['stop_loss']
                   if stop_loss_config.get('type') == 'porcetagem_valor_investido':
                       # Ajuste dinâmico do stop loss para porcentagem abaixo do preço de compra
                       preco_compra = float(log[-1]['preco']) if log else 0.0
                       stop_loss = preco_compra * (1 - stop_loss_config.get('value', 2) / 100)
                       sinal_venda = preco_fechamento < stop_loss and posicao_atual == 'comprada'
                       if preco_fechamento < stop_loss and posicao_atual == 'comprada' and usar_momentum:
                           alta_pos_stop = 0

                   elif stop_loss_config.get('type') == 'valor_definido':
                       # Caso de stop loss com valor fixo
                       stop_loss = stop_loss_config.get('value')
                       sinal_venda = preco_fechamento < stop_loss and posicao_atual == 'comprada' and usar_momentum
                       
                       if preco_fechamento < stop_loss and posicao_atual == 'comprada':
                           alta_pos_stop = 0
                       
        print("Estado atual da posição:", posicao_atual)
        print("Sinal de compra:", sinal_compra)
        print("Sinal de venda:", sinal_venda)
        print("Número de operações:", num_operacoes)
        print("Log:", log)
        # Verifica se deve usar momentum e se houve sinal de venda apos stop
        if usar_momentum and posicao_atual == 'vendida' and sinal_compra and alta_pos_stop == 0:
            sinal_compra = False
            print('Não compra')
        if sinal_compra:
            # Comprar ações
            valor_investido = quantidade_acoes * preco_fechamento
            pontos_compra.append((df.index[i], preco_fechamento))
            num_operacoes += 1
            posicao_atual = 'comprada'

            # Log de compra
            log.append({
                'data': df.index[i].strftime('%Y-%m-%d'),
                'tipo': 'compra',
                'preco': f'{preco_fechamento:.2f}',
                'quantidade_acoes': quantidade_acoes,
                'valor_investido': f'{valor_investido:.2f}',
                'valor_obtido': '0.00',
                'lucro_prejuizo': '0.00',
                'estrategia': estrategia_nome,
            })

        elif sinal_venda:
            # Vende ações apenas se o preço de fechamento estiver acima da média móvel
            valor_obtido = quantidade_acoes * preco_fechamento
            posicao_atual = 'vendida'
            pontos_venda.append((df.index[i], preco_fechamento))
            num_operacoes += 1

            # Calcula lucro ou prejuízo por ação
            lucro_prejuizo = valor_obtido - float(log[-1]['valor_investido'])
            lucro_total += lucro_prejuizo

            # Log de venda
            log.append({
                'data': df.index[i].strftime('%Y-%m-%d'),
                'tipo': 'venda',
                'preco': f'{preco_fechamento:.2f}',
                'quantidade_acoes': quantidade_acoes,
                'valor_investido': '0.00',
                'valor_obtido': f'{valor_obtido:.2f}',
                'lucro_prejuizo': f'{lucro_prejuizo:.2f}',
                'estrategia': estrategia_nome,
            })

    # Separa as coordenadas x e y dos pontos de compra e venda
    if pontos_compra:
        x_compra, y_compra = zip(*pontos_compra)
    else:
        x_compra, y_compra = [], []
    
    if pontos_venda:
        x_venda, y_venda = zip(*pontos_venda)
    else:
        x_venda, y_venda = [], []

    # Gera o gráfico com os pontos de compra e venda e a linha de média móvel
    plt.figure(figsize=(12, 6))
    plt.plot(df.index, df['Close'], label='Preço de Fechamento', color='steelblue')
    plt.scatter(x_compra, y_compra, color='g', marker='^', label='Compra', s=100)
    plt.scatter(x_venda, y_venda, color='r', marker='v', label='Venda', s=100)
    plt.plot(df.index, df['media_movel'], label='Média Móvel (9 períodos)', color='orange')
    plt.xlabel('Data')
    plt.ylabel('Preço')
    plt.title(f'Backtest [Média 9 períodos] - {ativo}')
    plt.legend(loc='best')
    plt.grid(True)
    plt.tight_layout()

    # Salva o gráfico em um buffer de memória    
    image_buffer = io.BytesIO()    
    plt.savefig(image_buffer, format='png')    
    image_buffer.seek(0)    
    image_base64 = base64.b64encode(image_buffer.read()).decode()
    
    valor_inicial = float(log[0]['valor_investido']) if log else 0.0
    valor_final = valor_inicial + lucro_total
    #valor_inicial_cdi =  df.iloc[0]['Close'] * quantidade_acoes
    resultados_cdi = calcular_lucro_cdi(data_inicial, data_final, valor_inicial)

    return {
         'lucro_total': f'{lucro_total:.2f}',
         'datas': df.index.strftime('%Y-%m-%d').tolist(),
         'preco_fechamento': df['Close'].tolist(),
         'media_movel': df['media_movel'].tolist(),
         'pontos_compra': pontos_compra,
         'pontos_venda': pontos_venda,
         'num_operacoes': num_operacoes,
         'log': log,
         'valor_inicial': f'{valor_inicial:.2f}',
         'valor_final': f'{valor_final:.2f}',
         'resultados_cdi': resultados_cdi
    }


def calcular_lucro_cdi(data_inicial, data_final, valor_inicial_cdi):
    #Obtem dados cdi 
    cdi_data = yf.download('B3SA3.SA', start=data_inicial, end=data_final)

    cdi_data_mensal = cdi_data['Adj Close'].resample('MS').first()

    valor_atual_cdi = valor_inicial_cdi
    lucro_total_cdi = 0.0

    log_taxas_anuais = []

    for i in range(len(cdi_data_mensal)-1):
        # Obtém a taxa anual do próximo mês
        taxa_anual = cdi_data_mensal.iloc[i]

        # Adiciona a taxa anual ao log
        log_taxas_anuais.append({
            'data': cdi_data_mensal.index[i].strftime('%Y-%m-%d'),
            'taxa_anual': f'{taxa_anual:.6f}',
        })

        # Calcula o lucro mensal em CDI
        lucro_mensal_cdi = taxa_anual / 100 / 12 * valor_atual_cdi

        # Acumula o lucro total
        lucro_total_cdi += lucro_mensal_cdi
        
        valor_atual_cdi += lucro_mensal_cdi

    #Calcula o valor final do investimento em CDI
    valor_final_cdi = valor_atual_cdi

    return {
        'valor_inicial_cdi': f'{valor_inicial_cdi:.2f}',
        'valor_final_cdi': f'{valor_final_cdi:.2f}',
        'lucro_total_cdi': f'{lucro_total_cdi:.2f}',
        'log_taxas_anuais': log_taxas_anuais,
    }


@app.route('/', methods=['GET'])
def hello():
    return 'Hello, World!'

@app.route('/backtest', methods=['POST'])
@cross_origin()
def run_backtest():
    data = request.get_json()

    if 'ativo' in data and 'data_inicial' in data and 'data_final' in data and 'quantidade_acoes' in data and 'periodo_media_movel' in data and 'estrategias' in data:
        ativo = data['ativo']
        data_inicial = data['data_inicial']
        data_final = data['data_final']
        quantidade_acoes = data['quantidade_acoes']
        periodo_media_movel = data['periodo_media_movel']
        estrategias = data['estrategias']
        parametros_estrategias = data['parametros_estrategias']

        result = backtesting(ativo, data_inicial, data_final, quantidade_acoes, periodo_media_movel, estrategias, parametros_estrategias)

        return jsonify(result)
    else:
        # error
        return jsonify({"error": "Parâmetros insuficientes no payload"}), 400
  
    

def obter_dados_historicos(ativo, data_inicial):
    # data final como o dia atual
    data_final = datetime.now().strftime("%Y-%m-%d")

    dados_historicos = yf.download(ativo, start=data_inicial, end=data_final)

    # data e preço de fechamento
    dados_formatados = [{"data": date.strftime("%Y-%m-%d"), "close": close} for date, close in zip(dados_historicos.index, dados_historicos['Close'])]

    return dados_formatados

def obter_precos_fechamento_tres_meses_atras(ativo):
    data_tres_meses_atras = datetime.now() - timedelta(days=90)

    #dados históricos para os últimos 3 meses
    dados_historicos_tres_meses = yf.download(ativo, start=data_tres_meses_atras.strftime("%Y-%m-%d"), end=datetime.now().strftime("%Y-%m-%d"))

    #datas e preços de fechamento
    precos_fechamento_tres_meses_atras = [{"data": date.strftime("%Y-%m-%d"), "close": close} for date, close in zip(dados_historicos_tres_meses.index, dados_historicos_tres_meses['Close'])]

    return precos_fechamento_tres_meses_atras

def prever_fechamento_lstm(ativo, data_inicial, dias_futuros):
    dados_historicos = obter_dados_historicos(ativo, data_inicial)

    #Conversao
    df = pd.DataFrame(dados_historicos)
    df['data'] = pd.to_datetime(df['data'])
    df.set_index('data', inplace=True)

    #Normalizacao
    scaler = MinMaxScaler(feature_range=(0, 1))
    dados_normalizados = scaler.fit_transform(df['close'].values.reshape(-1, 1))

    # Modelo LSTM
    treino_percentual = 0.80
    dados_treino = dados_normalizados[0:int(np.ceil(len(dados_normalizados) * treino_percentual))]
    dados_teste = dados_normalizados[int(np.ceil(len(dados_normalizados) * treino_percentual)):]

    # Criar conjuntos de treinamento e teste
    def criar_conjunto(dados, passos):
        X, Y = [], []
        for i in range(len(dados)-passos):
            X.append(dados[i:(i+passos), 0])
            Y.append(dados[i+passos, 0])
        return np.array(X), np.array(Y)

    passos = 15
    X_treino, Y_treino = criar_conjunto(dados_treino, passos)
    X_teste, Y_teste = criar_conjunto(dados_teste, passos)

    #Redimensiona os dados para LSTM [amostras, passos de tempo, características]
    X_treino = np.reshape(X_treino, (X_treino.shape[0], X_treino.shape[1], 1))
    X_teste = np.reshape(X_teste, (X_teste.shape[0], passos, 1))

    #Constroi modelo LSTM
    modelo = Sequential()
    modelo.add(LSTM(units=50, return_sequences=True, input_shape=(X_treino.shape[1], 1)))
    modelo.add(Dropout(0.2))
    modelo.add(LSTM(units=50, return_sequences=False))
    modelo.add(Dropout(0.2))
    modelo.add(Dense(units=35))
    modelo.add(Dense(units=1))

    #Compila o modelo 
    modelo.compile(optimizer='adam', loss='mean_squared_error')

    #Treino
    modelo.fit(X_treino, Y_treino, batch_size=16, epochs=10)

    #Avaliacao
    treino_ajustado = modelo.predict(X_treino)
    treino_ajustado = scaler.inverse_transform(treino_ajustado.reshape(-1, 1))
    Y_treino = scaler.inverse_transform(Y_treino.reshape(-1, 1))

    mse_treino = mean_squared_error(Y_treino, treino_ajustado)
    print(f'MSE no conjunto de treinamento: {mse_treino}')

    #Previsao
    previsoes = []
    X_teste_atual = dados_teste[-passos:]
    for i in range(dias_futuros):
        X_teste_atual = np.reshape(X_teste_atual, (1, X_teste_atual.shape[0], 1))
        predicao = modelo.predict(X_teste_atual)
        predicao = scaler.inverse_transform(predicao.reshape(-1, 1))
        previsoes.append(predicao[0, 0])
        X_teste_atual = np.concatenate((X_teste_atual[0], predicao[0, 0]), axis=None)
        X_teste_atual = X_teste_atual[-passos:]

    #Cria um índice de datas para as previsões
    datas_futuras = [df.index[-1] + timedelta(days=i) for i in range(1, dias_futuros + 1)]

    previsoes_df = pd.DataFrame({'data': datas_futuras, 'previsao_close': previsoes})
    previsoes_df.set_index('data', inplace=True)

    #Extrai dados históricos dos últimos 3 meses (resposta e montagem de grafico)
    dados_tres_meses = obter_precos_fechamento_tres_meses_atras(ativo)

    df_tres_meses = pd.DataFrame(dados_tres_meses)
    df_tres_meses['data'] = pd.to_datetime(df_tres_meses['data'])
    df_tres_meses.set_index('data', inplace=True)

    #Converte arrays NumPy para listas Python
    historico_tres_meses_array = [{"data": date.strftime("%Y-%m-%d"), "fechamento": float(close)} for date, close in zip(df_tres_meses.index, df_tres_meses['close'])]
    previsoes_array = [{"data": date.strftime("%Y-%m-%d"), "previsao_close": float(previsao)} for date, previsao in zip(previsoes_df.index, previsoes)]
    
    return {
        'historico': historico_tres_meses_array,
        'previsoes': previsoes_array,
    }
  
def prever_fechamento_sarima(ticker, start_date, dias_a_prever):
    end_date = datetime.now().strftime('%Y-%m-%d')
    
    data = yf.download(ticker, start=start_date, end=end_date)

    #Aplica modelo SARIMA aos dados
    modelo = SARIMAX(data['Close'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
    resultado = modelo.fit()

    #Previsao para X periodos
    previsoes = resultado.get_forecast(steps=dias_a_prever)

    #intervalos de confiança
    #intervalo_confianca = previsoes.conf_int()

    #Retorno para as datas futuras
    datas_futuras = pd.date_range(start=data.index[-1], periods=dias_a_prever + 1, freq='B')[1:]
    
    

    dados_historicos = {
        'datas_historicas': data.index.strftime('%Y-%m-%d').tolist(),
        'preco_fechamento_historico': data['Close'].tolist(),
        # 'media_movel_historica': data['MediaMovel'].tolist(),
    }

    dados_previsao = {
        'datas_previsao': datas_futuras.strftime('%Y-%m-%d').tolist(),
        'previsao_preco_fechamento': previsoes.predicted_mean.tolist(),
        # 'intervalo_confianca_inf': intervalo_confianca.iloc[:, 0].tolist(),
        # 'intervalo_confianca_sup': intervalo_confianca.iloc[:, 1].tolist()
    }

    dados_json = {**dados_historicos, **dados_previsao}

    return dados_json

def prever_backtest_sarima(ticker, start_date, end_date, dias_futuros):
    try:
        print("Baixando dados históricos...")
        data = yf.download(ticker, start=start_date, end=end_date)
        print("Dados históricos baixados com sucesso.")

        print("Ajustando modelo SARIMAX...")
        modelo = SARIMAX(data['Close'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12))
        resultado = modelo.fit()
        print("Modelo SARIMAX ajustado com sucesso.")

        print("Realizando previsões...")
        previsoes = resultado.get_forecast(steps=dias_futuros)
        print("Previsões realizadas com sucesso.")

        # Gerar datas de previsão
        datas_previsao = pd.date_range(start=data.index[-1] + timedelta(days=1), periods=dias_futuros, freq='B')

        # Determinar intervalo de dados reais
        data_real_inicio = datas_previsao[0]
        data_real_fim = datas_previsao[-1]

        print("Baixando dados reais para o período de previsão...")
        data_real = yf.download(ticker, start=data_real_inicio, end=data_real_fim)
        print("Dados reais baixados com sucesso.")

        preco_fechamento_real = data_real['Close'].reindex(datas_previsao).fillna(method='ffill')

        # Calcular métricas de erro
        mae = mean_absolute_error(previsoes.predicted_mean, preco_fechamento_real)
        mse = mean_squared_error(previsoes.predicted_mean, preco_fechamento_real)
        rmse = np.sqrt(mse)
        mape = mean_absolute_percentage_error(previsoes.predicted_mean, preco_fechamento_real)

        # Calcular a tendência e a taxa de acerto da tendência
        tendencia_prevista = np.sign(np.diff(previsoes.predicted_mean))
        tendencia_real = np.sign(np.diff(preco_fechamento_real))

        acertos_tendencia = np.sum(tendencia_prevista == tendencia_real)
        percentual_acerto_tendencia = acertos_tendencia / len(tendencia_real) if len(tendencia_real) > 0 else 0
        
        # Previsão do modelo naive
        previsao_naive = data['Close'].iloc[-1]
        mae_naive = mean_absolute_error(preco_fechamento_real, [previsao_naive] * dias_futuros)

        # Avaliação de desempenho
        limites = {"mae": 1.5, "rmse": 2.5, "mape": 0.2, "tendencia": 0.7}
        desempenho = "Satisfatório" if (mae <= limites["mae"] and rmse <= limites["rmse"] and 
                                        mape <= limites["mape"] and percentual_acerto_tendencia >= limites["tendencia"]) else "Insatisfatório"

        # Plotar resultados
        plt.figure(figsize=(10, 6))
        plt.plot(datas_previsao, preco_fechamento_real, label='Preço Real')
        plt.plot(datas_previsao, previsoes.predicted_mean, label='Previsão SARIMA', linestyle='--')
        plt.xlabel('Data')
        plt.ylabel('Preço de Fechamento')
        plt.title(f'Previsões e Preços Reais para {ticker}')
        plt.legend()
        plt.show()

        # Retornar resultados como JSON
        response = {
            "datas_previsao": datas_previsao.strftime('%Y-%m-%d').tolist(),
            "preco_fechamento_real": preco_fechamento_real.tolist(),
            "previsao_preco_fechamento": previsoes.predicted_mean.tolist(),
            "mae": mae,
            "rmse": rmse,
            "mape": mape,
            "mae_naive": mae_naive,
            "percentual_acerto_tendencia": percentual_acerto_tendencia,
            "desempenho": desempenho
        }

        return jsonify(response), 200

    except Exception as e:
        print("Erro:", e)
        
@app.route('/previsao', methods=['POST'])
@cross_origin()
def run_previsor():
    data = request.get_json()
    
    if 'ativo' in data and 'data_inicial' in data and 'dias_futuros' in data and 'tipo_previsao' in data and 'modelo' in data:
        ativo = data['ativo']
        data_inicial = data['data_inicial']
        dias_futuros = data['dias_futuros']
        tipo_previsao = data['tipo_previsao']
        modelo = data['modelo']

        if tipo_previsao == 'previsao_backtest':
            data_final = data.get('data_final')
            
            if modelo == 'SARIMA':
                result = prever_backtest_sarima(ativo, data_inicial, data_final, dias_futuros)
                return result
            else:
                return jsonify({"error": "Modelo não reconhecido"}), 400
                
        elif tipo_previsao == 'previsao_fechamento':
            if modelo == 'SARIMA':
                result = prever_fechamento_sarima(ativo, data_inicial, dias_futuros)
            elif modelo == 'LSTM':
                result = prever_fechamento_lstm(ativo, data_inicial, dias_futuros)
            else:
                return jsonify({"error": "Modelo não reconhecido"}), 400
        else:
            return jsonify({"error": "Tipo de previsão não reconhecido"}), 400

        return jsonify(result), 200
    else:
        # return error 
        return jsonify({"error": "Parâmetros insuficientes no payload"}), 400



if __name__ == '__main__':
    app.run(port=5000)

