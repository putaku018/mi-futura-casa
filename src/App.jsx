import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "mi-futura-casa-data";

const initialData = {
  departments: [
    {
      id: "depto-1",
      title: "Depto favorito 1",
      url: "https://www.zonaprop.com.ar/",
      note: "Agregá acá tus opciones reales de compra.",
    },
  ],
  products: [
    {
      id: "producto-1",
      name: "Heladera",
      description: "Modelo eficiente y tamaño acorde al depto.",
      price: 850000,
      url: "https://www.mercadolibre.com.ar/",
    },
    {
      id: "producto-2",
      name: "Cama",
      description: "Base + colchón cómodo para primera mudanza.",
      price: 500000,
      url: "https://www.mercadolibre.com.ar/",
    },
  ],
  savings: 1200000,
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

function shortUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "") + (parsed.pathname.length > 1 ? "/…" : "");
  } catch {
    return "Link";
  }
}

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const [deptForm, setDeptForm] = useState({
    title: "",
    url: "",
    note: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    url: "",
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.log("No se pudo guardar en localStorage");
    }
  }, [data]);

  const totalProducts = useMemo(() => {
    return data.products.reduce((total, product) => {
      return total + safeNumber(product.price);
    }, 0);
  }, [data.products]);

  const savings = safeNumber(data.savings);
  const missing = Math.max(totalProducts - savings, 0);
  const progress = totalProducts > 0 ? Math.min((savings / totalProducts) * 100, 100) : 100;

  const addDepartment = () => {
    if (!deptForm.url.trim()) return;

    const newDepartment = {
      id: createId(),
      title: deptForm.title.trim() || "Nueva propuesta",
      url: deptForm.url.trim(),
      note: deptForm.note.trim(),
    };

    setData((prev) => ({
      ...prev,
      departments: [...prev.departments, newDepartment],
    }));

    setDeptForm({
      title: "",
      url: "",
      note: "",
    });
  };

  const removeDepartment = (id) => {
    setData((prev) => ({
      ...prev,
      departments: prev.departments.filter((department) => department.id !== id),
    }));
  };

  const addProduct = () => {
    if (!productForm.name.trim()) return;

    const newProduct = {
      id: createId(),
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: safeNumber(productForm.price),
      url: productForm.url.trim(),
    };

    setData((prev) => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));

    setProductForm({
      name: "",
      description: "",
      price: "",
      url: "",
    });
  };

  const removeProduct = (id) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product.id !== id),
    }));
  };

  const resetData = () => {
    const confirmReset = window.confirm("¿Seguro que querés borrar todos los datos?");
    if (!confirmReset) return;
    setData(initialData);
  };

  return (
    <main className="app">
      <div className="background-circle circle-one"></div>
      <div className="background-circle circle-two"></div>
      <div className="background-circle circle-three"></div>

      <section className="container">
        <header className="hero">
          <div className="hero-content">
            <span className="tag">✨ Plan de mudanza</span>
            <h1>Mi futura casa</h1>
            <p>
              Organizá propuestas de departamentos, lista de compras y presupuesto para
              acercarte a tu próxima mudanza.
            </p>
          </div>

          <div className="hero-summary">
            <div className="summary-card dark">
              <span>Compras</span>
              <strong>{formatCurrency(totalProducts)}</strong>
            </div>

            <div className="summary-card light">
              <span>Ahorro</span>
              <strong>{formatCurrency(savings)}</strong>
            </div>
          </div>
        </header>

        <section className="section">
          <div className="section-title">
            <div className="section-icon">🏢</div>
            <div>
              <h2>Propuestas de departamentos</h2>
              <p>Agregá links y compará opciones en formato carrusel.</p>
            </div>
          </div>

          <div className="form-card">
            <input
              type="text"
              placeholder="Nombre de la propuesta"
              value={deptForm.title}
              onChange={(e) => setDeptForm({ ...deptForm, title: e.target.value })}
            />

            <input
              type="text"
              placeholder="Link del departamento"
              value={deptForm.url}
              onChange={(e) => setDeptForm({ ...deptForm, url: e.target.value })}
            />

            <input
              type="text"
              placeholder="Nota breve"
              value={deptForm.note}
              onChange={(e) => setDeptForm({ ...deptForm, note: e.target.value })}
            />

            <button onClick={addDepartment}>+ Agregar</button>
          </div>

          <div className="carousel">
            {data.departments.map((department) => (
              <article className="department-card" key={department.id}>
                <div className="card-top">
                  <div>
                    <h3>{department.title}</h3>
                    <p>{department.note || "Sin nota agregada"}</p>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => removeDepartment(department.id)}
                    title="Eliminar propuesta"
                  >
                    🗑️
                  </button>
                </div>

                <div className="preview-box">
                  <span className="preview-icon">🏢</span>
                  <strong>Previsualización del link</strong>
                  <p>{shortUrl(department.url)}</p>
                  <small>
                    Algunas páginas inmobiliarias bloquean la vista previa. El botón abre
                    el link original.
                  </small>
                </div>

                <a
                  className="external-link"
                  href={department.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver propuesta ↗
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <div className="section-icon">🛍️</div>
            <div>
              <h2>Cosas que debo comprar</h2>
              <p>Cargá productos y calculá automáticamente el presupuesto.</p>
            </div>
          </div>

          <div className="products-panel">
            <div className="product-form">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />

              <input
                type="text"
                placeholder="Descripción del producto"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm({ ...productForm, description: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Precio"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />

              <input
                type="text"
                placeholder="Link de compra"
                value={productForm.url}
                onChange={(e) => setProductForm({ ...productForm, url: e.target.value })}
              />

              <button onClick={addProduct}>+ Agregar producto</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nombre del producto</th>
                    <th>Descripción del producto</th>
                    <th>Precio</th>
                    <th>Link de compra</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {data.products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Todavía no agregaste productos.
                      </td>
                    </tr>
                  ) : (
                    data.products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <strong>{product.name}</strong>
                        </td>
                        <td>{product.description || "Sin descripción"}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          {product.url ? (
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noreferrer"
                              className="short-link"
                            >
                              {shortUrl(product.url)} ↗
                            </a>
                          ) : (
                            <span className="muted">Sin link</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => removeProduct(product.id)}
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="budget-grid">
          <div className="budget-card">
            <div className="section-title compact">
              <div className="section-icon dark-icon">🏠</div>
              <div>
                <h2>Presupuesto a alcanzar</h2>
                <p>Se actualiza con el total de productos cargados.</p>
              </div>
            </div>

            <strong className="big-number">{formatCurrency(totalProducts)}</strong>

            <p className="budget-text">
              Este número representa el costo estimado de todo lo que querés comprar
              para mudarte.
            </p>
          </div>

          <div className="budget-card">
            <div className="section-title compact">
              <div className="section-icon dark-icon">🐷</div>
              <div>
                <h2>Dinero ahorrado</h2>
                <p>Editá tu ahorro y mirá cuánto falta.</p>
              </div>
            </div>

            <div className="savings-layout">
              <div>
                <input
                  type="number"
                  className="savings-input"
                  value={data.savings}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      savings: safeNumber(e.target.value),
                    }))
                  }
                />

                <div className="stats">
                  <div>
                    <span>Ya tenés</span>
                    <strong>{formatCurrency(savings)}</strong>
                  </div>

                  <div>
                    <span>Te falta</span>
                    <strong>{formatCurrency(missing)}</strong>
                  </div>

                  <div>
                    <span>Progreso</span>
                    <strong>{progress.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              <div className="chart-area">
                <div
                  className="pie-chart"
                  style={{
                    background: `conic-gradient(#1c1917 0% ${progress}%, #d6c4ae ${progress}% 100%)`,
                  }}
                >
                  <div className="pie-center">
                    <strong>{progress.toFixed(0)}%</strong>
                    <span>ahorrado</span>
                  </div>
                </div>

                <div className="legend">
                  <span>
                    <i className="dot dark-dot"></i> Ya tengo
                  </span>
                  <span>
                    <i className="dot light-dot"></i> Me falta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-actions">
          <button className="reset-btn" onClick={resetData}>
            Reiniciar datos
          </button>
        </div>
      </section>
    </main>
  );
}