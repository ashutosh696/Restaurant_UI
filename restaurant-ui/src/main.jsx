import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ClipboardList,
  CookingPot,
  CreditCard,
  LayoutDashboard,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShoppingCart,
  Trash2,
  Utensils,
} from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const STATUSES = ['Preparing', 'Ready', 'Delivered'];
const FALLBACK_MENU = [
  {
    id: 'sample-1',
    name: 'Paneer Tikka Bowl',
    description: 'Charred paneer, saffron rice, mint chutney, crisp salad.',
    price: 12.5,
    category: 'Bowls',
    available: true,
  },
  {
    id: 'sample-2',
    name: 'Masala Dosa',
    description: 'Crisp dosa, potato masala, sambar, coconut chutney.',
    price: 9,
    category: 'South Indian',
    available: true,
  },
  {
    id: 'sample-3',
    name: 'Mango Lassi',
    description: 'Chilled mango yogurt drink with cardamom.',
    price: 4.5,
    category: 'Drinks',
    available: true,
  },
];

function normalizeApiUrl(url) {
  return url.replace(/\/$/, '');
}

async function request(path, options = {}) {
  const endpoint = `${normalizeApiUrl(API_URL)}${path}`;
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [editingItem, setEditingItem] = useState(emptyMenuItem());
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [loginEmail, setLoginEmail] = useState('admin@restaurant.local');
  const [loginPassword, setLoginPassword] = useState('admin12345');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0),
    [cart],
  );
  const trackedOrder = orders.find((order) => order.id === selectedOrderId);
  const isAdmin = auth?.role === 'ADMIN';
  const isAdminPage = page === 'admin';

  useEffect(() => {
    refreshAll();
  }, [auth?.token, page]);

  useEffect(() => {
    function handlePopState() {
      setPage(pageFromPath(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function refreshAll() {
    setLoading(true);
    setError('');
    try {
      const menuItems = await request(isAdminPage && isAdmin ? '/menu' : '/menu/available', { token: auth?.token });
      setMenu(menuItems);
      if (isAdminPage && isAdmin) {
        setOrders(await request('/orders', { token: auth.token }));
      } else if (!isAdminPage) {
        setOrders(readCustomerOrders());
      }
    } catch (err) {
      setMenu((current) => (current.length ? current : FALLBACK_MENU));
      setError(`${err.message} Showing sample menu until the API is reachable.`);
    } finally {
      setLoading(false);
    }
  }

  function addToCart(item) {
    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        return current.map((line) =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [...current, { item, quantity: 1 }];
    });
  }

  function changeQuantity(itemId, delta) {
    setCart((current) =>
      current
        .map((line) =>
          line.item.id === itemId ? { ...line, quantity: line.quantity + delta } : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!cart.length) return setError('Add at least one item before placing an order.');
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const order = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          phone,
          items: cart.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
        }),
      });
      setOrders((current) => [order, ...current]);
      saveCustomerOrder(order);
      setSelectedOrderId(order.id);
      setCart([]);
      setCustomerName('');
      setPhone('');
      setNotice(`Order ${order.id.slice(-6).toUpperCase()} placed.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveMenuItem(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const path = editingItem.id ? `/menu/${editingItem.id}` : '/menu';
      const saved = await request(path, { method, token: auth?.token, body: JSON.stringify(editingItem) });
      setMenu((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current];
      });
      setEditingItem(emptyMenuItem());
      setNotice('Menu item saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMenuItem(itemId) {
    setLoading(true);
    setError('');
    try {
      await request(`/menu/${itemId}`, { method: 'DELETE', token: auth?.token });
      setMenu((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    setLoading(true);
    setError('');
    try {
      const updated = await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        token: auth?.token,
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
      if (selectedOrderId === orderId) setSelectedOrderId(updated.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const session = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (session.role !== 'ADMIN') {
        throw new Error('Only ADMIN users can access the restaurant panel.');
      }
      setAuth(session);
      localStorage.setItem('restaurantAuth', JSON.stringify(session));
      navigateTo('/admin');
      setNotice(`Signed in as ${session.email}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('restaurantAuth');
    setAuth(null);
    navigateTo('/customer');
    setOrders([]);
    setNotice('Signed out.');
  }

  function navigateTo(path) {
    window.history.pushState({}, '', path);
    setPage(pageFromPath(path));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><Utensils size={24} /></span>
          <div>
            <h1>Tableline</h1>
            <p>Menu, cart, orders, and kitchen flow</p>
          </div>
        </div>
        <nav className="view-switch" aria-label="Application pages">
          <button className={page === 'customer' ? 'active' : ''} onClick={() => navigateTo('/customer')}>
            <ShoppingCart size={18} /> Customer
          </button>
          {page === 'admin' && (
            <button className="active" onClick={() => navigateTo('/admin')}>
              <LayoutDashboard size={18} /> Admin
            </button>
          )}
          {isAdmin && (
            <button onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          )}
          <button className="icon-button" onClick={refreshAll} aria-label="Refresh data" title="Refresh data">
            <RefreshCw size={18} />
          </button>
        </nav>
      </header>

      {(error || notice) && (
        <section className={`message ${error ? 'error' : 'success'}`}>
          {error || notice}
        </section>
      )}

      {page === 'customer' ? (
        <CustomerView
          menu={menu}
          cart={cart}
          cartTotal={cartTotal}
          customerName={customerName}
          phone={phone}
          orders={orders}
          selectedOrderId={selectedOrderId}
          trackedOrder={trackedOrder}
          loading={loading}
          setCustomerName={setCustomerName}
          setPhone={setPhone}
          setSelectedOrderId={setSelectedOrderId}
          addToCart={addToCart}
          changeQuantity={changeQuantity}
          placeOrder={placeOrder}
        />
      ) : !isAdmin ? (
        <LoginView
          email={loginEmail}
          password={loginPassword}
          loading={loading}
          setEmail={setLoginEmail}
          setPassword={setLoginPassword}
          login={login}
        />
      ) : (
        <AdminView
          menu={menu}
          orders={orders}
          editingItem={editingItem}
          loading={loading}
          setEditingItem={setEditingItem}
          saveMenuItem={saveMenuItem}
          deleteMenuItem={deleteMenuItem}
          updateStatus={updateStatus}
        />
      )}
    </main>
  );
}

function LoginView({ email, password, loading, setEmail, setPassword, login }) {
  return (
    <section className="login-layout">
      <form className="panel login-panel" onSubmit={login}>
        <div className="section-heading">
          <h2>Admin login</h2>
          <LogIn size={20} />
        </div>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary" disabled={loading}>
          <LogIn size={18} /> Sign in
        </button>
      </form>
    </section>
  );
}

function CustomerView(props) {
  const {
    menu,
    cart,
    cartTotal,
    customerName,
    phone,
    orders,
    selectedOrderId,
    trackedOrder,
    loading,
    setCustomerName,
    setPhone,
    setSelectedOrderId,
    addToCart,
    changeQuantity,
    placeOrder,
  } = props;

  return (
    <section className="customer-grid">
      <div className="menu-panel">
        <div className="section-heading">
          <h2>Menu</h2>
          <span>{menu.filter((item) => item.available).length} available</span>
        </div>
        <div className="menu-grid">
          {menu.filter((item) => item.available).map((item) => (
            <article className="menu-card" key={item.id}>
              <div>
                <span className="category">{item.category || 'Special'}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="card-actions">
                <strong>{currency(item.price)}</strong>
                <button onClick={() => addToCart(item)}><Plus size={17} /> Add</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="side-stack">
        <form className="panel" onSubmit={placeOrder}>
          <div className="section-heading">
            <h2>Cart</h2>
            <ShoppingCart size={20} />
          </div>
          <div className="cart-lines">
            {cart.length === 0 && <p className="muted">Your cart is empty.</p>}
            {cart.map((line) => (
              <div className="cart-line" key={line.item.id}>
                <div>
                  <strong>{line.item.name}</strong>
                  <span>{currency(line.item.price)} each</span>
                </div>
                <div className="quantity">
                  <button type="button" onClick={() => changeQuantity(line.item.id, -1)}>-</button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(line.item.id, 1)}>+</button>
                </div>
              </div>
            ))}
          </div>
          <label>
            Name
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
          </label>
          <div className="total-row">
            <span>Total</span>
            <strong>{currency(cartTotal)}</strong>
          </div>
          <button className="primary" disabled={loading || !cart.length}>
            <CreditCard size={18} /> Place order
          </button>
        </form>

        <section className="panel">
          <div className="section-heading">
            <h2>Track</h2>
            <ClipboardList size={20} />
          </div>
          <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
            <option value="">Select order</option>
            {orders.map((order) => (
              <option value={order.id} key={order.id}>
                {order.customerName} - {order.status}
              </option>
            ))}
          </select>
          {trackedOrder && (
            <div className="tracker">
              {STATUSES.map((status) => (
                <span key={status} className={statusStepClass(trackedOrder.status, status)}>
                  {status}
                </span>
              ))}
            </div>
          )}
        </section>
      </aside>
    </section>
  );
}

function AdminView({ menu, orders, editingItem, loading, setEditingItem, saveMenuItem, deleteMenuItem, updateStatus }) {
  return (
    <section className="admin-grid">
      <form className="panel" onSubmit={saveMenuItem}>
        <div className="section-heading">
          <h2>{editingItem.id ? 'Update item' : 'Add item'}</h2>
          <CookingPot size={20} />
        </div>
        <label>
          Name
          <input value={editingItem.name} onChange={(event) => setEditingItem({ ...editingItem, name: event.target.value })} required />
        </label>
        <label>
          Category
          <input value={editingItem.category} onChange={(event) => setEditingItem({ ...editingItem, category: event.target.value })} />
        </label>
        <label>
          Description
          <textarea value={editingItem.description} onChange={(event) => setEditingItem({ ...editingItem, description: event.target.value })} />
        </label>
        <label>
          Price
          <input type="number" min="0" step="0.01" value={editingItem.price} onChange={(event) => setEditingItem({ ...editingItem, price: Number(event.target.value) })} required />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={editingItem.available} onChange={(event) => setEditingItem({ ...editingItem, available: event.target.checked })} />
          Available
        </label>
        <button className="primary" disabled={loading}>
          <Save size={18} /> Save item
        </button>
      </form>

      <section className="panel list-panel">
        <div className="section-heading">
          <h2>Menu items</h2>
          <span>{menu.length}</span>
        </div>
        {menu.map((item) => (
          <div className="admin-row" key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <span>{currency(item.price)} - {item.available ? 'Available' : 'Hidden'}</span>
            </div>
            <div className="row-actions">
              <button onClick={() => setEditingItem(item)}>Edit</button>
              <button className="icon-button danger" onClick={() => deleteMenuItem(item.id)} aria-label={`Delete ${item.name}`} title="Delete">
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="panel list-panel orders-panel">
        <div className="section-heading">
          <h2>Incoming orders</h2>
          <span>{orders.length}</span>
        </div>
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-topline">
              <div>
                <strong>{order.customerName}</strong>
                <span>{order.phone}</span>
              </div>
              <strong>{currency(order.total)}</strong>
            </div>
            <ul>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.menuItemId || item.name}`}>
                  {item.quantity}x {item.name}
                </li>
              ))}
            </ul>
            <div className="status-actions">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  className={order.status === status ? 'active-status' : ''}
                  onClick={() => updateStatus(order.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

function statusStepClass(currentStatus, step) {
  const currentIndex = STATUSES.indexOf(currentStatus);
  const stepIndex = STATUSES.indexOf(step);
  return stepIndex <= currentIndex ? 'done' : '';
}

function emptyMenuItem() {
  return { name: '', description: '', category: '', price: 0, available: true };
}

function pageFromPath(pathname) {
  return pathname.toLowerCase().startsWith('/admin') ? 'admin' : 'customer';
}

function readStoredAuth() {
  try {
    const stored = localStorage.getItem('restaurantAuth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function readCustomerOrders() {
  try {
    const stored = localStorage.getItem('customerOrders');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomerOrder(order) {
  const current = readCustomerOrders();
  localStorage.setItem('customerOrders', JSON.stringify([order, ...current].slice(0, 10)));
}

createRoot(document.getElementById('root')).render(<App />);
