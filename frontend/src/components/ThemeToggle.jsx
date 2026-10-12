import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
