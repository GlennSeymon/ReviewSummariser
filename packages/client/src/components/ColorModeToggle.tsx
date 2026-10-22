import { useState } from 'react';
import { useColorScheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';

type Mode = 'light' | 'dark' | 'system';

const options: { mode: Mode; label: string; icon: React.ReactNode }[] = [
	{ mode: 'light', label: 'Light', icon: <LightModeOutlined fontSize='small' /> },
	{ mode: 'dark', label: 'Dark', icon: <DarkModeOutlined fontSize='small' /> },
	{ mode: 'system', label: 'System', icon: <SettingsBrightnessOutlined fontSize='small' /> },
];

const ColorModeToggle = () => {
	const { mode, setMode } = useColorScheme();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	// mode is undefined until the color scheme has been resolved on first render
	if (!mode) return null;

	const current = options.find((o) => o.mode === mode) ?? options[2];

	return (
		<>
			<Tooltip title='Theme'>
				<IconButton
					onClick={(e) => setAnchorEl(e.currentTarget)}
					aria-label='Change theme'
					aria-haspopup='menu'
				>
					{current.icon}
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				{options.map((o) => (
					<MenuItem
						key={o.mode}
						selected={o.mode === mode}
						onClick={() => {
							setMode(o.mode);
							setAnchorEl(null);
						}}
					>
						<ListItemIcon>{o.icon}</ListItemIcon>
						<ListItemText>{o.label}</ListItemText>
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default ColorModeToggle;
