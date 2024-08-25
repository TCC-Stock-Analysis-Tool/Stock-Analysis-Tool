import { useState } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    FormControl,
    Autocomplete,
    Box,
    CircularProgress,
} from '@mui/material';


import moment from 'moment';
import BacktestChart from '../../components/Chart/Backtest';
import { AlertComponent } from '../../components/Alert';

const listaDeAtivos = [
    'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA', 'B3SA3.SA', 'AZUL4.SA',
    'WEGE3.SA', 'GOLL4.SA', 'VVAR3.SA', 'MGLU3.SA', 'RADL3.SA', 'ITSA4.SA', 'BBAS3.SA',
    'FLRY3.SA', 'USIM5.SA', 'CPFE3.SA', 'CMIG4.SA', 'LREN3.SA', 'EGIE3.SA',
    'CVCB3.SA', 'SUZB3.SA', 'BBSE3.SA', 'TIMP3.SA', 'ENBR3.SA', 'HYPE3.SA', 'BRFS3.SA',
    'MULT3.SA', 'MRFG3.SA', 'CSNA3.SA', 'IRBR3.SA', 'QUAL3.SA', 'KLBN11.SA', 'BRML3.SA',
    'BTOW3.SA', 'JBSS3.SA', 'ECOR3.SA', 'SBSP3.SA', 'GOAU4.SA', 'CIEL3.SA', 'EMBR3.SA',
    'GGBR4.SA', 'CPLE6.SA', 'ELET3.SA', 'ELET6.SA', 'VIVT4.SA', 'PCAR3.SA',
    'PETR3.SA'
];

