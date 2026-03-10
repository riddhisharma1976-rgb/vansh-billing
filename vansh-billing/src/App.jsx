import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bvivbizffdvkqfgftlp.supabase.co";
const SUPABASE_KEY = "sb_publishable_4Ta6M0JEOEGSa4bTFMQbOQ_PK8T2qcU";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

function normBill(b) {
  return { ...b, invoiceNo: b.invoice_no||b.invoiceNo||"", clientName: b.client_name||b.clientName||"", grandTotal: Number(b.grand_total||b.grandTotal||0) };
}

function printBillInNewWindow(bill) {
  const services = bill.services || [];
  const sub = services.reduce((s,r) => s + Number(r.amt), 0);
  const rows = services.map((s,i) => `<tr><td style="padding:11px 12px">${i+1}.</td><td style="padding:11px 12px">${s.desc}</td><td style="padding:11px 12px;text-align:right;font-weight:600">${Number(s.amt).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice - ${bill.invoiceNo||bill.invoice_no}</title>
  <style>body{font-family:Georgia,serif;font-size:13px;color:#111;margin:0;padding:40px 48px;line-height:1.7}
  .hdr{display:flex;justify-content:space-between;border-bottom:3px solid #0f1f3d;padding-bottom:20px;margin-bottom:24px}
  .fn{font-size:22px;font-weight:700;color:#0f1f3d;letter-spacing:1px}
  .fa{font-size:11.5px;color:#555;margin-top:4px;line-height:1.8}
  table.items{width:100%;border-collapse:collapse;margin-bottom:20px}
  table.items thead tr{background:#0f1f3d;color:#fff}
  table.items th{padding:9px 12px;text-align:left;font-size:11px;letter-spacing:1px}
  table.items td{border-bottom:1px solid #e5e7eb}
  .words{background:#fdf8f0;border-left:4px solid #c9a84c;padding:9px 14px;margin-bottom:20px;font-size:12.5px}
  .tot{float:right;min-width:220px;margin-bottom:28px}
  .tot table{width:100%;font-size:13px;border-collapse:collapse}
  .tot td{padding:4px 10px}
  .grand{border-top:2px solid #0f1f3d;font-weight:700;font-size:15px}
  .grand td{padding-top:8px}
  .cf{clear:both}
  .ftr{display:flex;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:18px;font-size:12px}
  .sig{margin-top:48px;border-top:1.5px solid #0f1f3d;padding-top:6px;font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;text-align:right}
  @media print{body{padding:20px 32px}}</style></head><body>
  <div class="hdr"><div><div class="fn">VANSH CONSULTANTS</div><div class="fa">119, Arya Nagar, S.K. Road, Meerut<br/>Meerut | Contact No.: 9760896485, 8864876629<br/>Mail id: vanshconsultants@rediffmail.com</div></div>
  <div style="text-align:right"><div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#c9a84c;font-weight:700">Invoice</div>
  <div style="font-size:20px;font-weight:700;color:#0f1f3d">${bill.invoiceNo||bill.invoice_no}</div>
  <div style="font-size:12px;color:#555;margin-top:6px">Date: ${formatDate(bill.date).toUpperCase()}</div></div></div>
  <div style="margin-bottom:24px"><div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#888;margin-bottom:6px">To,</div>
  <div style="font-weight:700;font-size:14px;color:#0f1f3d">${(bill.clientName||bill.client_name||"").toUpperCase()}${bill.designation?", "+bill.designation.toUpperCase():""}</div>
  ${bill.address?`<div>Address: ${bill.address}</div>`:""}${bill.contact?`<div>Contact No: ${bill.contact}</div>`:""}${bill.tan?`<div>TAN No: ${bill.tan}</div>`:""}</div>
  <table class="items"><thead><tr><th style="width:50px">S.NO</th><th>PARTICULARS</th><th style="width:120px;text-align:right">AMOUNT</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="words"><strong>AMOUNT IN WORDS</strong><br/>${numberToWords(sub)} only.</div>
  <div class="tot"><table><tr><td>SUBTOTAL</td><td style="text-align:right">${sub.toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
  <tr class="grand"><td>Grand TOTAL</td><td style="text-align:right">${Number(bill.grandTotal||bill.grand_total||sub).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr></table></div>
  <div class="cf"></div>
  <div class="ftr"><div style="line-height:1.9"><strong style="text-transform:uppercase;font-size:11px;letter-spacing:1px">NOTE FOR VANSH CONSULTANTS</strong><br/>
  All Cheques in favour of M/s Vansh Consultants<br/>SBI A/C No: 36766851239 &nbsp;|&nbsp; IFSC CODE: SBIN0008696<br/>SBI Shastri Nagar, Meerut</div>
  <div class="sig">(AUTH. Signatory)</div></div>
  <script>window.onload=function(){window.print()}<\/script></body></html>`;
  const w = window.open("","_blank"); w.document.write(html); w.document.close();
}

function BillPrint({ bill }) {
  const sub = (bill.services||[]).reduce((s,r) => s + Number(r.amt), 0);
  return (
    <div style={{fontFamily:"Georgia,serif",fontSize:13,color:"#111",padding:"40px 48px",lineHeight:1.7,background:"#fff"}}>
      <div style={{display:"flex",justifyContent:"space-between",borderBottom:"3px solid #0f1f3d",paddingBottom:20,marginBottom:24}}>
        <div>
          <div style={{fontSize:22,fontWeight:700,color:"#0f1f3d",letterSpacing:1}}>VANSH CONSULTANTS</div>
          <div style={{fontSize:11.5,color:"#555",marginTop:4,lineHeight:1.8}}>119, Arya Nagar, S.K. Road, Meerut<br/>Meerut | Contact No.: 9760896485, 8864876629<br/>Mail id: vanshconsultants@rediffmail.com</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#c9a84c",fontWeight:700}}>Invoice</div>
          <div style={{fontSize:20,fontWeight:700,color:"#0f1f3d"}}>{bill.invoiceNo||bill.invoice_no}</div>
          <div style={{fontSize:12,color:"#555",marginTop:6}}>Date: {formatDate(bill.date).toUpperCase()}</div>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,color:"#888",marginBottom:6}}>To,</div>
        <div style={{fontWeight:700,fontSize:14,color:"#0f1f3d"}}>{(bill.clientName||bill.client_name||"").toUpperCase()}{bill.designation?", "+bill.designation.toUpperCase():""}</div>
        {bill.address&&<div>Address: {bill.address}</div>}
        {bill.contact&&<div>Contact No: {bill.contact}</div>}
        {bill.tan&&<div>TAN No: {bill.tan}</div>}
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20,fontSize:13}}>
        <thead><tr style={{background:"#0f1f3d",color:"#fff"}}>
          <th style={{padding:"9px 12px",textAlign:"left",width:50,fontSize:11}}>S.NO</th>
          <th style={{padding:"9px 12px",textAlign:"left",fontSize:11}}>PARTICULARS</th>
          <th style={{padding:"9px 12px",textAlign:"right",width:120,fontSize:11}}>AMOUNT</th>
        </tr></thead>
        <tbody>{(bill.services||[]).map((s,i)=>(
          <tr key={i} style={{borderBottom:"1px solid #e5e7eb"}}>
            <td style={{padding:"11px 12px"}}>{i+1}.</td>
            <td style={{padding:"11px 12px"}}>{s.desc}</td>
            <td style={{padding:"11px 12px",textAlign:"right",fontWeight:600}}>{Number(s.amt).toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{background:"#fdf8f0",borderLeft:"4px solid #c9a84c",padding:"9px 14px",marginBottom:20,fontSize:12.5}}><strong>AMOUNT IN WORDS</strong><br/>{numberToWords(sub)} only.</div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:28}}>
        <table style={{fontSize:13,minWidth:220}}>
          <tbody>
            <tr><td style={{padding:"4px 10px"}}>SUBTOTAL</td><td style={{padding:"4px 10px",textAlign:"right"}}>{sub.toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
            <tr style={{borderTop:"2px solid #0f1f3d",fontWeight:700,fontSize:15}}><td style={{padding:"8px 10px"}}>Grand TOTAL</td><td style={{padding:"8px 10px",textAlign:"right"}}>{Number(bill.grandTotal||bill.grand_total||sub).toLocaleString("en-IN",{minimumFractionDigits:2})}</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid #e5e7eb",paddingTop:18,fontSize:12}}>
        <div style={{lineHeight:1.9}}><strong style={{textTransform:"uppercase",fontSize:11,letterSpacing:1}}>NOTE FOR VANSH CONSULTANTS</strong><br/>All Cheques in favour of M/s Vansh Consultants<br/>SBI A/C No: 36766851239 &nbsp;|&nbsp; IFSC CODE: SBIN0008696<br/>SBI Shastri Nagar, Meerut</div>
        <div style={{textAlign:"right"}}><div style={{marginTop:48,borderTop:"1.5px solid #0f1f3d",paddingTop:6,fontSize:11,letterSpacing:1,textTransform:"uppercase",color:"#555"}}>(AUTH. Signatory)</div></div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [page, setPage] = useState("dashboard");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewBill, setPreviewBill] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const blankForm = () => ({ invoiceNo:"", date:today(), clientName:"", designation:"", address:"", contact:"", tan:"", status:"Unpaid", services:[{desc:"",amt:""},{desc:"",amt:""}] });
  const [form, setForm] = useState(blankForm());

  async function fetchBills() {
    setLoading(true);
    const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending:false });
    if (!error && data) setBills(data);
    else if (error) showToast("Error: " + error.message);
    setLoading(false);
  }

  useEffect(() => { fetchBills(); }, []);

  function showToast(msg) { setToast(msg); setTimeout(()=>setToast(""), 3500); }

  function doLogin() {
    if (loginUser.trim()==="admin" && loginPass==="vansh@2025") { setLoggedIn(true); setLoginErr(""); }
    else setLoginErr("Invalid username or password.");
  }

  const grandTotal = form.services.reduce((s,r) => s+(parseFloat(r.amt)||0), 0);
  function addRow() { setForm(f=>({...f,services:[...f.services,{desc:"",amt:""}]})); }
  function removeRow(i) { setForm(f=>({...f,services:f.services.filter((_,j)=>j!==i)})); }
  function updateRow(i,field,val) { setForm(f=>{ const s=[...f.services]; s[i]={...s[i],[field]:val}; return {...f,services:s}; }); }

  async function handleSave() {
    if (!form.invoiceNo.trim()||!form.clientName.trim()) { showToast("Fill Invoice No. and Client Name."); return; }
    const services = form.services.filter(s=>s.desc||s.amt).map((s,i)=>({sno:i+1,desc:s.desc,amt:parseFloat(s.amt)||0}));
    if (!services.length||grandTotal===0) { showToast("Add at least one service with an amount."); return; }
    setSaving(true);
    const { data, error } = await supabase.from("bills").insert([{
      id:"bill_"+Date.now(), invoice_no:form.invoiceNo, date:form.date, client_name:form.clientName,
      designation:form.designation, address:form.address, contact:form.contact, tan:form.tan,
      status:form.status, services, grand_total:grandTotal,
    }]).select().single();
    setSaving(false);
    if (error) { showToast("Error saving: "+error.message); return; }
    showToast("✓ Bill saved & synced to all devices!");
    setBills(prev=>[data,...prev]);
    setPreviewBill(normBill(data));
    setForm(blankForm());
    setPage("dashboard");
  }

  async function deleteBill(id) {
    if (!confirm("Delete this bill permanently?")) return;
    const { error } = await supabase.from("bills").delete().eq("id",id);
    if (error) { showToast("Error: "+error.message); return; }
    setBills(prev=>prev.filter(b=>b.id!==id));
    showToast("Bill deleted.");
  }

  function handlePreview() {
    const services = form.services.filter(s=>s.desc||s.amt).map((s,i)=>({sno:i+1,desc:s.desc,amt:parseFloat(s.amt)||0}));
    setPreviewBill({invoiceNo:form.invoiceNo,invoice_no:form.invoiceNo,clientName:form.clientName,client_name:form.clientName,date:form.date,designation:form.designation,address:form.address,contact:form.contact,tan:form.tan,services,grand_total:grandTotal,grandTotal});
  }

  const filteredBills = bills.filter(b=>{
    const q=search.toLowerCase();
    return (!q||(b.client_name||"").toLowerCase().includes(q)||(b.invoice_no||"").toLowerCase().includes(q))&&(!filterStatus||b.status===filterStatus);
  });

  const totalAmount = bills.reduce((s,b)=>s+Number(b.grand_total||0),0);
  const unpaidCount = bills.filter(b=>b.status==="Unpaid").length;
  const statusColor = {Paid:"#dcfce7",Unpaid:"#fee2e2",Partial:"#fef9c3"};
  const statusText  = {Paid:"#15803d",Unpaid:"#dc2626",Partial:"#854d0e"};

  if (!loggedIn) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f1f3d 0%,#1a3a6b 60%,#0a1628 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;600&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{background:"#fff",borderRadius:18,padding:"52px 44px",width:400,boxShadow:"0 30px 80px rgba(0,0,0,0.4)",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,color:"#0f1f3d",fontWeight:700,letterSpacing:1}}>Vansh Consultants</div>
        <div style={{fontSize:11,color:"#999",letterSpacing:3,textTransform:"uppercase",marginBottom:36,marginTop:4}}>Billing System</div>
        {[["Username","text",loginUser,setLoginUser,"admin"],["Password","password",loginPass,setLoginPass,"••••••••"]].map(([label,type,val,set,ph])=>(
          <div key={label} style={{textAlign:"left",marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:1.5,textTransform:"uppercase",display:"block",marginBottom:6}}>{label}</label>
            <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph} onKeyDown={e=>e.key==="Enter"&&doLogin()}
              style={{width:"100%",padding:"11px 14px",border:"1.5px solid #e5e7eb",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}/>
          </div>
        ))}
        {loginErr&&<div style={{color:"#dc2626",fontSize:13,marginBottom:12}}>{loginErr}</div>}
        <button onClick={doLogin} style={{width:"100%",padding:13,background:"#0f1f3d",color:"#fff",border:"none",borderRadius:8,fontSize:15,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Sign In</button>
        <p style={{fontSize:11,color:"#bbb",marginTop:18}}>Default: admin / vansh@2025</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#f5f5f0",fontFamily:"'DM Sans',sans-serif",display:"flex"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:wght@400;500;600&display=swap');*{box-sizing:border-box}input:focus,select:focus{outline:none;border-color:#c9a84c!important}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}`}</style>
      <div style={{width:220,background:"#0f1f3d",minHeight:"100vh",position:"fixed",top:0,left:0,display:"flex",flexDirection:"column",zIndex:100}}>
        <div style={{padding:"28px 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",color:"#c9a84c",fontSize:17,fontWeight:700,lineHeight:1.2}}>Vansh Consultants</div>
          <div style={{fontSize:9.5,color:"rgba(255,255,255,0.35)",letterSpacing:2,textTransform:"uppercase",marginTop:4}}>Tax Consultancy</div>
        </div>
        <nav style={{flex:1,padding:"20px 12px"}}>
          {[{id:"dashboard",icon:"⊞",label:"Dashboard"},{id:"newBill",icon:"+",label:"New Bill"},{id:"allBills",icon:"☰",label:"All Bills"}].map(n=>(
            <button key={n.id} onClick={()=>{setPage(n.id);if(n.id==="allBills")fetchBills();}}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,marginBottom:4,background:page===n.id?"#c9a84c":"transparent",color:page===n.id?"#0f1f3d":"rgba(255,255,255,0.65)"}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{padding:"0 12px 24px"}}>
          <button onClick={()=>setLoggedIn(false)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,color:"rgba(255,255,255,0.4)",background:"transparent"}}>← Logout</button>
        </div>
      </div>

      <div style={{marginLeft:220,flex:1,padding:"36px 40px",minHeight:"100vh"}}>
        {page==="dashboard"&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#0f1f3d",fontWeight:700}}>Dashboard</div>
            <div style={{color:"#888",fontSize:14,marginBottom:28,marginTop:4}}>Bills sync across all your devices in real time. 🔄</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:32}}>
              {[{label:"Total Bills",value:bills.length,hint:"All time",accent:"#c9a84c"},{label:"Total Billed",value:"₹"+totalAmount.toLocaleString("en-IN",{minimumFractionDigits:2}),hint:"Sum of all invoices",accent:"#16a34a"},{label:"Unpaid Bills",value:unpaidCount,hint:"Pending payment",accent:"#dc2626"}].map(s=>(
                <div key={s.label} style={{background:"#fff",borderRadius:12,padding:"22px 24px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)",borderLeft:`4px solid ${s.accent}`}}>
                  <div style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:28,fontWeight:700,color:"#0f1f3d",fontFamily:"'Cormorant Garamond',serif"}}>{s.value}</div>
                  <div style={{fontSize:11,color:"#aaa",marginTop:4}}>{s.hint}</div>
                </div>
              ))}
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:24,boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:"#0f1f3d",textTransform:"uppercase",letterSpacing:1.5}}>Recent Bills</div>
                <button onClick={fetchBills} style={{fontSize:12,color:"#c9a84c",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>↻ Refresh</button>
              </div>
              {loading?<div style={{color:"#aaa",padding:20,textAlign:"center"}}>Loading from database…</div>:bills.length===0?<div style={{textAlign:"center",padding:"48px 20px",color:"#bbb"}}>No bills yet.</div>:
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                <thead><tr style={{borderBottom:"2px solid #f0f0f0"}}>{["Invoice No.","Client","Date","Amount","Status","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"9px 12px",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#aaa",fontWeight:600}}>{h}</th>)}</tr></thead>
                <tbody>{bills.slice(0,8).map(b=>{const nb=normBill(b);return(
                  <tr key={b.id} style={{borderBottom:"1px solid #f5f5f0"}}>
                    <td style={{padding:"12px 12px",fontWeight:600}}>{nb.invoiceNo}</td>
                    <td style={{padding:"12px 12px"}}>{nb.clientName}</td>
                    <td style={{padding:"12px 12px",color:"#888"}}>{formatDate(b.date)}</td>
                    <td style={{padding:"12px 12px",fontWeight:600}}>₹{nb.grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
                    <td style={{padding:"12px 12px"}}><span style={{background:statusColor[b.status],color:statusText[b.status],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{b.status}</span></td>
                    <td style={{padding:"12px 12px"}}>
                      <button onClick={()=>setPreviewBill(nb)} style={{padding:"5px 12px",background:"#0f1f3d",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",marginRight:6}}>View</button>
                      <button onClick={()=>printBillInNewWindow(nb)} style={{padding:"5px 12px",background:"#c9a84c",color:"#0f1f3d",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer"}}>Print</button>
                    </td>
                  </tr>
                );})}</tbody>
              </table>}
            </div>
          </div>
        )}

        {page==="newBill"&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#0f1f3d",fontWeight:700}}>Create New Bill</div>
            <div style={{color:"#888",fontSize:14,marginBottom:28,marginTop:4}}>Fill in client details and add services.</div>
            <div style={{background:"#fff",borderRadius:12,padding:28,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0f1f3d",textTransform:"uppercase",letterSpacing:1.5,marginBottom:18}}>Invoice Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Invoice Number","invoiceNo","text","e.g. 2025-26/228"],["Date","date","date",""]].map(([label,field,type,ph])=>(
                  <div key={field}><div style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{label}</div>
                  <input type={type} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14}}/></div>
                ))}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:28,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0f1f3d",textTransform:"uppercase",letterSpacing:1.5,marginBottom:18}}>Client Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {[["Client / Organisation Name","clientName","text","e.g. Mukhya Pashuchikitsa Adhikari"],["Designation (optional)","designation","text","e.g. Chief Veterinary Officer"],["Address","address","text","City, State"],["Contact No.","contact","text","10-digit mobile"],["TAN No. (optional)","tan","text","e.g. MRTM00122D"]].map(([label,field,type,ph])=>(
                  <div key={field}><div style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{label}</div>
                  <input type={type} value={form[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14}}/></div>
                ))}
                <div><div style={{fontSize:11,fontWeight:600,color:"#aaa",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Payment Status</div>
                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={{width:"100%",padding:"10px 13px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,background:"#fff"}}>
                  <option>Unpaid</option><option>Paid</option><option>Partial</option>
                </select></div>
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:28,boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#0f1f3d",textTransform:"uppercase",letterSpacing:1.5,marginBottom:18}}>Services</div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:12}}>
                <thead><tr style={{background:"#0f1f3d"}}>
                  <th style={{padding:"10px 12px",color:"#fff",fontSize:11,textAlign:"left",width:50}}>S.No</th>
                  <th style={{padding:"10px 12px",color:"#fff",fontSize:11,textAlign:"left"}}>Particulars</th>
                  <th style={{padding:"10px 12px",color:"#fff",fontSize:11,textAlign:"left",width:140}}>Amount (₹)</th>
                  <th style={{width:40}}></th>
                </tr></thead>
                <tbody>{form.services.map((s,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f0f0f0"}}>
                    <td style={{padding:"8px 6px",textAlign:"center",fontWeight:600,color:"#999"}}>{i+1}</td>
                    <td style={{padding:"8px 6px"}}><input value={s.desc} onChange={e=>updateRow(i,"desc",e.target.value)} placeholder="e.g. Preparation & Filing of GSTR7..." style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e5e7eb",borderRadius:6,fontSize:13}}/></td>
                    <td style={{padding:"8px 6px"}}><input type="number" value={s.amt} onChange={e=>updateRow(i,"amt",e.target.value)} placeholder="0.00" min="0" step="0.01" style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e5e7eb",borderRadius:6,fontSize:13}}/></td>
                    <td style={{textAlign:"center"}}><button onClick={()=>removeRow(i)} style={{background:"none",border:"none",color:"#dc2626",fontSize:20,cursor:"pointer",lineHeight:1}}>×</button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button onClick={addRow} style={{padding:"8px 18px",background:"#fdf8f0",border:"1.5px dashed #c9a84c",color:"#0f1f3d",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:20}}>+ Add Service</button>
              <div style={{background:"#fdf8f0",borderRadius:10,padding:"14px 20px",textAlign:"right",marginBottom:22}}>
                <div style={{display:"flex",justifyContent:"flex-end",gap:48,fontSize:14,marginBottom:6}}><span style={{color:"#888"}}>Subtotal:</span><span style={{fontWeight:600}}>₹ {grandTotal.toFixed(2)}</span></div>
                <div style={{display:"flex",justifyContent:"flex-end",gap:48,fontSize:18,fontWeight:700,color:"#0f1f3d",borderTop:"2px solid #c9a84c",paddingTop:10,marginTop:4}}><span>Grand Total:</span><span>₹ {grandTotal.toFixed(2)}</span></div>
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
                <button onClick={handlePreview} style={{padding:"12px 28px",background:"#f5f5f0",color:"#0f1f3d",border:"1.5px solid #e5e7eb",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer"}}>👁 Preview</button>
                <button onClick={handleSave} disabled={saving} style={{padding:"12px 36px",background:saving?"#aaa":"#c9a84c",color:"#0f1f3d",border:"none",borderRadius:8,fontWeight:700,fontSize:15,cursor:saving?"not-allowed":"pointer"}}>{saving?"Saving…":"Save & Generate Bill"}</button>
              </div>
            </div>
          </div>
        )}

        {page==="allBills"&&(
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#0f1f3d",fontWeight:700}}>All Bills</div>
            <div style={{color:"#888",fontSize:14,marginBottom:24,marginTop:4}}>Synced across all your devices in real time. 🔄</div>
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by client or invoice number…" style={{flex:1,padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,background:"#fff"}}/>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"10px 14px",border:"1.5px solid #e5e7eb",borderRadius:8,fontSize:14,background:"#fff"}}>
                <option value="">All Status</option><option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select>
              <button onClick={fetchBills} style={{padding:"10px 18px",background:"#0f1f3d",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>↻ Refresh</button>
            </div>
            <div style={{background:"#fff",borderRadius:12,boxShadow:"0 2px 16px rgba(0,0,0,0.07)",overflow:"hidden"}}>
              {loading?<div style={{color:"#aaa",padding:40,textAlign:"center"}}>Loading from database…</div>:filteredBills.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#bbb"}}>No bills found.</div>:
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                <thead><tr style={{borderBottom:"2px solid #f0f0f0"}}>{["Invoice No.","Client","Address","Date","Amount","Status","Actions"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:11,textTransform:"uppercase",letterSpacing:1,color:"#aaa",fontWeight:600}}>{h}</th>)}</tr></thead>
                <tbody>{filteredBills.map(b=>{const nb=normBill(b);return(
                  <tr key={b.id} style={{borderBottom:"1px solid #f5f5f0"}}>
                    <td style={{padding:"12px 12px",fontWeight:600}}>{nb.invoiceNo}</td>
                    <td style={{padding:"12px 12px"}}>{nb.clientName}</td>
                    <td style={{padding:"12px 12px",color:"#888"}}>{b.address||"—"}</td>
                    <td style={{padding:"12px 12px",color:"#888"}}>{formatDate(b.date)}</td>
                    <td style={{padding:"12px 12px",fontWeight:600}}>₹{nb.grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</td>
                    <td style={{padding:"12px 12px"}}><span style={{background:statusColor[b.status],color:statusText[b.status],padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{b.status}</span></td>
                    <td style={{padding:"12px 12px"}}>
                      <button onClick={()=>setPreviewBill(nb)} style={{padding:"5px 12px",background:"#0f1f3d",color:"#fff",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",marginRight:4}}>View</button>
                      <button onClick={()=>printBillInNewWindow(nb)} style={{padding:"5px 12px",background:"#c9a84c",color:"#0f1f3d",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",marginRight:4}}>Print</button>
                      <button onClick={()=>deleteBill(b.id)} style={{padding:"5px 12px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer"}}>Delete</button>
                    </td>
                  </tr>
                );})}</tbody>
              </table>}
            </div>
          </div>
        )}
      </div>

      {previewBill&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:14,width:740,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 30px 80px rgba(0,0,0,0.4)",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid #f0f0f0"}}>
              <span style={{fontWeight:700,fontSize:15,color:"#0f1f3d"}}>Invoice Preview — {previewBill.invoiceNo||previewBill.invoice_no}</span>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>printBillInNewWindow(previewBill)} style={{padding:"7px 16px",background:"#c9a84c",color:"#0f1f3d",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer"}}>🖨 Print</button>
                <button onClick={()=>setPreviewBill(null)} style={{padding:"7px 14px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>✕ Close</button>
              </div>
            </div>
            <div style={{overflowY:"auto",flex:1}}><BillPrint bill={previewBill}/></div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:"fixed",bottom:28,right:28,background:"#0f1f3d",color:"#fff",padding:"12px 22px",borderRadius:10,fontSize:14,fontWeight:500,zIndex:9999,boxShadow:"0 8px 32px rgba(0,0,0,0.25)"}}>{toast}</div>}
    </div>
  );
}
