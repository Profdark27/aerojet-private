import { useState, useEffect, useRef } from "react"

const G = "#C9A84C"
const D = "#0A0C14"
const C = "#0F1220"
const M = "rgba(240,237,230,0.5)"
const sans = "'Helvetica Neue',Helvetica,sans-serif"
const serif = "'Cormorant Garamond',Georgia,serif"

const fmt = n => "€" + n.toLocaleString("it-IT")

// ─── SCREENS DATA ───────────────────────────────────────────────────────────────
const SCREENS = [
  { id: "home",      label: "Homepage",     icon: "◈", path: "/" },
  { id: "search",    label: "Ricerca Voli", icon: "✦", path: "/search" },
  { id: "results",   label: "Risultati",    icon: "◆", path: "/search?results" },
  { id: "booking",   label: "Prenotazione", icon: "◻", path: "/booking" },
  { id: "payment",   label: "Pagamento",    icon: "▲", path: "/booking/payment" },
  { id: "success",   label: "Conferma",     icon: "★", path: "/booking/success" },
  { id: "dashboard", label: "Dashboard",    icon: "◧", path: "/dashboard" },
  { id: "pipeline",  label: "Pipeline",     icon: "⊞", path: "/dashboard/pipeline" },
  { id: "quotes",    label: "Preventivi",   icon: "✉", path: "/dashboard/quotes" },
  { id: "analytics", label: "Analytics",    icon: "📊", path: "/dashboard/analytics" },
  { id: "marco",     label: "Marco AI",     icon: "🤖", path: "/api/chat" },
  { id: "whatsapp",  label: "WhatsApp",     icon: "📱", path: "whatsapp" },
]

const JETS = [
  { model:"Pilatus PC-12 NGX", cat:"Turboprop", op:"AirStar", price:5880, pax:8, rating:4.7, time:"2h 05m", logo:"AS" },
  { model:"Phenom 300E", cat:"Light Jet", op:"VistaJet", price:8190, pax:7, rating:4.9, time:"2h 05m", logo:"VJ" },
  { model:"Challenger 350", cat:"Super Midsize", op:"Luxaviation", price:15120, pax:10, rating:4.8, time:"2h 00m", logo:"LX" },
  { model:"Falcon 7X", cat:"Heavy Jet", op:"NetJets", price:20580, pax:16, rating:5.0, time:"1h 55m", logo:"NJ" },
  { model:"Global 7500", cat:"Ultra-Long Range", op:"Air Charter Service", price:30450, pax:19, rating:5.0, time:"1h 50m", logo:"AC" },
]

const LEGS = [
  { from:"Milano",to:"Londra",date:"Dom 26 Apr",discount:59,price:6800,aircraft:"Phenom 300E" },
  { from:"Parigi",to:"Roma",date:"Lun 27 Apr",discount:58,price:11500,aircraft:"Falcon 2000LX" },
  { from:"Ginevra",to:"Mykonos",date:"Mar 28 Apr",discount:60,price:3900,aircraft:"PC-12 NGX" },
  { from:"Dubai",to:"Milano",date:"Gio 30 Apr",discount:60,price:26000,aircraft:"Global 7500" },
]

const PIPELINE = [
  { id:"RQ-001",client:"Marco Ferretti",route:"Milano → Londra",budget:12000,date:"25 Apr",status:"NEW",priority:"🔴" },
  { id:"RQ-002",client:"Sofia Ricci",route:"Roma → Dubai",budget:55000,date:"28 Apr",status:"CONTACT",priority:"🔴" },
  { id:"RQ-003",client:"Azienda SpA",route:"Torino → Parigi",budget:8000,date:"02 Mag",status:"QUOTED",priority:"🟡",note:"Chiede 5% sconto" },
  { id:"RQ-004",client:"Luca Bianchi",route:"Milano → NYC",budget:95000,date:"05 Mag",status:"NEGOTIATION",priority:"🔴" },
  { id:"RQ-005",client:"Elena Conti",route:"Venezia → Ibiza",budget:18000,date:"10 Mag",status:"CONFIRMED",priority:"🟢" },
]

const COL_MAP = {
  NEW:{label:"Nuove",color:"#C9A84C"},
  CONTACT:{label:"Contattate",color:"#60a5fa"},
  QUOTED:{label:"Preventivo",color:"#a78bfa"},
  NEGOTIATION:{label:"Trattativa",color:"#fb923c"},
  CONFIRMED:{label:"Confermate",color:"#4ade80"},
}

const CHAT = [
  { r:"a", t:"Benvenuto su Aerojet Private. Sono Marco, il suo concierge personale.\n\nCome posso assisterla oggi? Preventivi personalizzati, empty legs o informazioni sulla flotta." },
  { r:"u", t:"Cerco un volo privato Milano–Londra per lunedì prossimo, 3 persone." },
  { r:"a", t:"Ottima scelta! Per la tratta Milano Linate → Londra Farnborough con 3 passeggeri ho diverse opzioni:\n\n**Light Jet** (Phenom 300E): €8,190 — volo 2h05m\n**Super Midsize** (Challenger 350): €15,120 — più spazio a bordo\n\nDesidera procedere con la richiesta formale?" },
  { r:"u", t:"Sì, proceda con il Phenom 300E." },
  { r:"a", t:"Perfetto. Ho registrato la sua richiesta.\n\n✅ **Pratica RQ-AUTO-001 creata automaticamente**\n\nIl broker Corrado la contatterà entro 2 ore. Riceverà un link al preventivo formale via email.\n\nC'è altro in cui posso aiutarla?" },
]

// ─── COMPONENTS ─────────────────────────────────────────────────────────────────
function Navbar({ onNav }) {
  return (
    <div style={{background:"#050810",borderBottom:"1px solid rgba(201,168,76,.15)",padding:"0 32px",display:"flex",alignItems:"center",height:56,gap:24}}>
      <div style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}} onClick={()=>onNav("home")}>
        <span style={{color:G,fontSize:15}}>✦</span>
        <span style={{fontFamily:serif,fontSize:16,fontWeight:700,letterSpacing:5}}>AEROJET</span>
        <span style={{fontFamily:sans,fontSize:8,letterSpacing:3,color:G,alignSelf:"flex-end",marginBottom:1}}>PRIVATE</span>
      </div>
      {["Flotta","Rotte","Empty Legs","Membership"].map(l=>(
        <span key={l} style={{fontFamily:sans,fontSize:11,letterSpacing:2,color:M,cursor:"pointer"}}>{l}</span>
      ))}
      <div style={{flex:1}}/>
      <button onClick={()=>onNav("dashboard")} style={{background:"transparent",border:"1px solid rgba(201,168,76,.3)",color:G,fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer",padding:"7px 16px"}}>BROKER AREA</button>
      <button onClick={()=>onNav("search")} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer",padding:"8px 18px",fontWeight:500}}>CERCA VOLO</button>
    </div>
  )
}

