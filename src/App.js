import { ThemeProvider } from './context/ThemeContext';
import CustomNavbar from './components/Navbar';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <CustomNavbar />
        <Home />
      </div>
    </ThemeProvider>
  );
}

export default App;