import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { ProdutosPage } from './pages/ProdutosPage';
import { VendasPage } from './pages/VendasPage';
import { FuncionariosPage } from './pages/FuncionariosPage';
import { CategoriasPage } from './pages/CategoriasPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/funcionarios" element={<FuncionariosPage />} />
          <Route path="/vendas" element={<VendasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}