/* eslint-disable react/prop-types */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

const BacktestPredict = ({ data , ativoNome}) => {
    const {
        preco_fechamento_real,
        datas_previsao,
        previsao_preco_fechamento,

    } = data;

    if (datas_previsao?.length && preco_fechamento_real?.length && previsao_preco_fechamento?.length) {
        const chartData = datas_previsao.map((data, index) => ({
            data: moment(data).format('DD-MM-YYYY'),
            'Preço de Fechamento Real': preco_fechamento_real[index],
            'Preço de Fechamento Previsto': previsao_preco_fechamento[index],
            key: index,
        }));

        const minY = Math.min(...preco_fechamento_real, ...previsao_preco_fechamento);
        const maxY = Math.max(...preco_fechamento_real, ...previsao_preco_fechamento);

        const margemPercentual = 0.1;
        const delta = (maxY - minY) * margemPercentual;

        const novoMinY = minY - delta;
        const novoMaxY = maxY + delta;

        const formatYTick = (tick) => tick.toFixed(0);

        return (
            <LineChart width={800} height={400} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" tickFormatter={(value) => moment(value, 'DD-MM-YYYY').format('DD/MM/YYYY')} />
                <YAxis
                    domain={[novoMinY, novoMaxY]}
                    tickFormatter={formatYTick}
                    width={50}
                    tick={{ padding: 0 }}
                />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="Preço de Fechamento Real"
                    stroke="steelblue"
                    strokeWidth={3}
                    dot={{ stroke: 'steelblue', strokeWidth: 2, r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="Preço de Fechamento Previsto"
                    stroke="orange"
                    strokeWidth={3}
                    dot={{ stroke: 'orange', strokeWidth: 2, r: 4 }}
                />
                <text x={400} y={30} textAnchor="middle" fontSize="16" fill="#666">Gráfico de Previsão de Fechamento - {ativoNome}</text>
            </LineChart>
        );
    }

    return null;
};

export default BacktestPredict;