function DashSidebar({ active, onNav }) {
  const items = [
    {id:"dashboard",icon:"◈",label:"Overview"},
    {id:"pipeline",icon:"◧",label:"Pipeline",badge:3},
    {id:"quotes",icon:"✉",label:"Preventivi"},
    {id:"analytics",icon:"▲",label:"Analytics"},
  ]
  return (
    <div style={{width:200,background:"#050810",borderRight:"1px solid rgba(201,168,76,.1)",padding:"20px 0",flexShrink:0}}>
      <div style={{padding:"0 20px 20px",borderBottom:"1px solid rgba(201,168,76,.08)",marginBottom:12}}>
        <div style={{fontFamily:serif,fontSize:13,fontWeight:700,letterSpacing:4,color:"#F0EDE6"}}>✦ AEROJET</div>
        <div style={{fontFamily:sans,fontSize:8,letterSpacing:3,color:G,marginTop:2}}>BROKER · Corrado</div>
      </div>
      {items.map(it=>(
        <div key={it.id} onClick={()=>onNav(it.id)} style={{padding:"11px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:sans,fontSize:11,letterSpacing:1.5,color:active===it.id?G:M,background:active===it.id?"rgba(201,168,76,.06)":"transparent",borderLeft:`3px solid ${active===it.id?G:"transparent"}`,transition:"all .15s"}}>
          <span style={{fontSize:13}}>{it.icon}</span>
          {it.label}
          {it.badge&&<span style={{marginLeft:"auto",background:G,color:D,fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{it.badge}</span>}
        </div>
      ))}
    </div>
  )
}

// ─── SCREEN RENDERS ──────────────────────────────────────────────────────────────
function ScreenHome({ onNav }) {
  const [from,setFrom]=useState(""),[ to,setTo]=useState(""),[ pax,setPax]=useState("2")
  return (
    <div style={{flex:1,overflowY:"auto"}}>
      <Navbar onNav={onNav}/>
      {/* Hero */}
      <div style={{padding:"60px 40px 48px",background:"linear-gradient(180deg,#050810 0%,#0A0C14 100%)",position:"relative",minHeight:400}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(201,168,76,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.02) 1px,transparent 1px)",backgroundSize:"56px 56px",pointerEvents:"none"}}/>
        <div style={{position:"relative",textAlign:"center",maxWidth:820,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",padding:"7px 20px",marginBottom:28}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
            <span style={{fontFamily:sans,fontSize:11,letterSpacing:2,color:M}}>8,000+ aeromobili certificati · Decollo in 4 ore</span>
          </div>
          <h1 style={{fontFamily:serif,fontSize:68,fontWeight:300,lineHeight:1,marginBottom:20,letterSpacing:2}}>
            Il Cielo<br/>
            <span style={{color:G,fontStyle:"italic"}}>è il Limite</span>
          </h1>
          <p style={{fontFamily:sans,fontSize:15,color:M,lineHeight:1.8,marginBottom:40}}>Prenota voli privati con i migliori operatori mondiali.</p>
          {/* Booking widget */}
          <div style={{background:"rgba(10,12,20,.95)",border:"1px solid rgba(201,168,76,.2)",maxWidth:860,margin:"0 auto"}}>
            <div style={{display:"flex",borderBottom:"1px solid rgba(201,168,76,.1)"}}>
              {["SOLO ANDATA","ANDATA/RITORNO","MULTI-TAPPA"].map((t,i)=>(
                <div key={t} style={{flex:1,padding:"12px",fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer",color:i===0?G:M,borderBottom:i===0?`2px solid ${G}`:"2px solid transparent",textAlign:"center",background:i===0?"rgba(201,168,76,.05)":"transparent"}}>{t}</div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"flex-end",padding:"20px 16px",gap:8,flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:110,padding:"0 10px"}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2.5,color:G,marginBottom:6}}>PARTENZA</div>
                <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="Città o aeroporto" style={{background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.25)",color:"#F0EDE6",fontFamily:serif,fontSize:15,padding:"6px 0",outline:"none",width:"100%"}}/>
              </div>
              <div style={{color:G,fontSize:18,paddingBottom:6}}>→</div>
              <div style={{flex:2,minWidth:110,padding:"0 10px"}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2.5,color:G,marginBottom:6}}>DESTINAZIONE</div>
                <input value={to} onChange={e=>setTo(e.target.value)} placeholder="Città o aeroporto" style={{background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.25)",color:"#F0EDE6",fontFamily:serif,fontSize:15,padding:"6px 0",outline:"none",width:"100%"}}/>
              </div>
              <div style={{flex:1.2,minWidth:90,padding:"0 10px"}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2.5,color:G,marginBottom:6}}>DATA</div>
                <input type="date" style={{background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.25)",color:"#F0EDE6",fontFamily:sans,fontSize:13,padding:"6px 0",outline:"none",width:"100%",colorScheme:"dark"}}/>
              </div>
              <div style={{flex:1,minWidth:80,padding:"0 10px"}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2.5,color:G,marginBottom:6}}>PAX</div>
                <select value={pax} onChange={e=>setPax(e.target.value)} style={{background:"#0a0c14",border:"none",borderBottom:"1px solid rgba(201,168,76,.25)",color:"#F0EDE6",fontFamily:sans,fontSize:13,padding:"6px 0",outline:"none",width:"100%"}}>
                  {[1,2,3,4,6,8,10,12,16,19].map(n=><option key={n}>{n} pax</option>)}
                </select>
              </div>
              <button onClick={()=>onNav("results")} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"13px 22px",fontWeight:500,flexShrink:0}}>CERCA ✦</button>
            </div>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#0F1220",borderTop:"1px solid rgba(201,168,76,.1)",borderBottom:"1px solid rgba(201,168,76,.1)"}}>
        {[["8,000+","AEROMOBILI"],["180+","PAESI"],["4h","DECOLLO MINIMO"],["24/7","CONCIERGE"]].map(([v,l])=>(
          <div key={l} style={{padding:"24px",textAlign:"center",borderRight:"1px solid rgba(201,168,76,.06)"}}>
            <div style={{fontFamily:serif,fontSize:34,color:G,fontWeight:300}}>{v}</div>
            <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:M,marginTop:6}}>{l}</div>
          </div>
        ))}
      </div>
      {/* Empty Legs */}
      <div style={{padding:"40px"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:6,textAlign:"center"}}>OFFERTE</div>
        <h2 style={{fontFamily:serif,fontSize:34,fontWeight:300,textAlign:"center",marginBottom:32}}>Empty Legs <span style={{color:G,fontStyle:"italic"}}>Disponibili</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:1,background:"rgba(201,168,76,.1)"}}>
          {LEGS.map((l,i)=>(
            <div key={i} onClick={()=>onNav("booking")} style={{background:C,padding:"20px 24px",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.background="#141728"} onMouseLeave={e=>e.currentTarget.style.background=C}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2,background:"rgba(201,168,76,.1)",color:G,padding:"3px 10px"}}>EMPTY LEG · -{l.discount}%</div>
                <div style={{fontFamily:sans,fontSize:11,color:M}}>{l.date}</div>
              </div>
              <div style={{fontFamily:serif,fontSize:22,marginBottom:4}}>{l.from} <span style={{color:G}}>→</span> {l.to}</div>
              <div style={{fontFamily:sans,fontSize:11,color:M,marginBottom:16}}>{l.aircraft}</div>
              <div style={{fontFamily:serif,fontSize:26,color:G}}>{fmt(l.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenSearch({ onNav }) {
  const [step,setStep]=useState(0)
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <Navbar onNav={onNav}/>
      <div style={{padding:"28px 40px"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:20}}>NUOVA RICERCA</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 120px",gap:20,marginBottom:28}}>
          {[["PARTENZA","Milano Linate (LIML)"],["DESTINAZIONE","Londra Farnborough (EGLL)"],["DATA","Lunedì 28 Aprile 2026"],["PAX","2 passeggeri"]].map(([l,v])=>(
            <div key={l} style={{background:C,border:"1px solid rgba(201,168,76,.15)",padding:"14px 18px"}}>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:6}}>{l}</div>
              <div style={{fontFamily:serif,fontSize:16}}>{v}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>onNav("results")} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"14px 32px",fontWeight:500}}>CERCA DISPONIBILITÀ ✦</button>
      </div>
    </div>
  )
}

function ScreenResults({ onNav }) {
  const [sel,setSel]=useState(null)
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <Navbar onNav={onNav}/>
      <div style={{background:"#0F1220",borderBottom:"1px solid rgba(201,168,76,.1)",padding:"14px 40px",display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontFamily:serif,fontSize:18}}>Milano</span>
        <span style={{color:G,fontSize:18}}>→</span>
        <span style={{fontFamily:serif,fontSize:18}}>Londra</span>
        <span style={{fontFamily:sans,fontSize:12,color:M}}>· Lun 28 Apr · 2 pax</span>
        <div style={{flex:1}}/>
        <span style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",display:"inline-block"}}/>
        <span style={{fontFamily:sans,fontSize:10,letterSpacing:1,color:M}}>5 AEROMOBILI DISPONIBILI</span>
      </div>
      <div style={{padding:"24px 40px",display:"flex",flexDirection:"column",gap:1,background:"rgba(201,168,76,.08)"}}>
        {JETS.map((j,i)=>(
          <div key={i} onClick={()=>{setSel(i===sel?null:i); if(i!==sel){}}} style={{background:sel===i?"#141728":C,padding:"16px 24px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",borderLeft:`3px solid ${sel===i?G:"transparent"}`,transition:"all .15s"}}>
            <div style={{width:46,height:46,background:["#1A1A2E","#C41E3A","#2C3E50","#1A3A2E","#2A1A3E"][i],display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{j.logo}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:serif,fontSize:18,fontWeight:500,marginBottom:3}}>{j.model}</div>
              <div style={{fontFamily:sans,fontSize:10,letterSpacing:1.5,color:G}}>{j.cat}</div>
              <div style={{fontFamily:sans,fontSize:11,color:M}}>{j.op} · {j.pax} pax max · Anno 2022</div>
            </div>
            <div style={{textAlign:"center",minWidth:65}}>
              <div style={{fontFamily:sans,fontSize:14}}>{j.time}</div>
              <div style={{fontFamily:sans,fontSize:10,color:M}}>durata</div>
            </div>
            <div style={{textAlign:"center",minWidth:55}}>
              <div style={{color:G,fontSize:13}}>★ {j.rating}</div>
            </div>
            <div style={{textAlign:"right",minWidth:130}}>
              <div style={{fontFamily:serif,fontSize:26,color:G,fontWeight:300}}>{fmt(j.price)}</div>
              <div style={{fontFamily:sans,fontSize:10,color:M}}>volo completo</div>
              <div style={{fontFamily:sans,fontSize:10,color:"#4ade80"}}>comm. {fmt(Math.round(j.price*.12))}</div>
            </div>
            <button onClick={e=>{e.stopPropagation();onNav("booking")}} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer",padding:"10px 18px",fontWeight:500,flexShrink:0}}>PRENOTA</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScreenBooking({ onNav }) {
  const [step,setStep]=useState(0)
  const steps=["Dettagli","Extra","Dati","Pagamento"]
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <Navbar onNav={onNav}/>
      {/* Progress */}
      <div style={{background:"#0F1220",borderBottom:"1px solid rgba(201,168,76,.1)",padding:"16px 40px"}}>
        <div style={{display:"flex",justifyContent:"center",gap:0,maxWidth:700,margin:"0 auto",position:"relative"}}>
          <div style={{position:"absolute",top:13,left:"8%",right:"8%",height:1,background:"rgba(201,168,76,.15)"}}/>
          <div style={{position:"absolute",top:13,left:"8%",width:(step/3*84)+"%",height:1,background:G,transition:"width .5s"}}/>
          {steps.map((s,i)=>(
            <div key={s} onClick={()=>setStep(i)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",position:"relative",zIndex:1}}>
              <div style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${i<=step?G:"rgba(201,168,76,.2)"}`,background:i<step?G:i===step?"rgba(201,168,76,.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,fontSize:10,color:i<step?D:i===step?G:"rgba(240,237,230,.3)",transition:"all .3s"}}>
                {i<step?"✓":i+1}
              </div>
              <span style={{fontFamily:sans,fontSize:9,letterSpacing:1,color:i<=step?G:"rgba(240,237,230,.25)"}}>{s.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:24,padding:"28px 40px",flex:1}}>
        {/* Main */}
        <div style={{flex:1}}>
          {step===0&&(
            <div>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>VOLO SELEZIONATO</div>
              <div style={{background:C,border:"1px solid rgba(201,168,76,.15)",padding:24,marginBottom:20}}>
                <div style={{display:"flex",gap:14,paddingBottom:16,marginBottom:16,borderBottom:"1px solid rgba(201,168,76,.1)"}}>
                  <div style={{width:46,height:46,background:"#C41E3A",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,fontSize:11,fontWeight:700,color:"#fff"}}>VJ</div>
                  <div><div style={{fontFamily:serif,fontSize:20,fontWeight:500}}>Phenom 300E</div><div style={{fontFamily:sans,fontSize:10,letterSpacing:2,color:G}}>LIGHT JET · VISTAJET</div></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  {[["PARTENZA","Milano Linate"],["ARRIVO","Londra Farnborough"],["DATA","Lun 28 Apr 2026"],["PAX","2 passeggeri"],["DURATA","2h 05m"],["AUTONOMIA","3,500 km"]].map(([l,v])=>(
                    <div key={l}><div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:3}}>{l}</div><div style={{fontFamily:serif,fontSize:16}}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:8}}>NOTE SPECIALI</div>
                <textarea placeholder="Allergie, animali, orario preferito..." rows={3} style={{width:"100%",background:C,border:"1px solid rgba(201,168,76,.15)",color:"#F0EDE6",fontFamily:sans,fontSize:13,padding:"10px 14px",outline:"none",resize:"none"}}/>
              </div>
            </div>
          )}
          {step===1&&(
            <div>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>SERVIZI EXTRA</div>
              {[["🍾","Catering Gourmet","Menu chef stellato","€350"],["🚗","Transfer Limousine","Mercedes S-Class","€180"],["📡","WiFi Starlink","100 Mbps garantiti","Incluso"],["✦","Concierge Arrivo","Assistente dedicato","€280"]].map(([ic,t,d,p],i)=>(
                <div key={t} style={{background:C,border:"1px solid rgba(201,168,76,.1)",padding:"16px 20px",marginBottom:1,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.1)"}>
                  <span style={{fontSize:20}}>{ic}</span>
                  <div style={{flex:1}}><div style={{fontFamily:serif,fontSize:16,marginBottom:2}}>{t}</div><div style={{fontFamily:sans,fontSize:11,color:M}}>{d}</div></div>
                  <div style={{color:G,fontFamily:serif,fontSize:16}}>{p}</div>
                </div>
              ))}
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>DATI PERSONALI</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                {[["NOME *","Mario Rossi"],["EMAIL *","mario@email.it"],["TELEFONO *","+39 347..."],["AZIENDA","Rossi SpA"]].map(([l,ph])=>(
                  <div key={l}><div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:6}}>{l}</div><input placeholder={ph} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.25)",color:"#F0EDE6",fontFamily:sans,fontSize:14,padding:"7px 0",outline:"none"}}/></div>
                ))}
              </div>
              <div style={{marginTop:16,padding:"12px 16px",background:"rgba(201,168,76,.04)",border:"1px solid rgba(201,168,76,.08)",fontFamily:sans,fontSize:11,color:M}}>🔒 Pagamenti via Stripe PCI DSS · Dati cifrati · Mai condivisi</div>
            </div>
          )}
          {step===3&&(
            <div>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>RIEPILOGO FINALE</div>
              <div style={{background:C,border:"1px solid rgba(201,168,76,.15)",padding:0,marginBottom:16}}>
                {[["Charter Phenom 300E","€8,190"],["Catering Gourmet","€350"],["WiFi Starlink","Incluso"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"14px 20px",borderBottom:"1px solid rgba(201,168,76,.06)",fontFamily:sans,fontSize:13}}><span style={{color:M}}>{l}</span><span>{v}</span></div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"16px 20px",background:"rgba(201,168,76,.04)"}}>
                  <span style={{fontFamily:serif,fontSize:18}}>Totale</span><span style={{fontFamily:serif,fontSize:24,color:G}}>€8,540</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"14px 20px",borderTop:"1px solid rgba(201,168,76,.15)"}}>
                  <span style={{fontFamily:sans,fontSize:12,color:G}}>Deposito ora (30%)</span><span style={{fontFamily:serif,fontSize:20,color:G}}>€2,562</span>
                </div>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:20}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"transparent",border:"1px solid rgba(201,168,76,.3)",color:G,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px 22px"}}>← INDIETRO</button>}
            <button onClick={()=>step<3?setStep(s=>s+1):onNav("success")} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"13px 28px",fontWeight:500,flex:1}}>
              {step<3?"CONTINUA →":"✓ PAGA DEPOSITO €2,562 →"}
            </button>
          </div>
        </div>
        {/* Sidebar */}
        <div style={{width:240,flexShrink:0}}>
          <div style={{background:C,border:"1px solid rgba(201,168,76,.15)",padding:20,position:"sticky",top:0}}>
            <div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:14}}>IL TUO VOLO</div>
            <div style={{fontFamily:serif,fontSize:18,fontWeight:500}}>Milano</div>
            <div style={{color:G,margin:"4px 0"}}>→</div>
            <div style={{fontFamily:serif,fontSize:18,fontWeight:500,marginBottom:16}}>Londra</div>
            {[["Jet","Phenom 300E"],["Data","28 Apr"],["Pax","2"],["Durata","2h 05m"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(201,168,76,.06)",fontFamily:sans,fontSize:11}}><span style={{color:M}}>{l}</span><span>{v}</span></div>
            ))}
            <div style={{padding:"12px 0",borderTop:"1px solid rgba(201,168,76,.1)",marginTop:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontFamily:sans,fontSize:12}}><span style={{color:M}}>Deposito</span><span style={{color:G,fontFamily:serif,fontSize:18}}>€2,562</span></div>
            </div>
            <div style={{background:"rgba(74,222,128,.05)",border:"1px solid rgba(74,222,128,.15)",padding:"10px",textAlign:"center",marginTop:12}}>
              <div style={{fontFamily:sans,fontSize:10,color:M,marginBottom:2}}>Commissione broker</div>
              <div style={{color:"#4ade80",fontFamily:serif,fontSize:18}}>€984</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenSuccess({ onNav }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
      <div style={{fontSize:64,color:G,marginBottom:24,animation:"pulse 2s infinite"}}>✦</div>
      <div style={{fontFamily:sans,fontSize:9,letterSpacing:4,color:G,marginBottom:12}}>PRENOTAZIONE CONFERMATA</div>
      <h1 style={{fontFamily:serif,fontSize:40,fontWeight:300,marginBottom:12}}>Volo Confermato</h1>
      <p style={{fontFamily:sans,fontSize:14,color:M,lineHeight:1.8,maxWidth:400,marginBottom:8}}>Phenom 300E · Milano → Londra · 28 Aprile 2026</p>
      <p style={{fontFamily:sans,fontSize:12,color:"rgba(240,237,230,.3)",marginBottom:36}}>Codice: <span style={{color:G,letterSpacing:3}}>AJ-PHN-2604</span></p>
      <div style={{display:"flex",gap:12}}>
        <button onClick={()=>onNav("home")} style={{background:"transparent",border:"1px solid rgba(201,168,76,.3)",color:G,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px 24px"}}>TORNA AL SITO</button>
        <button onClick={()=>onNav("dashboard")} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px 24px",fontWeight:500}}>DASHBOARD BROKER</button>
      </div>
    </div>
  )
}

function ScreenDashboard({ onNav }) {
  const bars=[1800,5200,3400,9100,7800,14200]
  const maxB=Math.max(...bars)
  return (
    <div style={{flex:1,display:"flex"}}>
      <DashSidebar active="dashboard" onNav={onNav}/>
      <div style={{flex:1,overflowY:"auto",padding:"32px 40px"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:4,color:G,marginBottom:6}}>APRILE 2026</div>
        <h1 style={{fontFamily:serif,fontSize:30,fontWeight:300,marginBottom:4}}>Buongiorno, Corrado ✦</h1>
        <p style={{fontFamily:sans,fontSize:13,color:M,marginBottom:28}}>3 nuove richieste in attesa · Pipeline: €188,000</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"rgba(201,168,76,.1)",marginBottom:28}}>
          {[["31","RICHIESTE","+12%"],["18","PREVENTIVI","+8%"],["38%","CONVERSIONE","+4pp"],["€47k","COMMISSIONI","+23%"]].map(([v,l,d])=>(
            <div key={l} style={{background:D,padding:"20px"}}>
              <div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:M,marginBottom:10}}>{l}</div>
              <div style={{fontFamily:serif,fontSize:28,color:G,fontWeight:300,marginBottom:4}}>{v}</div>
              <div style={{fontFamily:sans,fontSize:10,color:"#4ade80"}}>{d} vs mese scorso</div>
            </div>
          ))}
        </div>
        <div style={{background:C,border:"1px solid rgba(201,168,76,.12)",padding:24,marginBottom:20}}>
          <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>COMMISSIONI APRILE (€)</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:90}}>
            {bars.map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{background:i===5?"#4ade80":G,width:"100%",borderRadius:"2px 2px 0 0",height:(v/maxB*80)+"px",opacity:i===5?1:0.7+i*.05}}/>
                <span style={{fontFamily:sans,fontSize:9,color:M}}>{"1 5 10 15 18 Oggi".split(" ")[i]} Apr</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:C,border:"1px solid rgba(201,168,76,.12)"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(201,168,76,.1)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G}}>ULTIME RICHIESTE</div>
            <span onClick={()=>onNav("pipeline")} style={{fontFamily:sans,fontSize:10,letterSpacing:1,color:M,cursor:"pointer"}}>PIPELINE COMPLETO →</span>
          </div>
          {PIPELINE.slice(0,3).map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",borderBottom:"1px solid rgba(201,168,76,.05)"}}>
              <span style={{fontFamily:sans,fontSize:10,color:G,width:60,flexShrink:0}}>{r.id}</span>
              <span style={{flex:1,fontFamily:serif,fontSize:15}}>{r.client}</span>
              <span style={{fontFamily:sans,fontSize:11,color:M,flex:1}}>{r.route}</span>
              <span style={{fontFamily:serif,fontSize:15,color:G}}>{fmt(r.budget)}</span>
              <span style={{fontFamily:sans,fontSize:9,letterSpacing:1,background:COL_MAP[r.status].color+"20",color:COL_MAP[r.status].color,padding:"3px 10px"}}>{COL_MAP[r.status].label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenPipeline({ onNav }) {
  const [cards,setCards]=useState(PIPELINE)
  const [dragging,setDragging]=useState(null)
  const cols=["NEW","CONTACT","QUOTED","NEGOTIATION","CONFIRMED"]
  return (
    <div style={{flex:1,display:"flex"}}>
      <DashSidebar active="pipeline" onNav={onNav}/>
      <div style={{flex:1,overflowY:"auto",padding:"28px 24px"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:4,color:G,marginBottom:6}}>PIPELINE</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
          <h1 style={{fontFamily:serif,fontSize:28,fontWeight:300}}>Kanban Richieste</h1>
          <div style={{display:"flex",gap:1,background:"rgba(201,168,76,.1)"}}>
            {[["€188k","PIPELINE"],["€18k","CHIUSE"],["€24.7k","COMM. EST."]].map(([v,l])=>(
              <div key={l} style={{background:D,padding:"12px 16px",textAlign:"center"}}><div style={{fontFamily:serif,fontSize:18,color:G}}>{v}</div><div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:M,marginTop:3}}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
          {cols.map(col=>{
            const colCards=cards.filter(c=>c.status===col)
            const colMeta=COL_MAP[col]
            return(
              <div key={col}
                onDragOver={e=>{e.preventDefault()}}
                onDrop={e=>{e.preventDefault();if(dragging){setCards(prev=>prev.map(c=>c.id===dragging?{...c,status:col}:c));setDragging(null)}}}
                style={{minWidth:190,flex:1,background:D,border:`1px solid rgba(201,168,76,.1)`,borderTop:`2px solid ${colMeta.color}`}}>
                <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:colMeta.color}}>{colMeta.label.toUpperCase()}</span>
                  <span style={{width:20,height:20,borderRadius:"50%",background:colMeta.color+"20",color:colMeta.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:sans,fontSize:10,fontWeight:700}}>{colCards.length}</span>
                </div>
                <div style={{padding:"8px",display:"flex",flexDirection:"column",gap:8,minHeight:340}}>
                  {colCards.map(card=>(
                    <div key={card.id} draggable onDragStart={()=>setDragging(card.id)} onDragEnd={()=>setDragging(null)}
                      style={{background:"#0F1220",border:"1px solid rgba(201,168,76,.1)",padding:"12px",cursor:"grab",opacity:dragging===card.id?.5:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontFamily:sans,fontSize:9,color:G,letterSpacing:1}}>{card.id}</span>
                        <span>{card.priority}</span>
                      </div>
                      <div style={{fontFamily:serif,fontSize:15,fontWeight:500,marginBottom:3}}>{card.client}</div>
                      <div style={{fontFamily:sans,fontSize:10,color:M,marginBottom:8}}>{card.route}</div>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{color:G,fontFamily:serif,fontSize:14}}>{fmt(card.budget)}</span>
                        <span style={{fontFamily:sans,fontSize:10,color:M}}>{card.date}</span>
                      </div>
                      {card.note&&<div style={{marginTop:6,fontFamily:sans,fontSize:10,color:"#fb923c",background:"rgba(251,146,60,.07)",padding:"3px 7px",borderLeft:"2px solid #fb923c"}}>{card.note}</div>}
                    </div>
                  ))}
                  {colCards.length===0&&<div style={{border:"1px dashed rgba(201,168,76,.12)",padding:16,textAlign:"center"}}><span style={{fontFamily:sans,fontSize:9,color:"rgba(240,237,230,.15)",letterSpacing:1}}>TRASCINA QUI</span></div>}
                </div>
              </div>
            )
          })}
        </div>
        <p style={{fontFamily:sans,fontSize:11,color:"rgba(240,237,230,.2)",marginTop:12,textAlign:"center"}}>✦ Trascina le card tra le colonne per aggiornare lo stato</p>
      </div>
    </div>
  )
}

function ScreenQuotes({ onNav }) {
  const [show,setShow]=useState(false)
  return (
    <div style={{flex:1,display:"flex"}}>
      <DashSidebar active="quotes" onNav={onNav}/>
      <div style={{flex:1,overflowY:"auto",padding:"28px 32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24}}>
          <div>
            <div style={{fontFamily:sans,fontSize:9,letterSpacing:4,color:G,marginBottom:6}}>PREVENTIVI</div>
            <h1 style={{fontFamily:serif,fontSize:28,fontWeight:300}}>Builder Preventivi</h1>
          </div>
          <button onClick={()=>setShow(!show)} style={{background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px 22px",fontWeight:500}}>+ NUOVO PREVENTIVO</button>
        </div>
        {show&&(
          <div style={{background:C,border:"1px solid rgba(201,168,76,.2)",padding:28,marginBottom:24}}>
            <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:20}}>CREA PREVENTIVO</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              {[["CLIENTE","Marco Ferretti"],["EMAIL","marco@empresa.it"],["DA","Milano"],["A","Londra"],["DATA","28 Aprile 2026"],["PAX","2"]].map(([l,ph])=>(
                <div key={l}><div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:G,marginBottom:5}}>{l}</div><input placeholder={ph} style={{width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(201,168,76,.2)",color:"#F0EDE6",fontFamily:sans,fontSize:13,padding:"6px 0",outline:"none"}}/></div>
              ))}
            </div>
            <div style={{background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.1)",padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontFamily:sans,fontSize:12,color:M}}>Phenom 300E · Light Jet</span><span style={{fontFamily:serif,fontSize:20,color:G}}>€8,190</span></div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <span style={{fontFamily:sans,fontSize:10,color:"#4ade80"}}>Commissione: €983</span>
                <span style={{fontFamily:sans,fontSize:10,color:M}}>Deposito 30%: €2,457</span>
                <span style={{fontFamily:sans,fontSize:10,color:M}}>Validità: 5 giorni</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={{flex:1,background:G,border:"none",color:D,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px",fontWeight:500}}>GENERA PDF</button>
              <button style={{flex:1,background:"transparent",border:"1px solid rgba(201,168,76,.3)",color:G,fontFamily:sans,fontSize:11,letterSpacing:2,cursor:"pointer",padding:"12px"}}>INVIA EMAIL</button>
            </div>
          </div>
        )}
        <div style={{background:C,border:"1px solid rgba(201,168,76,.12)"}}>
          <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(201,168,76,.1)"}}><div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G}}>PREVENTIVI RECENTI</div></div>
          {[["QT-001","Marco Ferretti","Milano→Londra","€8,190","Inviato","#60a5fa"],["QT-002","Sofia Ricci","Roma→Dubai","€48,500","Accettato","#4ade80"],["QT-003","Luca Bianchi","Milano→NYC","€96,000","In attesa","#C9A84C"]].map(([id,cl,rt,pr,st,c])=>(
            <div key={id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",borderBottom:"1px solid rgba(201,168,76,.05)"}}>
              <span style={{fontFamily:sans,fontSize:10,color:G,width:60}}>{id}</span>
              <span style={{flex:1,fontFamily:serif,fontSize:15}}>{cl}</span>
              <span style={{fontFamily:sans,fontSize:11,color:M,flex:1}}>{rt}</span>
              <span style={{fontFamily:serif,fontSize:16,color:G}}>{pr}</span>
              <span style={{fontFamily:sans,fontSize:9,letterSpacing:1,background:c+"20",color:c,padding:"3px 10px"}}>{st.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenAnalytics({ onNav }) {
  return (
    <div style={{flex:1,display:"flex"}}>
      <DashSidebar active="analytics" onNav={onNav}/>
      <div style={{flex:1,overflowY:"auto",padding:"28px 40px"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:4,color:G,marginBottom:6}}>ANALYTICS</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <h1 style={{fontFamily:serif,fontSize:28,fontWeight:300}}>Performance 2026</h1>
          <div style={{display:"flex",gap:8}}>
            {["MESE","TRIMESTRE","ANNO"].map((t,i)=>(
              <button key={t} style={{padding:"7px 14px",background:i===1?G:"transparent",color:i===1?D:M,border:`1px solid ${i===1?G:"rgba(201,168,76,.2)"}`,fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer"}}>{t}</button>
            ))}
            <button style={{padding:"7px 14px",background:"transparent",border:"1px solid rgba(74,222,128,.3)",color:"#4ade80",fontFamily:sans,fontSize:10,letterSpacing:2,cursor:"pointer"}}>↓ CSV</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"rgba(201,168,76,.1)",marginBottom:24}}>
          {[["€353,000","REVENUE YTD","+34%"],["€42,360","COMMISSIONI YTD","+34%"],["€11,387","DEAL MEDIO","+8%"]].map(([v,l,d])=>(
            <div key={l} style={{background:D,padding:"20px"}}><div style={{fontFamily:sans,fontSize:9,letterSpacing:2,color:M,marginBottom:10}}>{l}</div><div style={{fontFamily:serif,fontSize:26,color:G,fontWeight:300,marginBottom:4}}>{v}</div><div style={{fontFamily:sans,fontSize:10,color:"#4ade80"}}>{d}</div></div>
          ))}
        </div>
        <div style={{background:C,border:"1px solid rgba(201,168,76,.12)",padding:24,marginBottom:20}}>
          <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16}}>REVENUE MENSILE</div>
          <svg viewBox="0 0 600 130" style={{width:"100%",height:130}}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C9A84C" stopOpacity=".2"/><stop offset="95%" stopColor="#C9A84C" stopOpacity="0"/></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity=".15"/><stop offset="95%" stopColor="#4ade80" stopOpacity="0"/></linearGradient>
            </defs>
            {[0,30,60,90,120].map(y=><line key={y} x1="0" y1={y} x2="600" y2={y} stroke="rgba(201,168,76,.05)" strokeWidth="1"/>)}
            <path d="M50,105 L183,78 L317,90 L450,38 L560,55 L560,120 L50,120Z" fill="url(#g1)"/>
            <path d="M50,105 L183,78 L317,90 L450,38 L560,55" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M50,116 L183,108 L317,112 L450,90 L560,97 L560,120 L50,120Z" fill="url(#g2)"/>
            <path d="M50,116 L183,108 L317,112 L450,90 L560,97" fill="none" stroke="#4ade80" strokeWidth="1.5"/>
            <circle cx="450" cy="38" r="3.5" fill="#C9A84C"/>
            {["Gen","Feb","Mar","Apr","Mag"].map((m,i)=><text key={m} x={50+i*127.5} y={128} fill="rgba(240,237,230,.3)" fontSize="9" fontFamily="Helvetica,sans-serif" textAnchor="middle">{m}</text>)}
          </svg>
        </div>
        <div style={{background:C,border:"1px solid rgba(201,168,76,.12)"}}>
          <div style={{padding:"12px 20px",borderBottom:"1px solid rgba(201,168,76,.1)"}}><div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G}}>TOP ROTTE</div></div>
          {[["Milano → NYC",2,"€192,000","€23,040"],["Roma → Dubai",4,"€194,000","€23,280"],["Venezia → Ibiza",6,"€109,200","€13,104"]].map(([r,v,rev,c])=>(
            <div key={r} style={{display:"flex",alignItems:"center",gap:16,padding:"12px 20px",borderBottom:"1px solid rgba(201,168,76,.05)"}}>
              <span style={{fontFamily:serif,fontSize:15,flex:1}}>{r}</span>
              <span style={{fontFamily:sans,fontSize:12,color:"#60a5fa",width:50,textAlign:"center"}}>{v} voli</span>
              <span style={{fontFamily:serif,fontSize:15,color:G,minWidth:100,textAlign:"right"}}>{rev}</span>
              <span style={{fontFamily:sans,fontSize:12,color:"#4ade80",minWidth:80,textAlign:"right"}}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenMarco({ onNav }) {
  const [msgs,setMsgs]=useState(CHAT.slice(0,1))
  const [input,setInput]=useState("")
  const [typing,setTyping]=useState(false)
  const [chatIdx,setChatIdx]=useState(0)
  const ref=useRef(null)
  
  const send=()=>{
    const nextUserMsg=CHAT.filter(c=>c.r==="u")[chatIdx]
    const txt=input||nextUserMsg?.t||"Come funziona la prenotazione?"
    setInput("")
    setMsgs(m=>[...m,{r:"u",t:txt}])
    setTyping(true)
    setTimeout(()=>{
      const nextAiMsg=CHAT.filter(c=>c.r==="a")[chatIdx+1]||{r:"a",t:"Perfetto! Posso aiutarla con qualsiasi altra richiesta."}
      setMsgs(m=>[...m,{r:"a",t:nextAiMsg.t}])
      setTyping(false)
      setChatIdx(i=>i+1)
    },1200)
    setTimeout(()=>ref.current?.scrollTo(0,9999),50)
  }

  return (
    <div style={{flex:1,display:"flex",height:"100%"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{background:"#0F1220",borderBottom:"1px solid rgba(201,168,76,.12)",padding:"14px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#C9A84C,#E8C97A)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontSize:16,fontWeight:700,color:D}}>M</div>
          <div>
            <div style={{fontFamily:serif,fontSize:16,fontWeight:500}}>Marco</div>
            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,background:"#4ade80",borderRadius:"50%",display:"inline-block"}}/><span style={{fontFamily:sans,fontSize:11,color:M}}>Concierge Privato · Online</span></div>
          </div>
          <div style={{marginLeft:"auto",fontFamily:sans,fontSize:10,letterSpacing:1,color:M,border:"1px solid rgba(201,168,76,.15)",padding:"4px 10px"}}>claude-sonnet-4-20250514</div>
        </div>
        {/* Messages */}
        <div ref={ref} style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:8,alignItems:"flex-start"}}>
              {m.r==="a"&&<div style={{width:26,height:26,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontSize:10,fontWeight:700,color:D,flexShrink:0}}>M</div>}
              <div style={{background:m.r==="a"?"#0F1220":"rgba(201,168,76,.12)",borderRadius:m.r==="a"?"14px 14px 14px 3px":"14px 14px 3px 14px",padding:"10px 14px",maxWidth:"76%",fontFamily:sans,fontSize:13,lineHeight:1.7,color:m.r==="a"?"rgba(240,237,230,.85)":"#F0EDE6"}} dangerouslySetInnerHTML={{__html:m.t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>")}}/>
            </div>
          ))}
          {typing&&(
            <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:G,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontSize:10,fontWeight:700,color:D}}>M</div>
              <div style={{background:"#0F1220",borderRadius:"14px 14px 14px 3px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
                {[0,.2,.4].map(d=><span key={d} style={{width:6,height:6,borderRadius:"50%",background:G,display:"inline-block",animation:`blink 1s ${d}s infinite`}}/>)}
              </div>
            </div>
          )}
        </div>
        {/* Quick replies */}
        <div style={{padding:"8px 14px",borderTop:"1px solid rgba(201,168,76,.08)",display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
          {["Preventivo Milano-Londra","Empty legs oggi","Come funziona?"].map(q=>(
            <button key={q} onClick={()=>{setInput(q);}} style={{background:"transparent",border:"1px solid rgba(201,168,76,.2)",color:M,fontFamily:sans,fontSize:10,letterSpacing:1,cursor:"pointer",padding:"5px 12px",flexShrink:0}}>{q}</button>
          ))}
        </div>
        {/* Input */}
        <div style={{padding:"12px 16px",borderTop:"1px solid rgba(201,168,76,.15)",display:"flex",gap:10,flexShrink:0}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Scriva qui la sua richiesta..." style={{flex:1,background:"#0F1220",border:"1px solid rgba(201,168,76,.15)",color:"#F0EDE6",padding:"10px 14px",fontFamily:sans,fontSize:13,outline:"none"}}/>
          <button onClick={send} style={{background:G,border:"none",color:D,padding:"10px 18px",cursor:"pointer",fontSize:16}}>→</button>
        </div>
      </div>
      {/* Info panel */}
      <div style={{width:240,background:"#050810",borderLeft:"1px solid rgba(201,168,76,.1)",padding:"24px 20px",flexShrink:0}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:14}}>CAPACITÀ</div>
        {["Preventivi personalizzati con prezzi indicativi reali","Crea pratiche automaticamente quando il cliente conferma","Conosce ogni modello di jet, autonomia e comfort","Streaming in tempo reale — risponde mentre scrive"].map(c=>(
          <div key={c} style={{display:"flex",gap:8,marginBottom:12,alignItems:"flex-start"}}>
            <span style={{color:G,flexShrink:0,fontSize:12}}>✦</span>
            <span style={{fontFamily:sans,fontSize:11,color:M,lineHeight:1.7}}>{c}</span>
          </div>
        ))}
        <div style={{marginTop:24,padding:"14px",background:C,border:"1px solid rgba(201,168,76,.1)",textAlign:"center"}}>
          <div style={{fontFamily:sans,fontSize:10,color:M,marginBottom:4}}>WhatsApp Broker</div>
          <div style={{fontFamily:serif,fontSize:15,color:G}}>+39 331 882 4030</div>
        </div>
      </div>
    </div>
  )
}

function ScreenWhatsApp({ onNav }) {
  const msgs=[
    {label:"Preventivo volo",text:"Salve, vorrei un preventivo per un volo privato."},
    {label:"Empty leg",text:"Salve, mi interessano gli empty leg disponibili."},
    {label:"Membership",text:"Salve, vorrei informazioni sulla membership Aerojet Private."},
    {label:"Parla con Corrado",text:"Salve, desidero parlare con il broker Corrado."},
  ]
  const open=(msg)=>window.open(`https://wa.me/393318824030?text=${encodeURIComponent(msg)}`,"_blank")
  return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div style={{maxWidth:340,width:"100%"}}>
        <div style={{fontFamily:sans,fontSize:9,letterSpacing:3,color:G,marginBottom:16,textAlign:"center"}}>WHATSAPP CONCIERGE</div>
        <div style={{background:"#0F1220",border:"1px solid rgba(37,211,102,.3)",overflow:"hidden"}}>
          <div style={{background:"#25D366",padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:serif,fontSize:20,color:"#fff"}}>✦</div>
            <div><div style={{fontFamily:sans,fontSize:15,fontWeight:600,color:"#fff"}}>Concierge Aerojet</div><div style={{fontFamily:sans,fontSize:11,color:"rgba(255,255,255,.8)"}}>● Online · risposta in 5 min</div></div>
          </div>
          <div style={{padding:"20px 16px"}}>
            <div style={{background:"rgba(37,211,102,.08)",border:"1px solid rgba(37,211,102,.15)",padding:"12px 14px",borderRadius:"4px 12px 12px 4px",marginBottom:16}}>
              <p style={{fontFamily:sans,fontSize:13,color:"rgba(240,237,230,.8)",lineHeight:1.6,margin:0}}>Benvenuto su Aerojet Private.<br/>Come posso aiutarla oggi?</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {msgs.map(m=>(
                <button key={m.label} onClick={()=>open(m.text)} style={{background:"transparent",border:"1px solid rgba(37,211,102,.35)",color:"#25D366",padding:"9px 14px",fontFamily:sans,fontSize:12,cursor:"pointer",textAlign:"left",transition:"background .2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(37,211,102,.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {m.label} →
                </button>
              ))}
            </div>
            <button onClick={()=>open("Salve, vorrei informazioni sui voli privati Aerojet.")} style={{width:"100%",background:"#25D366",border:"none",color:"#fff",padding:"12px",fontFamily:sans,fontSize:12,letterSpacing:2,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              APRI WHATSAPP
            </button>
          </div>
        </div>
        <p style={{fontFamily:sans,fontSize:11,color:"rgba(240,237,230,.2)",textAlign:"center",marginTop:12}}>Numero: +39 331 882 4030</p>
      </div>
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────────
export default function AerojetWalkthrough() {
  const [screen,setScreen]=useState("home")

  const renderScreen = () => {
    switch(screen) {
      case "home":      return <ScreenHome onNav={setScreen}/>
      case "search":    return <ScreenSearch onNav={setScreen}/>
      case "results":   return <ScreenResults onNav={setScreen}/>
      case "booking":   return <ScreenBooking onNav={setScreen}/>
      case "success":   return <ScreenSuccess onNav={setScreen}/>
      case "dashboard": return <ScreenDashboard onNav={setScreen}/>
      case "pipeline":  return <ScreenPipeline onNav={setScreen}/>
      case "quotes":    return <ScreenQuotes onNav={setScreen}/>
      case "analytics": return <ScreenAnalytics onNav={setScreen}/>
      case "marco":     return <ScreenMarco onNav={setScreen}/>
      case "whatsapp":  return <ScreenWhatsApp onNav={setScreen}/>
      default: return <ScreenHome onNav={setScreen}/>
    }
  }

  return (
    <div style={{display:"flex",height:"100vh",background:D,color:"#F0EDE6",fontFamily:serif,overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#C9A84C}
        select option{background:#0F1220;color:#F0EDE6}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
      `}</style>

      {/* Left nav */}
      <div style={{width:130,background:"#050810",borderRight:"1px solid rgba(201,168,76,.12)",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
        <div style={{padding:"16px 14px 14px",borderBottom:"1px solid rgba(201,168,76,.08)"}}>
          <div style={{fontFamily:serif,fontSize:12,fontWeight:700,letterSpacing:3,color:"#F0EDE6"}}>✦ AEROJET</div>
          <div style={{fontFamily:sans,fontSize:7,letterSpacing:2,color:G,marginTop:2}}>WALKTHROUGH</div>
        </div>
        <div style={{fontFamily:sans,fontSize:8,letterSpacing:2,color:"rgba(240,237,230,.2)",padding:"10px 14px 4px"}}>CLIENTE</div>
        {SCREENS.slice(0,6).map(s=>(
          <div key={s.id} onClick={()=>setScreen(s.id)} style={{padding:"9px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:sans,fontSize:10,letterSpacing:1,color:screen===s.id?G:M,background:screen===s.id?"rgba(201,168,76,.08)":"transparent",borderLeft:`2px solid ${screen===s.id?G:"transparent"}`,transition:"all .15s"}}>
            <span style={{fontSize:11}}>{s.icon}</span>
            {s.label}
          </div>
        ))}
        <div style={{fontFamily:sans,fontSize:8,letterSpacing:2,color:"rgba(240,237,230,.2)",padding:"10px 14px 4px",marginTop:4,borderTop:"1px solid rgba(201,168,76,.06)"}}>BROKER</div>
        {SCREENS.slice(6).map(s=>(
          <div key={s.id} onClick={()=>setScreen(s.id)} style={{padding:"9px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontFamily:sans,fontSize:10,letterSpacing:1,color:screen===s.id?G:M,background:screen===s.id?"rgba(201,168,76,.08)":"transparent",borderLeft:`2px solid ${screen===s.id?G:"transparent"}`,transition:"all .15s"}}>
            <span style={{fontSize:11}}>{s.icon}</span>
            {s.label}
          </div>
        ))}
        <div style={{flex:1}}/>
        <div style={{padding:"12px 14px",borderTop:"1px solid rgba(201,168,76,.08)",fontFamily:sans,fontSize:9,color:"rgba(240,237,230,.2)"}}>
          45/45 test ✅<br/>Build v8 · 7,744 righe
        </div>
      </div>

      {/* Screen */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {renderScreen()}
      </div>
    </div>
  )
}
