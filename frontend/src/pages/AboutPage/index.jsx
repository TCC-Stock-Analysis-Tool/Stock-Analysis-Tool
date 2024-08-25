import { Container, Typography, Paper } from '@mui/material';

const AboutPage = () => {
    return (
        <Container maxWidth="md" style={{ marginTop: '20px' }}>
            <Paper elevation={2} style={{ padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Sobre esta aplicação
                </Typography>
                            
                <Typography variant="body1" paragraph>
                    Esta aplicação envolve a implementação de estratégias de backtest e modelos de previsão. Essas estratégias e modelos são aplicados aos dados históricos do mercado financeiro para avaliação de desempenho e previsão de preços futuros.
                </Typography>
                {/* Seção sobre Backtest */}
                <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                    Backtest
                </Typography>
                <Typography variant="body1" paragraph>
                    O backtest é uma técnica usada para avaliar a performance de uma estratégia de investimento utilizando dados históricos. Nesta aplicação, realizamos backtest para avaliar o desempenho de estratégias de investimento, como a média móvel e stop loss.
                </Typography>

                {/* Seção sobre Média Móvel */}
                <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                    Média Móvel
                </Typography>
                <Typography variant="body1" paragraph>
                A média móvel, uma ferramenta comum na análise financeira, suaviza flutuações ao calcular a média dos preços de fechamento em um período específico. Se o preço atual está acima dessa média, sugere uma tendência de alta, indicando uma oportunidade de venda. Por outro lado, se o preço está abaixo da média, pode indicar uma tendência de baixa, sugerindo uma oportunidade de compra. Essa estratégia facilita a tomada de decisões no mercado, com a venda associada a preços acima da média e a compra a preços abaixo dela.
                </Typography>

                {/* Seção sobre Stop Loss */}
                <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                    Stop Loss
                </Typography>
                <Typography variant="body1" paragraph>
                    O stop loss é uma ordem colocada para vender automaticamente uma posição quando o preço atinge um determinado nível. Essa estratégia visa proteger o investidor contra perdas significativas em movimentos adversos do mercado. No código, o stop loss é utilizado para controlar o risco, limitando as perdas em situações desfavoráveis.
                </Typography>

                {/* Seção sobre Previsão */}
                <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
                    Previsão
                </Typography>
                <Typography variant="body1" paragraph>
                    A previsão envolve o uso de modelos para estimar valores futuros com base em dados históricos. Esta aplicação realiza previsões de preços usando métodos como LSTM (Long Short-Term Memory) e SARIMA (Seasonal AutoRegressive Integrated Moving Average).
                </Typography>
            </Paper>
        </Container>
    );
};

export default AboutPage;