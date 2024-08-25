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
    FormControl,
    Autocomplete,
    Box,
    CardActions,
    CircularProgress,

} from '@mui/material';


import moment from 'moment';
import ClosingForecastChart from '../../components/Chart/ClosingForecast';
import MovingAverageForecastChart from '../../components/Chart/MovingAverageForecast';
import { AlertComponent } from '../../components/Alert';
import BacktestPredict from '../../components/Chart/Backtest_Predict';


const listaDeAtivos = ['BOVA11.SA', 'SMAL11.SA', 'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA', 'B3SA3.SA', 'AZUL4.SA', 'WEGE3.SA', 'GOLL4.SA', 'VVAR3.SA', 'MGLU3.SA', 'RADL3.SA', 'ITSA4.SA', 'BBAS3.SA', 'FLRY3.SA', 'USIM5.SA', 'CPFE3.SA', 'CMIG4.SA', 'LREN3.SA', 'EGIE3.SA', 'CVCB3.SA', 'SUZB3.SA', 'BBSE3.SA', 'TIMP3.SA', 'ENBR3.SA', 'HYPE3.SA', 'BRFS3.SA', 'MULT3.SA', 'MRFG3.SA', 'CSNA3.SA', 'IRBR3.SA', 'QUAL3.SA', 'KLBN11.SA', 'BRML3.SA', 'BTOW3.SA', 'JBSS3.SA', 'ECOR3.SA', 'SBSP3.SA', 'GOAU4.SA', 'CIEL3.SA', 'EMBR3.SA', 'GGBR4.SA', 'CPLE6.SA', 'ELET3.SA', 'ELET6.SA', 'VIVT4.SA', 'PCAR3.SA', 'PETR3.SA'];

