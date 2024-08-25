/* eslint-disable react/prop-types */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

const MovingAverageForecastChart = ({ data, ativoNome }) => {
    const {
        datas_historicas,
        preco_fechamento_historico,
        previsao_preco_fechamento,
        datas_previsao,
    } = data;

    if (
        datas_historicas?.length &&
        preco_fechamento_historico?.length &&
        previsao_preco_fechamento?.length &&
        datas_previsao?.length &&
        preco_fechamento_historico.length === datas_historicas.length &&
        previsao_preco_fechamento.length === datas_previsao.length
    ) {
        console.log(data);

        const chartData = datas_historicas.map((data, index) => ({
            data: moment(data).format('DD-MM-YYYY'),
            'Preço de Fechamento': preco_fechamento_historico[index],
            key: index,
        }));

        const previsao = datas_previsao.map((data, index) => {
            const previsaoPrecoFechamento = previsao_preco_fechamento[index];
            return {
                data: moment(data).format('DD-MM-YYYY'),
                'Preço de Fechamento Previsao': previsaoPrecoFechamento,
                key: index + 100
            };
        });

        const combinedChartData = [...chartData, ...previsao];

        return (
            <LineChart width={800} height={400} data={combinedChartData}>
                <XAxis dataKey="data" tickFormatter={(value) => moment(value, 'DD-MM-YYYY').format('DD/MM/YYYY')} />
                <YAxis domain={['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Preço de Fechamento" stroke="steelblue" />
                <Line type="monotone" dataKey="Preço de Fechamento Previsao" stroke="orange" />
                <text x={400} y={30} textAnchor="middle" fontSize="16" fill="#666">{`Gráfico de Previsão de Fechamento - ${ativoNome}`}</text>
            </LineChart>
        );
    }
};

export default MovingAverageForecastChart;
