import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const SUPABASE_URL = "https://bdlsxfhncsdytolwupfk.supabase.co";
const SUPABASE_KEY = "sb_publishable_0l4GBTf3JRDt3Bva1zeBRg_-_Xax1HH";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [savings, setSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingMoney, setSavingMoney] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const totalProducts = useMemo(() => {
    return products.reduce((total, product) => total + safeNumber(product.price), 0);
  }, [products]);

  const missing = Math.max(totalProducts - safeNumber(savings), 0);
  const progress = totalProducts > 0 ? Math.min((safeNumber(savings) / totalProducts) * 100, 100) : 100;

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    const [departmentsResponse, productsResponse, settingsResponse] = await Promise.all([
      supabase.from("departments").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").eq("id", "main").single(),
    ]);

    if (departmentsResponse.error || productsResponse.error || settingsResponse.error) {
      console.log({
        departmentsError: departmentsResponse.error,
        productsError: productsResponse.error,
        settingsError: settingsResponse.error,
      });

      setErrorMessage("No se pudieron cargar los datos de Supabase.");
      setLoading(false);
      return;
    }

    setDepartments(departmentsResponse.data || []);
    setProducts(productsResponse.data || []);
    setSavings(settingsResponse.data?.savings || 0);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addDepartment() {
    if (!deptForm.url.trim()) return;

    setErrorMessage("");

    const newDepartment = {
      title: deptForm.title.trim() || "Nueva propuesta",
      url: deptForm.url.trim(),
      note: deptForm.note.trim(),
    };

    const { data, error } = await supabase
      .from("departments")
      .insert(newDepartment)
      .select()
      .single();

    if (error) {
      console.log(error);
      setErrorMessage("No se pudo agregar la propuesta.");
      return;
    }

    setDepartments((prev) => [data, ...prev]);
    setDeptForm({ title: "", url: "", note: "" });
  }

  async function removeDepartment(id) {
    const { error } = await supabase.from("departments").delete().eq("id", id);

    if (error) {
      console.log(error);
      setErrorMessage("No se pudo eliminar la propuesta.");
      return;
    }

    setDepartments((prev) => prev.filter((department) => department.id !== id));
  }

  async function addProduct() {
    if (!productForm.name.trim()) return;

    setErrorMessage("");

    const newProduct = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: safeNumber(productForm.price),
      url: productForm.url.trim(),
    };

    const { data, error } = await supabase
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.log(error);
      setErrorMessage("No se pudo agregar el producto.");
      return;
    }

    setProducts((prev) => [data, ...prev]);
    setProductForm({ name: "", description: "", price: "", url: "" });
  }

  async function removeProduct(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.log(error);
      setErrorMessage("No se pudo eliminar el producto.");
      return;
    }

    setProducts((prev) => prev.filter((product) => product.id !== id));
  }

  async function updateSavings(value) {
    const cleanValue = safeNumber(value);
    setSavings(cleanValue);
    setSavingMoney(true);

    const { error } = await supabase
      .from("settings")
      .update({ savings: cleanValue })
      .eq("id", "main");

    if (error) {
      console.log(error);
      setErrorMessage("No se pudo actualizar el ahorro.");
    }

    setSavingMoney(false);
  }

  async function resetData() {
    const confirmReset = window.confirm("¿Seguro que querés borrar todos los datos?");
    if (!confirmReset) return;

    const [deleteDepartments, deleteProducts, updateSettings] = await Promise.all([
      supabase.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("settings").update({ savings: 0 }).eq("id", "main"),
    ]);

    if (deleteDepartments.error || deleteProducts.error || updateSettings.error) {
      setErrorMessage("No se pudieron reiniciar los datos.");
      return;
    }

    setDepartments([]);
    setProducts([]);
    setSavings(0);
  }

  if (loading) {
    return (
      <main className="app">
        <section className="container">
          <header className="hero">
            <div className="hero-content">
              <span className="tag">✨ Cargando</span>
              <h1>Mi futura casa</h1>
              <p>Estamos trayendo tus datos desde la base online.</p>
            </div>
          </header>
        </section>
      </main>
    );
  }

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

        {errorMessage && <div className="form-card">{errorMessage}</div>}

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
            {departments.map((department) => (
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
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Todavía no agregaste productos.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
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
                  value={savings}
                  onChange={(e) => updateSavings(e.target.value)}
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

                  {savingMoney && (
                    <div>
                      <span>Estado</span>
                      <strong>Guardando...</strong>
                    </div>
                  )}
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