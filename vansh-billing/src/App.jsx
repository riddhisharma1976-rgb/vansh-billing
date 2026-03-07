import { useState, useEffect, useCallback } from "react";

// ── STORAGE HELPERS ──
async function loadBills() {
  try {
    const res = await window.storage.get("vansh_bills");
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}
async function persistBills(bills) {
  try { await window.storage.set("vansh_bills", JSON.stringify(bills)); } catch {}
}

// ── NUMBER TO WORDS ──
function numberToWords(n) {
  if (!n || n === 0) return "Zero";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function hw(num) {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num/10)] + (num%10 ? " "+a[num%10] : "");
    return a[Math.floor(num/100)]+" Hundred"+(num%100 ? " "+hw(num%100) : "");
  }
  let int = Math.floor(n), res = "";
  if (int >= 10000000) { res += hw(Math.floor(int/10000000))+" Crore "; int %= 10000000; }
  if (int >= 100000)   { res += hw(Math.floor(int/100000))+" Lakh "; int %= 100000; }
  if (int >= 1000)     { res += hw(Math.floor(int/1000))+" Thousand "; int %= 1000; }
  if (int > 0) res += hw(int);
  return res.trim();
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function today() { return new Date().toISOString().split("T")[0]; }

// ── BILL PRINT VIEW ──
function BillPrint({ bill }) {
  const sub = bill.services.reduce((s,r) => s + r.amt, 0);
  return (
    <div style={{ fontFamily:"'Georgia', serif", fontSize:13, color:"#111", padding:"40px 48px", lineHeight:1.7, background:"#fff" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", borderBottom:"3px solid #0f1f3d", paddingBottom:20, marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:"#0f1f3d", letterSpacing:1 }}>VANSH CONSULTANTS</div>
          <div style={{ fontSize:11.5, color:"#555", marginTop:4, lineHeight:1.8 }}>
            119, Arya Nagar, S.K. Road, Meerut<br/>
            Meerut | Contact No.: 9760896485, 8864876629<br/>
            Mail id: vanshconsultants@rediffmail.com
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, color:"#c9a84c", fontWeight:700 }}>Invoice</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#0f1f3d" }}>{bill.invoiceNo}</div>
          <div style={{ fontSize:12, color:"#555", marginTop:6 }}>Date: {formatDate(bill.date).toUpperCase()}</div>
        </div>
      </div>
      {/* Bill To */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:2, color:"#888", marginBottom:6 }}>To,</div>
        <div style={{ fontWeight:700, fontSize:14, color:"#0f1f3d" }}>{bill.clientName.toUpperCase()}{bill.designation ? ", "+bill.designation.toUpperCase() : ""}</div>
        {bill.address && <div>Address: {bill.address}</div>}
        {bill.contact && <div>Contact No: {bill.contact}</div>}
        {bill.tan && <div>TAN No: {bill.tan}</div>}
      </div>
      {/* Items */}
      <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20, fontSize:13 }}>
        <thead>
          <tr style={{ background:"#0f1f3d", color:"#fff" }}>
            <th style={{ padding:"9px 12px", textAlign:"left", width:50, fontSize:11, letterSpacing:1 }}>S.NO</th>
            <th style={{ padding:"9px 12px", textAlign:"left", fontSize:11, letterSpacing:1 }}>PARTICULARS</th>
            <th style={{ padding:"9px 12px", textAlign:"right", width:120, fontSize:11, letterSpacing:1 }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {bill.services.map((s,i) => (
            <tr key={i} style={{ borderBottom:"1px solid #e5e7eb" }}>
              <td style={{ padding:"11px 12px" }}>{i+1}.</td>
              <td style={{ padding:"11px 12px" }}>{s.desc}</td>
              <td style={{ padding:"11px 12px", textAlign:"right", fontWeight:600 }}>{Number(s.amt).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Words */}
      <div style={{ background:"#fdf8f0", borderLeft:"4px solid #c9a84c", padding:"9px 14px", borderRadius:"0 6px 6px 0", marginBottom:20, fontSize:12.5 }}>
        <strong>AMOUNT IN WORDS</strong><br/>{numberToWords(sub)} only.
      </div>
      {/* Totals */}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:28 }}>
        <table style={{ fontSize:13, minWidth:220 }}>
          <tbody>
            <tr><td style={{ padding:"4px 10px" }}>SUBTOTAL</td><td style={{ padding:"4px 10px", textAlign:"right" }}>{sub.toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
            <tr style={{ borderTop:"2px solid #0f1f3d", fontWeight:700, fontSize:15 }}>
              <td style={{ padding:"8px 10px" }}>Grand TOTAL</td>
              <td style={{ padding:"8px 10px", textAlign:"right" }}>{bill.grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #e5e7eb", paddingTop:18, fontSize:12 }}>
        <div style={{ lineHeight:1.9 }}>
          <strong style={{ textTransform:"uppercase", fontSize:11, letterSpacing:1 }}>NOTE FOR VANSH CONSULTANTS</strong><br/>
          All Cheques in favour of M/s Vansh Consultants<br/>
          SBI A/C No: 36766851239 &nbsp;|&nbsp; IFSC CODE: SBIN0008696<br/>
          SBI Shastri Nagar, Meerut
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ marginTop:48, borderTop:"1.5px solid #0f1f3d", paddingTop:6, fontSize:11, letterSpacing:1, textTransform:"uppercase", color:"#555" }}>(AUTH. Signatory)</div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [page, setPage] = useState("dashboard");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewBill, setPreviewBill] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // New bill form
  const blankForm = () => ({
    invoiceNo: "", date: today(),
    clientName:"", designation:"", address:"", contact:"", tan:"", status:"Unpaid",
    services:[{desc:"",amt:""},{desc:"",amt:""}]
  });
  const [form, setForm] = useState(blankForm());

  useEffect(() => {
    loadBills().then(b => { setBills(b); setLoading(false); });
  }, []);

  const saveBillsState = useCallback(async (newBills) => {
    setBills(newBills);
    await persistBills(newBills);
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  function doLogin() {
    if (loginUser.trim()==="admin" && loginPass==="vansh@2025") {
      setLoggedIn(true); setLoginErr("");
    } else { setLoginErr("Invalid username or password."); }
  }

  const grandTotal = form.services.reduce((s,r) => s+(parseFloat(r.amt)||0), 0);

  function addRow() { setForm(f=>({...f, services:[...f.services,{desc:"",amt:""}]})); }
  function removeRow(i) { setForm(f=>({...f, services:f.services.filter((_,j)=>j!==i)})); }
  function updateRow(i, field, val) {
    setForm(f=>{ const s=[...f.services]; s[i]={...s[i],[field]:val}; return {...f,services:s}; });
  }

  async function handleSave() {
    if (!form.invoiceNo.trim() || !form.clientName.trim()) { showToast("Fill Invoice No. and Client Name."); return; }
    const services = form.services.filter(s=>s.desc||s.amt).map((s,i)=>({sno:i+1,desc:s.desc,amt:parseFloat(s.amt)||0}));
    if (!services.length || grandTotal===0) { showToast("Add at least one service with an amount."); return; }
    const bill = { id:"bill_"+Date.now(), ...form, services, grandTotal };
    const updated = [...bills, bill];
    await saveBillsState(updated);
    showToast("✓ Bill saved!");
    setPreviewBill(bill);
    setForm(blankForm());
  }

  function handlePreview() {
    const services = form.services.filter(s=>s.desc||s.amt).map((s,i)=>({sno:i+1,desc:s.desc,amt:parseFloat(s.amt)||0}));
    setPreviewBill({ ...form, services, grandTotal, id:"preview" });
  }

  async function deleteBill(id) {
    if (!confirm("Delete this bill permanently?")) return;
    const updated = bills.filter(b=>b.id!==id);
    await saveBillsState(updated);
    showToast("Bill deleted.");
  }

  const filteredBills = [...bills].reverse().filter(b=>{
    const q = search.toLowerCase();
    return (!q || b.clientName.toLowerCase().includes(q) || b.invoiceNo.toLowerCase().includes(q))
      && (!filterStatus || b.status===filterStatus);
  });

  const totalAmount = bills.reduce((s,b)=>s+b.grandTotal,0);
  const unpaidCount = bills.filter(b=>b.status==="Unpaid").length;

  const navItems = [
    { id:"dashboard", icon:"⊞", label:"Dashboard" },
    { id:"newBill",   icon:"+", label:"New Bill" },
    { id:"allBills",  icon:"☰", label:"All Bills" },
  ];

  const statusColor = { Paid:"#dcfce7", Unpaid:"#fee2e2", Partial:"#fef9c3" };
  const statusText  = { Paid:"#15803d", Unpaid:"#dc2626", Partial:"#854d0e" };

  // ── LOGIN SCREEN ──
  if (!loggedIn) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f1f3d 0%,#1a3a6b 60%,#0a1628 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Georgia',serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing:border-box; }`}</style>
      <div style={{ background:"#fff", borderRadius:18, padding:"52px 44px", width:400, boxShadow:"0 30px 80px rgba(0,0,0,0.4)", textAlign:"center" }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, color:"#0f1f3d", fontWeight:700, letterSpacing:1 }}>Vansh Consultants</div>
        <div style={{ fontSize:11, color:"#999", letterSpacing:3, textTransform:"uppercase", marginBottom:36, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>Billing System</div>
        <div style={{ textAlign:"left", marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#888", letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", display:"block", marginBottom:6 }}>Username</label>
          <input value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="admin"
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }} />
        </div>
        <div style={{ textAlign:"left", marginBottom:24 }}>
          <label style={{ fontSize:11, fontWeight:600, color:"#888", letterSpacing:1.5, textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", display:"block", marginBottom:6 }}>Password</label>
          <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="••••••••"
            onKeyDown={e=>e.key==="Enter"&&doLogin()}
            style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none" }} />
        </div>
        {loginErr && <div style={{ color:"#dc2626", fontSize:13, marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>{loginErr}</div>}
        <button onClick={doLogin} style={{ width:"100%", padding:"13px", background:"#0f1f3d", color:"#fff", border:"none", borderRadius:8, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Sign In</button>
        <p style={{ fontSize:11, color:"#bbb", marginTop:18, fontFamily:"'DM Sans',sans-serif" }}>Default: admin / vansh@2025</p>
      </div>
    </div>
  );

  // ── APP ──
  return (
    <div style={{ minHeight:"100vh", background:"#f5f5f0", fontFamily:"'DM Sans',sans-serif", display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; }
        input,select,textarea { font-family:'DM Sans',sans-serif; }
        input:focus,select:focus,textarea:focus { outline:none; border-color:#c9a84c !important; }
        ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:#f1f1f1; } ::-webkit-scrollbar-thumb { background:#ccc; border-radius:3px; }
        @media print {
          body > div > div:first-child { display:none !important; }
          body > div > div:last-child { margin:0 !important; padding:0 !important; }
          #printModal { display:block !important; position:fixed; inset:0; z-index:9999; background:white; }
          #printModal > div:first-child { display:none; }
          #printModal > div:last-child { overflow:visible; max-height:none; }
        }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width:220, background:"#0f1f3d", minHeight:"100vh", position:"fixed", top:0, left:0, display:"flex", flexDirection:"column", zIndex:100 }}>
        <div style={{ padding:"28px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", color:"#c9a84c", fontSize:17, fontWeight:700, lineHeight:1.2 }}>Vansh Consultants</div>
          <div style={{ fontSize:9.5, color:"rgba(255,255,255,0.35)", letterSpacing:2, textTransform:"uppercase", marginTop:4 }}>Tax Consultancy</div>
        </div>
        <nav style={{ flex:1, padding:"20px 12px" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={()=>setPage(n.id)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:500, marginBottom:4, transition:"all 0.15s",
                background: page===n.id ? "#c9a84c" : "transparent",
                color: page===n.id ? "#0f1f3d" : "rgba(255,255,255,0.65)" }}>
              <span style={{ fontSize:16 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"0 12px 24px" }}>
          <button onClick={()=>setLoggedIn(false)}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, color:"rgba(255,255,255,0.4)", background:"transparent" }}>
            ← Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft:220, flex:1, padding:"36px 40px", minHeight:"100vh" }}>

        {/* ── DASHBOARD ── */}
        {page==="dashboard" && (
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#0f1f3d", fontWeight:700 }}>Dashboard</div>
            <div style={{ color:"#888", fontSize:14, marginBottom:28, marginTop:4 }}>Welcome back — here's your billing overview.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:32 }}>
              {[
                { label:"Total Bills", value:bills.length, hint:"All time", accent:"#c9a84c" },
                { label:"Total Billed", value:"₹"+totalAmount.toLocaleString("en-IN",{minimumFractionDigits:2}), hint:"Sum of all invoices", accent:"#16a34a" },
                { label:"Unpaid Bills", value:unpaidCount, hint:"Pending payment", accent:"#dc2626" },
              ].map(s=>(
                <div key={s.label} style={{ background:"#fff", borderRadius:12, padding:"22px 24px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)", borderLeft:`4px solid ${s.accent}` }}>
                  <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:"#0f1f3d", fontFamily:"'Cormorant Garamond',serif" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#aaa", marginTop:4 }}>{s.hint}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:12, padding:"24px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#0f1f3d", textTransform:"uppercase", letterSpacing:1.5, marginBottom:16 }}>Recent Bills</div>
              {loading ? <div style={{ color:"#aaa", padding:20 }}>Loading…</div> :
               bills.length===0 ? <div style={{ textAlign:"center", padding:"48px 20px", color:"#bbb" }}>No bills yet. Create your first invoice!</div> :
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                  {["Invoice No.","Client","Date","Amount","Status","Actions"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"9px 12px", fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"#aaa", fontWeight:600 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[...bills].reverse().slice(0,8).map(b=>(
                    <tr key={b.id} style={{ borderBottom:"1px solid #f5f5f0" }}>
                      <td style={{ padding:"12px 12px", fontWeight:600 }}>{b.invoiceNo}</td>
                      <td style={{ padding:"12px 12px" }}>{b.clientName}</td>
                      <td style={{ padding:"12px 12px", color:"#888" }}>{formatDate(b.date)}</td>
                      <td style={{ padding:"12px 12px", fontWeight:600 }}>₹{b.grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ background:statusColor[b.status], color:statusText[b.status], padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{b.status}</span>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <button onClick={()=>setPreviewBill(b)} style={{ padding:"5px 12px", background:"#0f1f3d", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", marginRight:6 }}>View</button>
                        <button onClick={()=>{ setPreviewBill(b); setTimeout(()=>window.print(),300); }} style={{ padding:"5px 12px", background:"#c9a84c", color:"#0f1f3d", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          </div>
        )}

        {/* ── NEW BILL ── */}
        {page==="newBill" && (
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#0f1f3d", fontWeight:700 }}>Create New Bill</div>
            <div style={{ color:"#888", fontSize:14, marginBottom:28, marginTop:4 }}>Fill in client details and add services.</div>

            {/* Invoice details */}
            <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f1f3d", textTransform:"uppercase", letterSpacing:1.5, marginBottom:18 }}>Invoice Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[["Invoice Number","invoiceNo","text","e.g. 2025-26/228"],["Date","date","date",""]].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
                    <input type={type} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph}
                      style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Client details */}
            <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f1f3d", textTransform:"uppercase", letterSpacing:1.5, marginBottom:18 }}>Client Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                {[
                  ["Client / Organisation Name","clientName","text","e.g. Mukhya Pashuchikitsa Adhikari"],
                  ["Designation / Role (optional)","designation","text","e.g. Chief Veterinary Officer"],
                  ["Address","address","text","City, State"],
                  ["Contact No.","contact","text","10-digit mobile"],
                  ["TAN No. (optional)","tan","text","e.g. MRTM00122D"],
                ].map(([label,field,type,ph])=>(
                  <div key={field}>
                    <div style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
                    <input type={type} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph}
                      style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14 }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#aaa", letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>Payment Status</div>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                    style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, background:"#fff" }}>
                    <option>Unpaid</option><option>Paid</option><option>Partial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Services */}
            <div style={{ background:"#fff", borderRadius:12, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0f1f3d", textTransform:"uppercase", letterSpacing:1.5, marginBottom:18 }}>Services</div>
              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
                <thead><tr style={{ background:"#0f1f3d" }}>
                  <th style={{ padding:"10px 12px", color:"#fff", fontSize:11, letterSpacing:1, textAlign:"left", width:50 }}>S.No</th>
                  <th style={{ padding:"10px 12px", color:"#fff", fontSize:11, letterSpacing:1, textAlign:"left" }}>Particulars (Service Description)</th>
                  <th style={{ padding:"10px 12px", color:"#fff", fontSize:11, letterSpacing:1, textAlign:"left", width:140 }}>Amount (₹)</th>
                  <th style={{ width:40 }}></th>
                </tr></thead>
                <tbody>
                  {form.services.map((s,i)=>(
                    <tr key={i} style={{ borderBottom:"1px solid #f0f0f0" }}>
                      <td style={{ padding:"8px 6px", textAlign:"center", fontWeight:600, color:"#999" }}>{i+1}</td>
                      <td style={{ padding:"8px 6px" }}>
                        <input value={s.desc} onChange={e=>updateRow(i,"desc",e.target.value)} placeholder="e.g. Preparation & Filing of GSTR7..."
                          style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #e5e7eb", borderRadius:6, fontSize:13 }} />
                      </td>
                      <td style={{ padding:"8px 6px" }}>
                        <input type="number" value={s.amt} onChange={e=>updateRow(i,"amt",e.target.value)} placeholder="0.00" min="0" step="0.01"
                          style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #e5e7eb", borderRadius:6, fontSize:13 }} />
                      </td>
                      <td style={{ textAlign:"center" }}>
                        <button onClick={()=>removeRow(i)} style={{ background:"none", border:"none", color:"#dc2626", fontSize:20, cursor:"pointer", lineHeight:1 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addRow} style={{ padding:"8px 18px", background:"#fdf8f0", border:"1.5px dashed #c9a84c", color:"#0f1f3d", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600, marginBottom:20 }}>+ Add Service</button>

              {/* Totals */}
              <div style={{ background:"#fdf8f0", borderRadius:10, padding:"14px 20px", textAlign:"right", marginBottom:22 }}>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:48, fontSize:14, marginBottom:6 }}>
                  <span style={{ color:"#888" }}>Subtotal:</span>
                  <span style={{ fontWeight:600 }}>₹ {grandTotal.toFixed(2)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:48, fontSize:18, fontWeight:700, color:"#0f1f3d", borderTop:"2px solid #c9a84c", paddingTop:10, marginTop:4 }}>
                  <span>Grand Total:</span>
                  <span>₹ {grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button onClick={handlePreview} style={{ padding:"12px 28px", background:"#f5f5f0", color:"#0f1f3d", border:"1.5px solid #e5e7eb", borderRadius:8, fontWeight:600, fontSize:14, cursor:"pointer" }}>👁 Preview</button>
                <button onClick={handleSave} style={{ padding:"12px 36px", background:"#c9a84c", color:"#0f1f3d", border:"none", borderRadius:8, fontWeight:700, fontSize:15, cursor:"pointer" }}>Save & Generate Bill</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ALL BILLS ── */}
        {page==="allBills" && (
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, color:"#0f1f3d", fontWeight:700 }}>All Bills</div>
            <div style={{ color:"#888", fontSize:14, marginBottom:24, marginTop:4 }}>Search, view, print or delete your saved invoices.</div>
            <div style={{ display:"flex", gap:12, marginBottom:20 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by client or invoice number…"
                style={{ flex:1, padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, background:"#fff" }} />
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
                style={{ padding:"10px 14px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:14, background:"#fff" }}>
                <option value="">All Status</option><option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select>
            </div>
            <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              {loading ? <div style={{ color:"#aaa", padding:40, textAlign:"center" }}>Loading…</div> :
               filteredBills.length===0 ? <div style={{ textAlign:"center", padding:"60px 20px", color:"#bbb" }}>No bills found.</div> :
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
                <thead><tr style={{ borderBottom:"2px solid #f0f0f0" }}>
                  {["Invoice No.","Client","Address","Date","Amount","Status","Actions"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"10px 12px", fontSize:11, textTransform:"uppercase", letterSpacing:1, color:"#aaa", fontWeight:600 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredBills.map(b=>(
                    <tr key={b.id} style={{ borderBottom:"1px solid #f5f5f0" }}>
                      <td style={{ padding:"12px 12px", fontWeight:600 }}>{b.invoiceNo}</td>
                      <td style={{ padding:"12px 12px" }}>{b.clientName}</td>
                      <td style={{ padding:"12px 12px", color:"#888" }}>{b.address||"—"}</td>
                      <td style={{ padding:"12px 12px", color:"#888" }}>{formatDate(b.date)}</td>
                      <td style={{ padding:"12px 12px", fontWeight:600 }}>₹{b.grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
                      <td style={{ padding:"12px 12px" }}>
                        <span style={{ background:statusColor[b.status], color:statusText[b.status], padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700 }}>{b.status}</span>
                      </td>
                      <td style={{ padding:"12px 12px" }}>
                        <button onClick={()=>setPreviewBill(b)} style={{ padding:"5px 12px", background:"#0f1f3d", color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", marginRight:4 }}>View</button>
                        <button onClick={()=>{ setPreviewBill(b); setTimeout(()=>window.print(),300); }} style={{ padding:"5px 12px", background:"#c9a84c", color:"#0f1f3d", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer", marginRight:4 }}>Print</button>
                        <button onClick={()=>deleteBill(b.id)} style={{ padding:"5px 12px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          </div>
        )}
      </div>

      {/* ── BILL PREVIEW MODAL ── */}
      {previewBill && (
        <div id="printModal" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:14, width:740, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 30px 80px rgba(0,0,0,0.4)", overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 24px", borderBottom:"1px solid #f0f0f0", background:"#fff" }}>
              <span style={{ fontWeight:700, fontSize:15, color:"#0f1f3d" }}>Invoice Preview — {previewBill.invoiceNo}</span>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>window.print()} style={{ padding:"7px 16px", background:"#c9a84c", color:"#0f1f3d", border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer" }}>🖨 Print</button>
                <button onClick={()=>setPreviewBill(null)} style={{ padding:"7px 14px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:7, fontSize:13, fontWeight:600, cursor:"pointer" }}>✕ Close</button>
              </div>
            </div>
            <div style={{ overflowY:"auto", flex:1 }}>
              <BillPrint bill={previewBill} />
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, right:28, background:"#0f1f3d", color:"#fff", padding:"12px 22px", borderRadius:10, fontSize:14, fontWeight:500, zIndex:9999, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", animation:"fadeIn 0.3s" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