const PredictionsPage = () => {
    const [ativo, setAtivo] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [diasFuturos, setDiasFuturos] = useState('');
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tipoPrevisao, setTipoPrevisao] = useState('');
    const [modelo, setModelo] = useState('');

    const [ativoError, setAtivoError] = useState('');
    const [dataInicialError, setDataInicialError] = useState('');
    const [dataFinalError, setDataFinalError] = useState('');
    const [diasFuturosError, setDiasFuturosError] = useState('');
    const [tipoPrevisaoError, setTipoPrevisaoError] = useState('');
    const [modeloError, setModeloError] = useState('');
    const [requestError, setRequestError] = useState(false);
    const [ativoBusca, setAtivoBusca] = useState('');

    const isSmallScreen = window.innerWidth < 600;

    const handleAutocompleteChange = (event, newValue) => {
        setAtivo(newValue);
    };

    const handleDateChange = (e) => {
        setDataInicial(e.target.value);
    };

    const handleDaysChange = (e) => {
        setDiasFuturos(e.target.value);
    };

    const validateInput = () => {
        setAtivoError('');
        setDataInicialError('');
        setDiasFuturosError('');
        setTipoPrevisaoError('');
        setModeloError('');
        setDataFinalError('')


        if (!ativo) {
            setAtivoError('Preencha este campo.');
        }
        if (!dataInicial) {
            setDataInicialError('Preencha este campo.');
        }
        if (!diasFuturos) {
            setDiasFuturosError('Preencha este campo.');
        }
        if (!tipoPrevisao) {
            setTipoPrevisaoError('Preencha este campo.');
        }
        if (!modelo) {
            setModeloError('Preencha este campo.');
        }

        if (tipoPrevisao === "previsao_backtest" && !dataFinal) {
            setDataFinalError("Preencha este campo.")
        }

        if (!ativo || !dataInicial || !diasFuturos || !tipoPrevisao || !modelo ||
            tipoPrevisao === "previsao_backtest" && !dataFinal) {
            return false;
        }
        return true;

    }

    const handlePrediction = async () => {
        try {
            setResultado(null)
            if (!validateInput()) return;
            setLoading(true)

            const response = await axios.post('http://localhost:5000/previsao', {
                ativo,
                data_inicial: dataInicial,
                dias_futuros: Number(diasFuturos),
                tipo_previsao: tipoPrevisao,
                modelo: modelo,
                data_final: dataFinal
            });

            setAtivoBusca(ativo);
            console.log(response)
            setResultado(response.data);

        } catch (error) {
            console.error('Erro na solicitação:', error.message);
            setRequestError(true)
        } finally {
            setLoading(false)
        }
    };

    const handleExportCloseCSV = () => {
        if (resultado && resultado.previsoes.length > 0) {
            const fileName = `Previsao_${ativo}_${moment(resultado.previsoes[0].data).format('DD/MM/YYYY')}_to_${moment(resultado.previsoes[resultado.previsoes.length - 1].data).format('DD/MM/YYYY')}.csv`;
            const csvContent = "Data, Preco Previsao\n" +
                resultado.previsoes.map(item => {
                    const formattedDate = moment(item.data).format('DD/MM/YYYY');
                    const formattedValue = item.previsao_close.toFixed(2);
                    return `${formattedDate},${formattedValue}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            console.warn('Nenhuma previsão para exportar.');
        }
    };

    const handleExportSarimaBacktestLogsCSV = () => {
        const { datas_previsao, preco_fechamento_real, previsao_preco_fechamento } = resultado;

        if (datas_previsao && datas_previsao.length > 0) {
            const fileName = `Previsao_Backtest_Sarima_Logs_${ativo}_${datas_previsao[0]}_to_${datas_previsao[datas_previsao.length - 1]}.csv`;

            const csvContent = "Data,Preco Real,Preco Previsao\n" +
                datas_previsao.map((date, index) => {
                    const formattedDate = moment(date).format('DD/MM/YYYY');
                    const precoReal = preco_fechamento_real[index].toFixed(2);
                    const precoPrevisao = previsao_preco_fechamento[index].toFixed(2);
                    return `${formattedDate},${precoReal},${precoPrevisao || 'N/A'}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            console.warn('Nenhuma previsão de preço de fechamento para exportar.');
        }
    };

    const handleExportSarimaLogsCSV = () => {
        console.log(resultado)
        const { datas_previsao, previsao_preco_fechamento } = resultado;

        if (datas_previsao && datas_previsao.length > 0) {
            const fileName = `Previsao_Sarima_Logs_${ativo}_${datas_previsao[0]}_to_${datas_previsao[datas_previsao.length - 1]}.csv`;

            const csvContent = "Data,Preco Previsao\n" +
                datas_previsao.map((date, index) => {
                    const formattedDate = moment(date).format('DD/MM/YYYY');
                    const previsaoPrecoFechamento = previsao_preco_fechamento[index].toFixed(2);
                    return `${formattedDate},${previsaoPrecoFechamento || 'N/A'}`;
                }).join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        } else {
            console.warn('Nenhuma previsão de preço de fechamento para exportar.');
        }
    };


    const handleExportCsv = () => {
        if (tipoPrevisao === 'previsao_fechamento') {
            modelo === 'SARIMA' ? handleExportSarimaLogsCSV() : handleExportCloseCSV()
        } else {
            handleExportSarimaBacktestLogsCSV()
        }
    }

    return (
        <Container maxWidth="sm">
            <AlertComponent
                open={requestError}
                message={'Erro ao realizar backtest.Tente novamente!'}
                severity="error"
                onClose={() => setRequestError(false)} />
            <Typography variant="h5" align="center" gutterBottom>
                Previsões nos Preços de Ativos
            </Typography>
            <Grid>
                {/* Formulário para preenchimento de dados */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                value={tipoPrevisao}
                                onChange={(event, newValue) => {
                                    setTipoPrevisao(newValue);
                                    setResultado(null);
                                    setModelo('')
                                }}
                                options={['previsao_fechamento', 'previsao_backtest']}
                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        label="Tipo de previsão"
                                        id="estrategias"
                                        variant="standard"
                                        error={Boolean(tipoPrevisaoError)}
                                        helperText={tipoPrevisaoError}
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                value={ativo}
                                onChange={handleAutocompleteChange}
                                options={listaDeAtivos}
                                getOptionLabel={(option) => option}
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
                            onChange={handleDateChange}
                            error={Boolean(dataInicialError)}
                            helperText={dataInicialError}
                        />
                    </Grid>
                    {tipoPrevisao && tipoPrevisao === 'previsao_backtest' && <Grid item xs={12}>
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
                    }
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Dias Futuros"
                            value={diasFuturos}
                            variant="standard"
                            type="number"
                            onChange={handleDaysChange}
                            error={Boolean(diasFuturosError)}
                            helperText={diasFuturosError}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth required>
                            <Autocomplete
                                value={modelo}
                                onChange={(event, newValue) => {
                                    setModelo(newValue);
                                    setResultado(null);
                                }}
                                options={tipoPrevisao === "previsao_fechamento" ? ['SARIMA', 'LSTM'] : ['SARIMA']}

                                renderInput={(params) => (
                                    <TextField
                                        required
                                        {...params}
                                        label="Modelo"
                                        id="modelo"
                                        variant="standard"
                                        error={Boolean(modeloError)}
                                        helperText={modeloError}
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>
                </Grid>
                {/* Botão para executar a previsão */}
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    onClick={handlePrediction}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Executar Previsão'}
                </Button>
            </Grid>

            {resultado && (
                <Box mt={4}>
                    {/* Exibição dos resultados */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Resultados da Previsão
                            </Typography>
                            {resultado.mae  && (
                                <>
                                    <Typography variant="subtitle1">MAE: {resultado.mae.toFixed(2)}</Typography>
                                    <Typography variant="subtitle1">MAPE: {resultado.mape.toFixed(2)}%</Typography>
                                    <Typography variant="subtitle1">Percentual de acerto de tedência: {resultado.percentual_acerto_tendencia}%</Typography>
                                </>
                            )}
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="outlined"
                                color="success"
                                onClick={handleExportCsv}
                            >
                                Exportar Logs
                            </Button>
                            <Button variant="outlined" color="error" onClick={() => setResultado(null)}>
                                Limpar Resultados
                            </Button>
                        </CardActions>
                    </Card>

                    <Box mt={3}
                        height={500}
                        width={800}
                        sx={{
                            overflow: isSmallScreen ? 'auto' : 'hidden',
                        }}
                        marginLeft={isSmallScreen ? -0 : -19}>
                        {resultado && tipoPrevisao === 'previsao_fechamento' && modelo === 'LSTM' && <ClosingForecastChart data={resultado} ativoNome={ativoBusca} />}
                        {resultado && tipoPrevisao === 'previsao_fechamento' && modelo === 'SARIMA' && <MovingAverageForecastChart data={resultado} ativoNome={ativoBusca} />}
                        {resultado && tipoPrevisao === 'previsao_backtest' && <BacktestPredict data={resultado} ativoNome={ativoBusca} />}
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default PredictionsPage;
