/* eslint-disable react/prop-types */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

const BacktestChart = ({ resultado, ativoNome, periodo }) => {
    const CustomizedDot = (props) => {
        const { cx, cy, payload } = props;

        if (payload?.Tipo === 'compra' && resultado.log.some(log => log.data === payload?.date)) {
            return (
                <svg key={`compra-${payload?.date}`} x={cx - 10} y={cy - 10} width={20} height={20} fill="green" viewBox="0 0 24 24">
                    <path d="M12 2L1 13h6v9h10v-9h6z" />
                </svg>
            );
        }

        if (resultado.log.some(log => log.data === payload?.date) && payload?.Tipo === 'venda') {
            return (
                <svg key={`venda-${payload?.date}`} x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 24 24">
                    <path d="M12 22L23 11h-6V2H7v9H1l11 11z" />
                </svg>
            );
        }

        return null;
    };


    const getType = (date) => {
        const index = resultado.log.findIndex((log) => log.data === date);
        return resultado.log[index] ? resultado.log[index].tipo : false;
    };

    const renderCustomLegend = () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ color: 'steelblue', marginRight: '5px' }}>Preço de Fechamento</span>
                {/* <span style={{ marginLeft: 10, color: 'orange', marginRight: '5px' }}>Média Móvel ({periodo} períodos)</span> */}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                    <svg width="22" height="22" fill="green">
                        <path d="M12 2L1 13h6v9h10v-9h6z" />
                    </svg>
                    <span style={{ marginLeft: '5px', marginRight: '5px' }}>Compra</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="22" height="22" fill="red">
                        <path d="M12 22L23 11h-6V2H7v9H1l11 11z" />
                    </svg>
                    <span style={{ marginLeft: '5px' }}>Venda</span>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <LineChart
                width={800}
                height={400}
                data={resultado.datas.map((date, index) => ({
                    date,
                    'Preço de Fechamento': resultado.preco_fechamento[index],
                    'Média Móvel': isNaN(resultado.media_movel[index]) ? 0 : resultado.media_movel[index],
                    'Tipo': getType(date),
                })).filter(item => !isNaN(item['Média Móvel']))}
            >
                <XAxis dataKey="date" tickFormatter={(value) => moment(value).format('DD/MM/YYYY')} />
                <YAxis domain={['auto', 'auto']} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />

                <Legend
                    content={() =>
                        renderCustomLegend()
                    }
                />

                <Line type="monotone" dataKey="Preço de Fechamento" stroke="steelblue" dot={CustomizedDot} name="Preço de Fechamento" />
                {/* <Line type="monotone" dataKey="Média Móvel" stroke="orange" name="Média Móvel" /> */}
                <text x={400} y={30} textAnchor="middle" fontSize="16" fill="#666">{`Gráfico de Backtest [Média ${periodo} períodos] - ${ativoNome}`}</text>
            </LineChart>

        </div>
    );
};

export default BacktestChart;