export const BacktestPage = () => {
    const [ativo, setAtivo] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [quantidadeAcoes, setQuantidadeAcoes] = useState('');
    const [periodoMediaMovel, setPeriodoMediaMovel] = useState('');
    const [estrategias, setEstrategias] = useState(['cruzamento']);
    const [stopLoss, setStopLoss] = useState('');
    const [tipoStopLoss, setTipoStopLoss] = useState('');
    const [ativoBusca, setAtivoBusca] =  useState('');
    const [periodoBusca, setPeriodoBusca] = useState('')

    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);

    const [ativoError, setAtivoError] = useState('');
    const [quantidadeAcoesError, setQuantidadeAcoesError] = useState('');
    const [dataInicialError, setDataInicialError] = useState('');
    const [dataFinalError, setDataFinalError] = useState('');
    const [stopLossError, setStopLossError] = useState('');
    const [estrategiasError, setEstrategiasError] = useState('');
    const [periodoMediaMovelError, setPeriodoMediaMovelError] = useState('');
    const [requestError, setRequestError] = useState(false);

    const isSmallScreen = window.innerWidth < 600;

    const handleEstrategiasChange = (event, newValue) => {
        if (!newValue.includes('cruzamento')) {
            newValue.push('cruzamento');
        }

        if(newValue.includes('momentum_negativo') && !newValue.includes('stop_loss')) {
            newValue.push('stop_loss')
        }

        setEstrategias(newValue);
    };
    
    const validateInput = () => {
        setAtivoError('');
        setQuantidadeAcoesError('');
        setDataInicialError('');
        setDataFinalError('');
        setStopLossError('');
        setEstrategiasError('');
        setPeriodoMediaMovelError('');

        if (!ativo) {
            setAtivoError('Preencha este campo.');
        }

        if (!quantidadeAcoes) {
            setQuantidadeAcoesError('Preencha este campo.');
        } else if (quantidadeAcoes <= 0) {
            setQuantidadeAcoesError('A quantidade de ações deve ser maior que zero.');
        }

        if (!dataInicial) {
            setDataInicialError('Preencha este campo.');
        }

        if (!dataFinal) {
            setDataFinalError('Preencha este campo.');
        }

        if (estrategias.length === 0) {
            setEstrategiasError('Preencha este campo.');
        }

        if (estrategias.some(str => str === 'stop_loss') && !stopLoss) {
            setStopLossError('Preencha este campo.');
        } else if (estrategias.some(str => str === 'stop_loss') && stopLoss <= 0) {
            setStopLossError('O valor do Stop Loss deve ser maior que zero.');
        }

        if (estrategias.some(str => str === 'stop_loss') && !tipoStopLoss) {
            setStopLossError('Preencha este campo.');
        }

        if (!periodoMediaMovel || periodoMediaMovel <= 0) {
            setPeriodoMediaMovelError('Preencha este campo com um valor maior que zero.');
        }

        if (
            !ativo ||
            !quantidadeAcoes ||
            !dataInicial ||
            !dataFinal ||
            !estrategias ||
            !periodoMediaMovel || estrategias.some(str => str === 'stop_loss') && !stopLoss ||
            estrategias.length === 0 ||
            estrategias.some(str => str === 'stop_loss') && !tipoStopLoss
        ) {
            return false;
        }
        return true;

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setResultado(null)
            if (!validateInput()) return;
            setLoading(true);
            const response = await axios.post('http://localhost:5000/backtest', {
                ativo,
                data_inicial: dataInicial,
                data_final: dataFinal,
                quantidade_acoes: Number(quantidadeAcoes),
                periodo_media_movel: Number(periodoMediaMovel),
                estrategias,
                parametros_estrategias: {
                    stop_loss: { type: tipoStopLoss, value: Number(stopLoss) },
                },
            });

            setAtivoBusca(ativo);
            setPeriodoBusca(periodoMediaMovel);

            const sanitizedData = response.data.replace(/NaN/g, 'null');
            const responseData = JSON.parse(sanitizedData);

            setResultado(responseData);

        } catch (error) {
            setRequestError(true)

            console.error('Erro na solicitação:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (resultado && resultado.log.length > 0) {
            const fileName = `Backtest_Log_${ativo}_${dataInicial}_${dataFinal}.csv`;
            const csvContent = "Data,Tipo,Preço,Quantidade Ações,Valor Investido,Valor Obtido,Lucro/Prejuízo\n" +
                resultado.log.map(item => {
                    const valorInvestido = item.valor_investido;
                    const valorObtido = item.valor_obtido
                    const lucroPrejuizo = item.lucro_prejuizo;
                    return `${moment(item.data).format('DD/MM/YYYY')},${item.tipo},${item.preco},${item.quantidade_acoes},${valorInvestido},${valorObtido},${lucroPrejuizo}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            console.warn('Nenhum log para exportar.');
        }
    };

    return (
        <Container maxWidth="sm">
            <AlertComponent
                open={requestError}
                message={'Erro ao realizar backtest.Tente novamente!'}
                severity="error"
                onClose={() => setRequestError(false)} />

            <Typography variant="h5" align="center" gutterBottom>
                Backtest de Médias Móveis
            </Typography>
            <Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                value={ativo}
                                onChange={(event, newValue) => setAtivo(newValue)}
                                options={listaDeAtivos}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        label="Ativo"
                                        id="ativo"
                                        variant="standard"
                                        error={Boolean(ativoError)}
                                        helperText={ativoError}
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                            Data Inicial *
                        </Typography>
                        <TextField
                            required
                            fullWidth
                            type="date"
                            variant="standard"
                            value={dataInicial}
                            onChange={(e) => setDataInicial(e.target.value)}
                            error={Boolean(dataInicialError)}
                            helperText={dataInicialError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                            Data Final *
                        </Typography>
                        <TextField
                            required
                            fullWidth
                            type="date"
                            variant="standard"
                            value={dataFinal}
                            onChange={(e) => setDataFinal(e.target.value)}
                            error={Boolean(dataFinalError)}
                            helperText={dataFinalError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Quantidade de Ações"
                            value={quantidadeAcoes}
                            variant="standard"
                            type='number'
                            onChange={(e) => setQuantidadeAcoes(e.target.value)}
                            error={Boolean(quantidadeAcoesError)}
                            helperText={quantidadeAcoesError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Período da Média Móvel"
                            value={periodoMediaMovel}
                            variant="standard"
                            type='number'
                            onChange={(e) => setPeriodoMediaMovel(e.target.value)}
                            error={Boolean(periodoMediaMovelError)}
                            helperText={periodoMediaMovelError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                multiple
                                value={estrategias}
                                onChange={handleEstrategiasChange}
                                options={['cruzamento', 'stop_loss', 'momentum_negativo']}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        label="Estratégias"
                                        id="estrategias"
                                        variant="standard"
                                        error={Boolean(estrategiasError)}
                                        helperText={estrategiasError}
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    {estrategias.some(str => str === 'stop_loss') && <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                value={tipoStopLoss}
                                onChange={(event, newValue) => setTipoStopLoss(newValue)}
                                options={['valor_definido', 'porcetagem_valor_investido']}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        label="Tipo de Stop Loss"
                                        id="tipoStopLoss"
                                        variant="standard"
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    }

                    {estrategias.some(str => str === 'stop_loss') && <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Valor Stop Loss"
                            value={stopLoss}
                            variant="standard"
                            type='number'
                            onChange={(e) => setStopLoss(e.target.value)}
                            error={Boolean(stopLossError)}
                            helperText={stopLossError}
                        />
                    </Grid>}
                </Grid>
                <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    onClick={async (e) => await handleSubmit(e)}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Executar Backtest'}

                </Button>
            </Grid>

            {resultado && (
                <Box mt={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Resultados:
                            </Typography>
                            <Typography variant="body1">Média Móvel</Typography>
                            <hr />
                            <Typography variant="body1">Número de Operações: {resultado.num_operacoes}</Typography>
                            <Typography variant="body1">Valor Inicial: ${resultado.valor_inicial}</Typography>
                            <Typography variant="body1">
                                Valor Final: ${resultado.valor_final}

                            </Typography>
                            <Typography variant="body1">
                                {resultado.lucro_total >= 0 ? 'Lucro: ' : 'Prejuízo: '}
                                <span style={{ color: resultado.lucro_total >= 0 ? 'green' : 'red' }}>
                                    <b>${Math.abs(resultado.lucro_total)}</b>
                                </span>
                            </Typography>
                            <hr />
                            <Typography variant="body1">CDI</Typography>
                            <hr />
                            <Typography variant="body1">Valor Inicial: ${resultado.resultados_cdi.valor_inicial_cdi}</Typography>
                            <Typography variant="body1">
                                Valor Final: ${resultado.resultados_cdi.valor_final_cdi}

                            </Typography>
                            <Typography variant="body1">
                                {resultado.resultados_cdi.lucro_total_cdi >= 0 ? 'Lucro: ' : 'Prejuízo: '}
                                <span style={{ color: resultado.resultados_cdi.lucro_total_cdi >= 0 ? 'green' : 'red' }}>
                                    <b>${Math.abs(resultado.resultados_cdi.lucro_total_cdi)}</b>
                                </span>
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="outlined"
                                color="success"
                                onClick={handleExportCSV}
                            >
                                Exportar Logs
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => setResultado(null)}>
                                Limpar Resultados
                            </Button>
                        </CardActions>
                    </Card>

                    <Box
                        mt={3}
                        height={400}
                        width={800}
                        sx={{
                            overflow: isSmallScreen ? 'auto' : 'hidden',

                        }}
                        marginLeft={isSmallScreen ? -10 : -19}
                    >
                        {resultado && <BacktestChart resultado={resultado} ativoNome={ativoBusca} periodo={periodoBusca} />}
                    </Box>
                </Box>
            )}

        </Container>
    );
}

export default BacktestPage;
