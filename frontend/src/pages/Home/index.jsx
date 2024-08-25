import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Grid, Container } from '@mui/material';

const HomePage = () => {
    return (
        <Container sx={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                Bem-vindo! Explore e Aprimore Suas Estratégias Aqui.
            </Typography>
            <Grid container justifyContent="center" spacing={2} sx={{ marginTop: '30px' }}>
                <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                                Backtest
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '10px' }}>
                                Realize testes retrospectivos para avaliar estratégias.
                            </Typography>
                            <Button component={Link} to="/backtest" variant="contained" color="success">
                                Ir para Backtest
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ marginBottom: '10px' }}>
                                Previsão
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '10px' }}>
                                Faça previsões com base em dados históricos.
                            </Typography>
                            <Button component={Link} to="/predictions" variant="contained" color="success">
                                Ir para Previsão
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default HomePage;
