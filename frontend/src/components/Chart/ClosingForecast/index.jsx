/* eslint-disable react/prop-types */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

// eslint-disable-next-line react/prop-types
const ClosingForecastChart = ({ data, ativoNome }) => {
  const dadosCompletos = [
    ...data?.historico?.map(item => ({
        data: item.data,
        'Preço de Fechamento': item.fechamento,
        key: `historico_${item.data}`,
    })) || [],
    ...data?.previsoes?.map(item => ({
        data: item.data,
        'Previsão de Fechamento': item.previsao_close,
        key: `previsao_${item.data}`,
    })) || [],
];
  return (
    <LineChart width={800} height={400} data={dadosCompletos}>
      <XAxis dataKey="data" tickFormatter={(value) => moment(value).format('DD/MM/YYYY')} />
      <YAxis domain={['auto', 'auto']} />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Preço de Fechamento" stroke="steelblue" />
      <Line type="monotone" dataKey="Previsão de Fechamento" stroke="green" />
      <text x={400} y={30} textAnchor="middle" fontSize="16" fill="#666">{`Gráfico de Previsão de Fechamento - ${ativoNome}`}</text>

    </LineChart>
  );
};

export default ClosingForecastChart;
