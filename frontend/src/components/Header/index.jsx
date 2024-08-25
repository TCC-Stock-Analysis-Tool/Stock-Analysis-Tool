import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Header = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);

	const toggleDrawer = (open) => () => {
		setDrawerOpen(open);
	};

	return (
		<>
			<AppBar position="static" sx={{ backgroundColor: '#006633', marginBottom: 2 }}>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ marginRight: 2, display: { xs: 'block', sm: 'none' } }} // Adicionando a propriedade display para controlar a visibilidade
						onClick={toggleDrawer(true)}
					>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6"  sx={{ fontStyle: 'italic',  flexGrow:1 }}>
						Data Finance Analysis
					</Typography>
					<Grid sx={{ display: { xs: 'none', sm: 'block' } }}>
						<Button color="inherit" component={Link} to="/">
							Home
						</Button>
						<Button color="inherit" component={Link} to="/backtest">
							Backtest
						</Button>
						<Button color="inherit" component={Link} to="/predictions">
							Previsões
						</Button>
						<Button color="inherit" component={Link} to="/about">
							Sobre
						</Button>

					</Grid>
				</Toolbar>
			</AppBar>

			<Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)} sx={{ display: { xs: 'block', sm: 'none' } }}>
				<List>
					<ListItem component={Link} to="/" onClick={toggleDrawer(false)}>
						<ListItemText primary="Home" />
					</ListItem>
					<ListItem component={Link} to="/backtest" onClick={toggleDrawer(false)}>
						<ListItemText primary="Backtest" />
					</ListItem>
					<ListItem component={Link} to="/predictions" onClick={toggleDrawer(false)}>
						<ListItemText primary="Previsões" />
					</ListItem>
					<ListItem component={Link} to="/about" onClick={toggleDrawer(false)}>
						<ListItemText primary="Sobre" />
					</ListItem>
				</List>
			</Drawer>
		</>
	);
};

export default Header;
