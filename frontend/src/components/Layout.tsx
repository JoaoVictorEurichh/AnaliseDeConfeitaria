import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/funcionarios', label: 'Funcionários' },
  { to: '/vendas', label: 'Vendas' },
  { to: '/analise', label: 'Análise de Dados' },
  { to: '/decisao-estrategica', label: 'Decisão Estratégica' },
];

export function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-3 md:hidden">
        <h2 className="text-lg font-bold text-amber-900">Confeitaria</h2>
        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-lg px-3 py-2 text-amber-900 hover:bg-amber-100"
          aria-label="Abrir menu"
        >
          {menuAberto ? '✕' : '☰'}
        </button>
      </header>

      {menuAberto && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={fecharMenu}
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-56 shrink-0 border-r border-amber-200 bg-amber-50 p-4
            transition-transform duration-200
            md:static md:translate-x-0
            ${menuAberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <h2 className="mb-6 hidden text-xl font-bold text-amber-900 md:block">
            Confeitaria
          </h2>

          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={fecharMenu}
                className="rounded-lg px-3 py-2 text-amber-900 hover:bg-amber-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-x-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
