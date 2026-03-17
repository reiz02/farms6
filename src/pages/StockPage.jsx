import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaImage, FaWarehouse, FaPencilAlt, FaCheck } from "react-icons/fa";

function StockPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [modal, setModal] = useState({ show: false, message: "", type: "alert", onConfirm: null });

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        headers: { "userid": user?.id }
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const addProduct = async () => {
    if (!name || !price || !stock) return setModal({ show: true, message: "Paki-kumpleto ang lahat ng fields." });
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", image);

    const res = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers: { "userid": user?.id },
      body: formData,
    });

    if (res.ok) {
      setName(""); setPrice(""); setStock(""); setImage(null); setPreview("");
      fetchProducts();
    }
  };

  const updateProduct = async (id, field, value) => {
    setProducts(prev => prev.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const saveUpdate = async (id) => {
    const product = products.find(p => p._id === id);
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "userid": user?.id },
        body: JSON.stringify(product),
      });
      setEditingId(null);
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const deleteProduct = async (id) => {
    setModal({
      show: true,
      message: "Are you sure you want to delete this product?",
      type: "confirm",
      onConfirm: async () => {
        await fetch(`http://localhost:5000/api/products/${id}`, {
          method: "DELETE",
          headers: { "userid": user?.id }
        });
        fetchProducts();
      }
    });
  };

  const colors = { 
    emerald: "#57b894", 
    textMain: "#1e293b", 
    textLight: "#64748b", 
    danger: "#ef4444",
    bgLight: "#f8fafc" 
  };

  return (
    <div style={{ animation: "fadeInUp 0.5s ease", fontFamily: "'Inter', sans-serif" }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: "35px" }}>
        <h2 style={{ fontSize: "32px", fontWeight: "800", color: colors.textMain, letterSpacing: "-1px", margin: 0 }}>
          Inventory Management
        </h2>
        <p style={{ color: colors.textLight, marginTop: "5px", fontWeight: "500" }}>
          Monitor and manage your farm products and stock levels.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "30px", alignItems: "start" }}>
        
        {/* ADD PRODUCT FORM */}
        <div style={formWrapperStyle}>
          <div style={formHeaderStyle}>
            <FaPlus size={14} /> <span style={{ fontWeight: "700" }}>New Product</span>
          </div>
          <div style={{ padding: "25px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Product Name</label>
              <input type="text" placeholder="e.g. Fresh Tomatoes" value={name} onChange={(e) => setName(e.target.value)} style={modernInputStyle} />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
              <div>
                <label style={labelStyle}>Price (₱)</label>
                <input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} style={modernInputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Stock Qty</label>
                <input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} style={modernInputStyle} />
              </div>
            </div>

            <label style={labelStyle}>Product Image</label>
            <div style={uploadBoxStyle}>
              {preview ? (
                <img src={preview} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} alt="Preview" />
              ) : (
                <div style={{ textAlign: "center", color: "#94a3b8" }}>
                  <FaImage size={24} style={{ marginBottom: "8px" }} />
                  <div style={{ fontSize: "12px", fontWeight: "600" }}>Click to upload</div>
                </div>
              )}
              <input type="file" onChange={handleImage} style={hiddenInputFileStyle} />
            </div>

            <button onClick={addProduct} style={addBtnStyle}>Add to Inventory</button>
          </div>
        </div>

        {/* INVENTORY LIST */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: colors.textMain, margin: 0 }}>
              <FaWarehouse color={colors.emerald} style={{ marginRight: "10px" }} /> Current Inventory
            </h3>
            <span style={{ fontSize: "13px", fontWeight: "700", color: colors.emerald, backgroundColor: "rgba(87, 184, 148, 0.1)", padding: "5px 12px", borderRadius: "20px" }}>
              Total Items: {products.length}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {products.map((p) => (
              <div key={p._id} style={productCardStyle}>
                <div style={{ position: "relative", height: "180px", backgroundColor: "#f1f5f9" }}>
                  <img 
                    src={p.image ? `http://localhost:5000${p.image}` : "https://via.placeholder.com/150"} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    alt={p.name}
                  />
                  {p.stock <= 5 && (
                    <div style={lowStockBadge}>LOW STOCK</div>
                  )}
                  <div style={iconGroupStyle}>
                    {editingId === p._id ? (
                      <button onClick={() => saveUpdate(p._id)} style={confirmIconStyle}><FaCheck size={12} /></button>
                    ) : (
                      <button onClick={() => setEditingId(p._id)} style={editIconStyle}><FaPencilAlt size={12} /></button>
                    )}
                    <button onClick={() => deleteProduct(p._id)} style={deleteIconStyle}><FaTrash size={12} /></button>
                  </div>
                </div>
                
                <div style={{ padding: "15px" }}>
                  {editingId === p._id ? (
                    <input type="text" value={p.name} onChange={(e) => updateProduct(p._id, "name", e.target.value)} style={editingInputStyle} />
                  ) : (
                    <h4 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "700", color: colors.textMain }}>{p.name}</h4>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <span style={miniLabelStyle}>PRICE</span>
                      {editingId === p._id ? (
                        <input type="number" value={p.price} onChange={(e) => updateProduct(p._id, "price", e.target.value)} style={editingInputSmall} />
                      ) : <strong style={{ fontSize: "15px", color: colors.textMain }}>₱{p.price}</strong>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={miniLabelStyle}>STOCK</span>
                      {editingId === p._id ? (
                        <input type="number" value={p.stock} onChange={(e) => updateProduct(p._id, "stock", e.target.value)} style={editingInputSmall} />
                      ) : <strong style={{ fontSize: "15px", color: p.stock <= 5 ? colors.danger : colors.textMain }}>{p.stock}</strong>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal.show && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <p style={{ fontWeight: "600", color: colors.textMain, marginBottom: "20px" }}>{modal.message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({show:false}) }}
                style={{ padding: "10px 25px", background: colors.emerald, color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
              >
                Confirm
              </button>
              {modal.type === "confirm" && (
                <button 
                  onClick={() => setModal({show:false})}
                  style={{ padding: "10px 25px", background: "#f1f5f9", color: colors.textMain, border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- UPDATED STYLES ---
const formWrapperStyle = { background: "white", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflow: "hidden" };
const formHeaderStyle = { background: "#57b894", padding: "15px 25px", display: "flex", alignItems: "center", gap: "10px", color: "white", fontSize: "14px" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" };
const modernInputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", width: "100%", fontSize: "14px", outline: "none", transition: "0.2s", backgroundColor: "#f8fafc" };
const uploadBoxStyle = { border: "2px dashed #e2e8f0", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", height: "120px", position: "relative", backgroundColor: "#f8fafc", marginBottom: "20px" };
const hiddenInputFileStyle = { opacity: 0, position: "absolute", inset: 0, cursor: "pointer" };
const addBtnStyle = { width: "100%", background: "#57b894", color: "white", padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "14px", transition: "0.3s" };

const productCardStyle = { background: "white", borderRadius: "18px", border: "1px solid #e2e8f0", overflow: "hidden", transition: "0.3s", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const iconGroupStyle = { position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" };
const editIconStyle = { background: "rgba(255,255,255,0.9)", color: "#57b894", border: "none", width: "30px", height: "30px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" };
const confirmIconStyle = { ...editIconStyle, background: "#57b894", color: "white" };
const deleteIconStyle = { ...editIconStyle, color: "#ef4444" };
const lowStockBadge = { position: "absolute", top: "10px", left: "10px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: "800", padding: "4px 8px", borderRadius: "6px" };

const miniLabelStyle = { fontSize: "10px", color: "#94a3b8", display: "block", fontWeight: "700", marginBottom: "2px" };
const editingInputStyle = { width: "100%", padding: "8px", border: "2px solid #57b894", borderRadius: "8px", fontWeight: "bold", marginBottom: "10px", outline: "none" };
const editingInputSmall = { width: "70px", padding: "5px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" };

const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 };
const modalContentStyle = { background: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "350px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" };

export default StockPage;