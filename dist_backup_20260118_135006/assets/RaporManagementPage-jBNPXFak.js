import{j as e}from"./feature-qr-CH11mU4S.js";import{r as o}from"./vendor-react-DD1R5Y1N.js";import{c as G,a as J,j as Q,m as S}from"./index-Cx4F5PbP.js";import{t as Z}from"./index-DBV0ugPJ.js";import{ap as $,Y as C,as as K,bf as O,p as V,aX as W,an as X,bI as ee,t as te,o as ae,h as se,B as ie,S as ne}from"./vendor-ui-4oAqa_ZM.js";import"./vendor-firebase-mGmEEqo4.js";function ge(){const{settings:r}=G(),[x,h]=o.useState(!0),[n,m]=o.useState([]),[u,b]=o.useState([]),[v,q]=o.useState(""),[g,j]=o.useState(()=>{const t=new Date;return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}`}),[c,M]=o.useState("monthly"),[z,F]=o.useState(()=>new Date().getFullYear()),[f,w]=o.useState(()=>new Date().getMonth()<6?1:2),[p,N]=o.useState(null),[P,T]=o.useState("grid"),[A,L]=o.useState(!1),R=o.useRef(null),i=(r==null?void 0:r.warnaUtama)||"#0f172a";o.useEffect(()=>{U()},[g,c,z,f]),o.useEffect(()=>{if(b(v?n.filter(t=>t.santri.nama_lengkap_santri.toLowerCase().includes(v.toLowerCase())):n),p&&n.length>0){const t=n.find(a=>a.santri.id_santri===p.santri.id_santri);t&&N(t)}},[v,n]);const U=async()=>{h(!0);try{const t=c==="semester"?await J.getRaporManagementSemester(z,f):await J.getRaporManagementRealtime(g);t.success&&m(t.data||[])}catch(t){console.error(t)}finally{h(!1)}},k=t=>{const[a,l]=t.split("-");return`${["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][parseInt(l)-1]} ${a}`},_=()=>`${f===1?"Genap":"Ganjil"} - ${z}`,E=t=>t.split(" ").map(a=>a[0]).join("").substring(0,2).toUpperCase(),Y=t=>t>=9?"Mumtaz":t>=8?"Jayyid Jiddan":t>=7?"Jayyid":t>=6?"Maqbul":"Dhaif",H=()=>{if(!p)return;const t=p.santri,a=p.kuantitas,l=p.cohort,d=window.open("","_blank");if(!d)return;const s=i;d.document.write(`
      <html><head><title>Rapor PRIDE - ${t.nama_lengkap_santri}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Inter', sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        
        .capture-container {
          width: 400px;
          aspect-ratio: 4/5;
          background: #fff;
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .poster-wrapper {
          width: calc(100% - 24px);
          aspect-ratio: 1/1;
          border-radius: 16px;
          padding: 3px;
          background: linear-gradient(135deg, ${s}, ${s}40, #e5e7eb);
          position: relative;
        }
        
        .poster-card {
          width: 100%;
          height: 100%;
          background: #f8fafc;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .content {
          position: relative;
          height: 100%;
          padding: 20px 20px 12px 20px;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .title-box {
          background: ${s};
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .title-box p:first-child { font-size: 12px; font-weight: 700; line-height: 1.2; }
        .title-box p:last-child { font-size: 16px; font-weight: 900; line-height: 1.2; }
        
        .period-badge {
          background: white;
          border: 2px solid ${s};
          color: ${s};
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .main-area {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        
        .stat-column {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 68px;
          flex-shrink: 0;
        }
        
        .stat-bubble {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .stat-bubble.primary { background: ${s}; border-color: ${s}; }
        .stat-bubble.primary .stat-value { color: white; }
        .stat-bubble.primary .stat-label { color: rgba(255,255,255,0.9); }
        
        .stat-value { font-size: 14px; font-weight: 700; color: #1f2937; line-height: 1; }
        .stat-label { font-size: 7px; font-weight: 500; color: #6b7280; line-height: 1; margin-top: 2px; }
        
        .center-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .blob {
          position: absolute;
          inset: -16px;
          background: ${s}15;
          border-radius: 60% 40% 55% 45% / 45% 55% 45% 55%;
        }
        
        .photo {
          position: relative;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid white;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          z-index: 10;
        }
        
        .photo-placeholder {
          position: relative;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${s}, ${s}99);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid white;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          z-index: 10;
        }
        
        .photo-placeholder span { font-size: 30px; font-weight: 700; color: white; }
        
        .name-section {
          text-align: center;
          margin-top: 8px;
          z-index: 20;
        }
        
        .name-section h1 { font-size: 12px; font-weight: 900; color: #111827; line-height: 1.2; }
        .name-section p.program { font-size: 9px; color: #6b7280; font-weight: 500; }
        .name-section p.angkatan { font-size: 8px; color: #9ca3af; }
        
        .bottom-stats {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        
        .bottom-stat {
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .bottom-stat .stat-value { font-size: 16px; font-weight: 900; line-height: 1; }
        .bottom-stat .stat-label { font-size: 8px; font-weight: 500; line-height: 1; margin-top: 2px; }
        
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 8px;
          margin-top: 8px;
          border-top: 1px solid #f3f4f6;
        }
        
        .footer-left { display: flex; align-items: center; gap: 4px; }
        .footer-logo { height: 16px; width: auto; }
        .footer span { font-size: 9px; color: #9ca3af; font-weight: 500; }
        
        @media print {
          body { background: white; padding: 0; }
          .capture-container { box-shadow: none; }
          .poster-card { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
          .bottom-stat { 
        padding: 4px 10px; border-radius: 8px; font-weight: bold; 
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-width: 45px;
      }
      .stat-sup { font-size: 7px; opacity: 0.7; margin-left: 1px; }
      .grade-label { font-size: 6px; font-weight: 900; margin-top: 1px; line-height: 1; }
      .grade-sub { font-size: 5px; font-weight: 500; opacity: 0.6; text-transform: uppercase; margin-top: 1px; }
        }
      </style>
      </head><body>
      <div class="capture-container">
        <div class="poster-card">
          <div class="grid-bg"></div>
          <div class="content">
            <div class="header">
              <div class="title-box">
                <p>Rapor</p>
                <p>PRIDE</p>
              </div>
              <div class="period-badge">${c==="monthly"?k(g):_()}</div>
            </div>
            
            <div class="main-area">
              <div class="main-stats">
              <div class="stats-col">
                ${a.productive.jam_produktif>0?`<div class="stat-box" style="border-color:${s}40;"><span class="val" style="color:${s};">${a.productive.jam_produktif}</span><span class="lbl">Jam Produktif</span></div>`:""}
                ${a.productive.hari_tracking>0?`<div class="stat-box"><span class="val">${a.productive.hari_tracking}</span><span class="lbl">Tracking</span></div>`:""}
                ${a.productive.review>0?`<div class="stat-box"><span class="val">${a.productive.review}<sup class="stat-sup">/${l.max_review}</sup></span><span class="lbl">Review</span></div>`:""}
                ${a.productive.portfolio>0?`<div class="stat-box"><span class="val">${a.productive.portfolio}<sup class="stat-sup">/${l.max_portfolio}</sup></span><span class="lbl">Portfolio</span></div>`:""}
                ${a.discipline.prosentase_disiplin>0?`<div class="stat-box" style="background:${s}; color:white;"><span class="val" style="font-size:10px;">${a.discipline.prosentase_disiplin}%</span><span class="lbl" style="color:rgba(255,255,255,0.9);">Disiplin</span></div>`:""}
                ${a.discipline.sanksi>0?`<div class="stat-box" style="background:#ef4444; color:white;"><span class="val">${a.discipline.sanksi}</span><span class="lbl">Sanksi</span></div>`:""}
              </div>

              <div class="photo-section">
                <div class="photo-container">
                  ${t.foto_santri?`<img src="${t.foto_santri}" style="box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3);" />`:`<div class="initials" style="background:linear-gradient(135deg, ${s}, ${s}99);">${E(t.nama_lengkap_santri)}</div>`}
                </div>
                <div class="name-card">
                  <div class="santri-name">${t.nama_lengkap_santri}</div>
                  <div class="santri-prog" style="color:${s};">${t.program_santri}</div>
                  <div class="santri-angkatan">${t.angkatan_santri}</div>
                </div>
              </div>

              <div class="stats-col">
                ${a.rabbani.hafalan_baru>0?`<div class="stat-box" style="background:${s}; color:white;"><span class="val">${a.rabbani.hafalan_baru}<sup class="stat-sup">~${l.avg_ziyadah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">${c==="semester"?"Tot Ziyadah":"Ziyadah"}</span></div>`:""}
                ${a.rabbani.murojaah>0?`<div class="stat-box" style="background:${s}dd; color:white;"><span class="val">${a.rabbani.murojaah}<sup class="stat-sup">~${l.avg_murojaah}</sup></span><span class="lbl" style="color:rgba(255,255,255,0.9);">Murojaah</span></div>`:""}
                ${a.rabbani.tahfidz_total_setoran>0?`<div class="stat-box" style="border-color:${s};"><span class="val" style="color:${s};">${a.rabbani.tahfidz_total_setoran}</span><span class="lbl">Total Setoran</span></div>`:""}
                ${a.rabbani.tahfidz_grade_score>0?`<div class="stat-box" style="background:${s}20;"><span class="val" style="color:${s};">${a.rabbani.tahfidz_grade_score}</span><span class="grade-label" style="color:#4b5563;">${Y(a.rabbani.tahfidz_grade_score)}</span><span class="grade-sub">Total Hafalan</span></div>`:""}
                ${a.rabbani.hari_ibadah>0?`<div class="stat-box" style="background:#10b981; color:white;"><span class="val">${a.rabbani.hari_ibadah}</span><span class="lbl">Hari Ibadah</span></div>`:""}
                ${a.intelligent.course_progress>0?`<div class="stat-box" style="background:#3b82f6; color:white;"><span class="val">${a.intelligent.course_progress}%</span><span class="lbl">Course</span></div>`:""}
              </div>
            </div>

            <div class="bottom-stats">
              ${a.ethic.piket>0?`<div class="bottom-stat" style="background:${s}15;"><span class="stat-value" style="color:${s};">${a.ethic.piket}</span><span class="stat-label" style="color:#6b7280;">Piket</span></div>`:""}
              ${a.intelligent.quiz_avg_score>0?`<div class="bottom-stat" style="background:#f59e0b;"><span class="stat-value" style="color:white;">${a.intelligent.quiz_avg_score.toFixed(0)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Quiz Avg</span></div>`:""}
              ${a.productive.review_avg_nilai>0?`<div class="bottom-stat" style="background:#8b5cf6;"><span class="stat-value" style="color:white;">${a.productive.review_avg_nilai.toFixed(1)}</span><span class="stat-label" style="color:rgba(255,255,255,0.9);">Review Avg</span></div>`:""}
            </div>
            
            <div class="footer">
              <div class="footer-left">
                <img src="${r.logo||"/logo.png"}" class="footer-logo" />
                <span>${r.namaSingkat||"PISANTRI"}</span>
              </div>
              <span>${r.namaPesantren||"Pondok Informatika"}</span>
            </div>
          </div>
        </div>
      </div>
      </body></html>
    `),d.document.close(),d.print()},B=async()=>{if(!(!R.current||!p)){L(!0);try{const t=await Z(R.current,{quality:1,pixelRatio:2,backgroundColor:"#ffffff"}),a=document.createElement("a");a.href=t,a.download=`rapor-${p.santri.nama_lengkap_santri.replace(/\s+/g,"-")}-${g}.png`,document.body.appendChild(a),a.click(),document.body.removeChild(a)}catch(t){console.error("Capture failed:",t)}finally{L(!1)}}};if(p){const t=p.kuantitas,a=p.santri,l=p.cohort;return e.jsx("div",{className:"min-h-screen bg-gray-100 py-6",children:e.jsxs("div",{className:"max-w-md mx-auto px-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("button",{onClick:()=>N(null),className:"flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm",children:[e.jsx($,{className:"w-4 h-4"})," Kembali"]}),e.jsxs("div",{className:"flex items-center gap-1 bg-white rounded-lg p-0.5 shadow-sm border border-gray-200",children:[e.jsx("button",{onClick:()=>M("monthly"),className:`px-2 py-1 text-xs font-medium rounded-md transition-all ${c==="monthly"?"text-white":"text-gray-600 hover:bg-gray-100"}`,style:c==="monthly"?{backgroundColor:i}:{},children:"Bulanan"}),e.jsx("button",{onClick:()=>M("semester"),className:`px-2 py-1 text-xs font-medium rounded-md transition-all ${c==="semester"?"text-white":"text-gray-600 hover:bg-gray-100"}`,style:c==="semester"?{backgroundColor:i}:{},children:"Semester"})]}),c==="monthly"?e.jsxs("div",{className:"flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm",children:[e.jsx("button",{onClick:()=>{const[d,s]=g.split("-").map(Number),y=new Date(d,s-2,1);j(`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}`)},className:"p-1 hover:bg-gray-100 rounded text-gray-500",children:e.jsx($,{className:"w-4 h-4"})}),e.jsx("span",{className:"px-2 text-xs font-medium text-gray-700",children:k(g)}),e.jsx("button",{onClick:()=>{const[d,s]=g.split("-").map(Number),y=new Date(d,s,1);j(`${y.getFullYear()}-${String(y.getMonth()+1).padStart(2,"0")}`)},className:"p-1 hover:bg-gray-100 rounded text-gray-500",children:e.jsx(C,{className:"w-4 h-4"})})]}):e.jsxs("div",{className:"flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm",children:[e.jsx("button",{onClick:()=>{f===1?(w(2),F(d=>d-1)):w(1)},className:"p-1 hover:bg-gray-100 rounded text-gray-500",children:e.jsx($,{className:"w-4 h-4"})}),e.jsx("span",{className:"px-2 text-xs font-medium text-gray-700",children:_()}),e.jsx("button",{onClick:()=>{f===2?(w(1),F(d=>d+1)):w(2)},className:"p-1 hover:bg-gray-100 rounded text-gray-500",children:e.jsx(C,{className:"w-4 h-4"})})]})]}),e.jsx("div",{ref:R,className:"rounded-3xl p-6 flex flex-col items-center justify-center",style:{aspectRatio:"4/5",backgroundColor:"#ffffff"},children:e.jsx("div",{className:"relative rounded-2xl overflow-hidden p-[3px]",style:{aspectRatio:"11/12",width:"calc(100% - 60px)",background:`linear-gradient(135deg, ${i}, ${i}40, #e5e7eb)`},children:e.jsxs("div",{className:"relative w-full h-full rounded-xl overflow-hidden",style:{backgroundColor:"#f8fafc"},children:[a.foto_santri&&e.jsx("div",{className:"absolute inset-0 overflow-hidden rounded-xl",children:e.jsx("img",{src:a.foto_santri,alt:"",className:"w-full h-full object-cover",style:{opacity:.1,filter:"saturate(0.1) contrast(1.3)"}})}),e.jsx("div",{className:"absolute inset-0 z-[1]",style:{backgroundImage:"linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px)",backgroundSize:"20px 20px"}}),e.jsxs("div",{className:"relative z-[2] h-full flex flex-col px-12 py-1",children:[e.jsxs("div",{className:"flex items-start justify-between mb-2",children:[e.jsxs("div",{style:{backgroundColor:i},className:"text-white px-4 py-2 rounded-xl shadow-lg",children:[e.jsx("p",{className:"text-xs font-bold leading-tight",children:"Rapor"}),e.jsx("p",{className:"text-base font-black leading-tight",children:"PRIDE"})]}),e.jsx("div",{style:{borderColor:i,color:i},className:"bg-white border-2 px-3 py-1.5 rounded-full shadow text-xs font-bold",children:c==="monthly"?k(g):_()})]}),e.jsxs("div",{className:"flex-1 flex items-center justify-center gap-2",children:[e.jsxs("div",{className:"flex flex-col gap-0.5 w-[56px] flex-shrink-0",children:[t.productive.jam_produktif>0&&e.jsxs("div",{style:{borderColor:`${i}40`},className:"bg-white border px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center",children:[e.jsx("p",{style:{color:i},className:"text-sm font-bold leading-none",children:t.productive.jam_produktif}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5 whitespace-nowrap",children:"Jam Produktif"})]}),t.productive.hari_tracking>0&&e.jsxs("div",{className:"bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsx("p",{className:"text-xs font-bold text-gray-800 leading-none",children:t.productive.hari_tracking}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5",children:"Tracking"})]}),t.productive.review>0&&e.jsxs("div",{className:"bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-xs font-bold text-gray-800 leading-none",children:[t.productive.review,e.jsxs("sup",{className:"text-[7px] ml-0.5 opacity-60",children:["/",l.max_review]})]}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5",children:"Review"})]}),t.productive.portfolio>0&&e.jsxs("div",{className:"bg-white/80 border border-gray-200 px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-xs font-bold text-gray-800 leading-none",children:[t.productive.portfolio,e.jsxs("sup",{className:"text-[7px] ml-0.5 opacity-60",children:["/",l.max_portfolio]})]}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5",children:"Portfolio"})]}),t.discipline.prosentase_disiplin>0&&e.jsxs("div",{style:{backgroundColor:i},className:"text-white px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-[10px] font-bold leading-none",children:[t.discipline.prosentase_disiplin,"%"]}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5",children:"Disiplin"})]}),t.discipline.sanksi>0&&e.jsxs("div",{className:"bg-red-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsx("p",{className:"text-xs font-bold leading-none",children:t.discipline.sanksi}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5",children:"Sanksi"})]})]}),e.jsxs("div",{className:"relative flex-1 flex flex-col items-center justify-center",children:[e.jsx("div",{className:"absolute -inset-4 rounded-full opacity-30",style:{background:`radial-gradient(ellipse at center, ${i}40, transparent 70%)`}}),e.jsx("div",{className:"relative w-32 h-32 z-10",children:a.id_santri?e.jsx("img",{src:a.foto_santri||`https://ui-avatars.com/api/?name=${encodeURIComponent(a.nama_lengkap_santri)}&background=random&color=fff`,alt:a.nama_lengkap_santri,className:"w-full h-full object-cover rounded-full border-4 border-white shadow-xl",style:{boxShadow:"0 10px 40px -10px rgba(0,0,0,0.3)"}}):e.jsx("div",{style:{background:`linear-gradient(135deg, ${i}, ${i}99)`},className:"w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-xl",children:e.jsx("span",{className:"text-4xl font-bold text-white",children:E(a.nama_lengkap_santri)})})}),e.jsxs("div",{className:"text-center mt-1 z-20 bg-white/90 px-3 py-1 rounded-xl shadow-sm backdrop-blur-sm",children:[e.jsx("h1",{className:"text-sm font-black text-gray-900 leading-tight",children:a.nama_lengkap_santri}),e.jsx("p",{style:{color:i},className:"text-[10px] font-semibold",children:a.program_santri}),e.jsx("p",{className:"text-[8px] text-gray-400",children:a.angkatan_santri})]})]}),e.jsxs("div",{className:"flex flex-col gap-0.5 w-[56px] flex-shrink-0",children:[t.rabbani.hafalan_baru>0&&e.jsxs("div",{style:{backgroundColor:i},className:"text-white px-1.5 py-1.5 rounded-lg shadow-sm flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-sm font-bold leading-none",children:[t.rabbani.hafalan_baru,e.jsxs("sup",{className:"text-[7px] ml-0.5 opacity-80",children:["~",l.avg_ziyadah]})]}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap",children:c==="semester"?"Tot Ziyadah":"Ziyadah"})]}),t.rabbani.murojaah>0&&e.jsxs("div",{style:{backgroundColor:`${i}dd`},className:"text-white px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-xs font-bold leading-none",children:[t.rabbani.murojaah,e.jsxs("sup",{className:"text-[7px] ml-0.5 opacity-80",children:["~",l.avg_murojaah]})]}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5",children:"Murojaah"})]}),t.rabbani.tahfidz_total_setoran>0&&e.jsxs("div",{style:{borderColor:i},className:"bg-white/80 border px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsx("p",{style:{color:i},className:"text-xs font-bold leading-none",children:t.rabbani.tahfidz_total_setoran}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5",children:"Total Setoran"})]}),t.rabbani.tahfidz_grade_score>0&&e.jsxs("div",{style:{backgroundColor:`${i}20`},className:"px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsx("p",{style:{color:i},className:"text-xs font-black leading-none",children:t.rabbani.tahfidz_grade_score}),e.jsx("p",{className:"text-[6px] font-black text-gray-600 leading-none mt-0.5",children:Y(t.rabbani.tahfidz_grade_score)}),e.jsx("p",{className:"text-[5px] font-medium text-gray-400 leading-none mt-0.5 uppercase tracking-tighter",children:"Total Hafalan"})]}),t.rabbani.hari_ibadah>0&&e.jsxs("div",{className:"bg-emerald-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsx("p",{className:"text-xs font-bold leading-none",children:t.rabbani.hari_ibadah}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap",children:"Hari Ibadah"})]}),t.intelligent.course_progress>0&&e.jsxs("div",{className:"bg-blue-500 text-white px-1.5 py-1 rounded flex flex-col items-center justify-center",children:[e.jsxs("p",{className:"text-xs font-bold leading-none",children:[t.intelligent.course_progress,"%"]}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5",children:"Course"})]})]})]}),e.jsxs("div",{className:"flex justify-center gap-1.5 mt-1",children:[t.ethic.piket>0&&e.jsxs("div",{style:{backgroundColor:`${i}15`},className:"px-2 py-1 rounded flex flex-col items-center justify-center min-w-[36px]",children:[e.jsx("p",{style:{color:i},className:"text-sm font-black leading-none",children:t.ethic.piket}),e.jsx("p",{className:"text-[6px] font-medium text-gray-500 leading-none mt-0.5",children:"Piket"})]}),t.intelligent.quiz_avg_score>0&&e.jsxs("div",{className:"bg-amber-500 text-white px-2 py-1 rounded flex flex-col items-center justify-center min-w-[36px]",children:[e.jsx("p",{className:"text-sm font-black leading-none",children:t.intelligent.quiz_avg_score.toFixed(0)}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap",children:"Quiz Avg"})]}),t.productive.review_avg_nilai>0&&e.jsxs("div",{className:"bg-purple-500 text-white px-2 py-1 rounded flex flex-col items-center justify-center min-w-[40px]",children:[e.jsx("p",{className:"text-sm font-black leading-none",children:t.productive.review_avg_nilai.toFixed(1)}),e.jsx("p",{className:"text-[6px] font-medium opacity-90 leading-none mt-0.5 whitespace-nowrap",children:"Review Avg"})]})]}),e.jsxs("div",{className:"flex items-center justify-between pt-2 mt-2 border-t border-gray-100",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("img",{src:r.logo||"/logo.png",alt:"Logo",className:"h-4 w-auto"}),e.jsx("span",{className:"text-[9px] font-medium text-gray-400",children:r.namaSingkat||"PISANTRI"})]}),e.jsx("p",{className:"text-[9px] text-gray-400",children:r.namaPesantren||"Pondok Informatika"})]})]})]})})}),e.jsxs("div",{className:"flex items-center justify-center gap-2 mt-6",children:[e.jsxs("button",{onClick:B,disabled:A,style:{backgroundColor:i},className:"flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-50",children:[e.jsx(K,{className:"w-4 h-4"})," ",A?"Loading...":"Capture Poster"]}),e.jsxs("button",{onClick:H,className:"flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-gray-800 transition-all",children:[e.jsx(O,{className:"w-4 h-4"})," Print Rapor"]})]})]})})}return e.jsxs("div",{className:"min-h-screen bg-white",children:[e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20",children:[e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200",children:e.jsx(V,{className:"w-6 h-6 text-white"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-black text-gray-900",children:"Rapor PRIDE"}),e.jsx("p",{className:"text-sm font-bold text-indigo-500 uppercase tracking-widest",children:"Management Console"})]})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1",children:[e.jsx("button",{onClick:()=>{const[t,a]=g.split("-").map(Number),l=new Date(t,a-2,1);j(`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}`)},className:"p-2 hover:bg-gray-200 rounded-lg text-gray-600",children:e.jsx($,{className:"w-5 h-5"})}),e.jsx("span",{className:"px-4 py-1 font-semibold text-gray-700 min-w-[140px] text-center",children:c==="monthly"?k(g):_()}),e.jsx("button",{onClick:()=>{const[t,a]=g.split("-").map(Number),l=new Date(t,a,1);j(`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}`)},className:"p-2 hover:bg-gray-200 rounded-lg text-gray-600",children:e.jsx(C,{className:"w-5 h-5"})})]})]}),e.jsxs("div",{className:"flex flex-col md:flex-row gap-4 mb-10",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(W,{className:"absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300"}),e.jsx("input",{type:"text",placeholder:"Search excellence...",value:v,onChange:t=>q(t.target.value),className:"w-full pl-14 pr-6 py-5 rounded-[2rem] bg-gray-50/50 border-none focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("div",{className:"bg-gray-50/50 p-1.5 rounded-[2rem] flex items-center gap-1",children:[e.jsx("button",{onClick:()=>T("grid"),className:`p-3 rounded-3xl transition-all ${P==="grid"?"bg-white shadow-md text-indigo-600":"text-gray-400 hover:text-gray-600"}`,children:e.jsx(X,{className:"w-5 h-5"})}),e.jsx("button",{onClick:()=>T("list"),className:`p-3 rounded-3xl transition-all ${P==="list"?"bg-white shadow-md text-indigo-600":"text-gray-400 hover:text-gray-600"}`,children:e.jsx(ee,{className:"w-5 h-5"})})]})})]}),x?e.jsxs("div",{className:"flex flex-col items-center justify-center py-32 gap-6",children:[e.jsx("div",{className:"w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"}),e.jsx("p",{className:"text-sm font-bold text-gray-300 uppercase tracking-[0.3em]",children:"Processing Intelligence"})]}):u.length===0?e.jsxs("div",{className:"flex flex-col items-center justify-center py-32 text-center",children:[e.jsx("div",{className:"w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6",children:e.jsx(te,{className:"w-10 h-10 text-gray-200"})}),e.jsx("h3",{className:"text-xl font-bold text-gray-900 mb-2",children:"Belum ada data rapor"}),e.jsx("p",{className:"text-gray-400 text-sm",children:"Tidak ditemukan rekaman performa untuk periode ini."})]}):e.jsx(Q,{mode:"popLayout",children:P==="grid"?e.jsx(S.div,{layout:!0,initial:{opacity:0},animate:{opacity:1},className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",children:u.map((t,a)=>e.jsx(re,{item:t,index:a,onClick:()=>N(t)},t.santri.id_santri))}):e.jsx(S.div,{layout:!0,initial:{opacity:0},animate:{opacity:1},className:"space-y-3",children:u.map((t,a)=>e.jsx(le,{item:t,index:a,onClick:()=>N(t)},t.santri.id_santri))})})]}),e.jsx("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-50 mt-10",children:e.jsxs("div",{className:"flex flex-col md:flex-row items-center justify-between gap-6 opacity-40",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ae,{className:"w-4 h-4"}),e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-widest",children:"Encrypted Performance Data"})]}),e.jsxs("p",{className:"text-[10px] font-bold text-gray-400",children:["© ",new Date().getFullYear()," Pisantri Educational Platform"]})]})})]})}function re({item:r,index:x,onClick:h}){const n=r.santri,m=r.kuantitas,u=n.nama_lengkap_santri.split(" ").map(b=>b[0]).join("").substring(0,2).toUpperCase();return e.jsxs(S.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:x*.05},onClick:h,className:"group relative bg-[#F8FAFC] p-6 rounded-[2.5rem] border border-gray-100/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all cursor-pointer",children:[e.jsxs("div",{className:"flex items-start justify-between mb-6",children:[e.jsxs("div",{className:"relative",children:[e.jsx("div",{className:"absolute -inset-1 bg-indigo-500/10 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-all"}),n.foto_santri?e.jsx("img",{src:n.foto_santri,className:"relative w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-lg"}):e.jsx("div",{className:"relative w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg",children:u})]}),e.jsxs("div",{className:"bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase tracking-widest leading-none",children:["RANK #",x+1]})]}),e.jsxs("div",{className:"mb-8",children:[e.jsx("h3",{className:"text-lg font-bold text-gray-900 truncate leading-tight mb-1 group-hover:text-indigo-600 transition-all italic uppercase",children:n.nama_lengkap_santri}),e.jsx("p",{className:"text-[11px] font-bold text-gray-400 uppercase tracking-widest",children:n.program_santri})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-3",children:[e.jsx(I,{icon:e.jsx(se,{className:"w-3.5 h-3.5"}),value:m.productive.jam_produktif,color:"blue"}),e.jsx(I,{icon:e.jsx(ie,{className:"w-3.5 h-3.5"}),value:m.rabbani.hafalan_baru,color:"emerald"}),e.jsx(I,{icon:e.jsx(ne,{className:"w-3.5 h-3.5"}),value:m.intelligent.course_progress,unit:"%",color:"violet"})]})]})}function I({icon:r,value:x,color:h,unit:n}){const m={blue:"bg-blue-50 text-blue-600",emerald:"bg-emerald-50 text-emerald-600",violet:"bg-violet-50 text-violet-600"};return e.jsxs("div",{className:`p-3 rounded-2xl ${m[h]} flex flex-col items-center gap-1.5`,children:[e.jsx("div",{className:"opacity-60",children:r}),e.jsxs("span",{className:"text-xs font-bold italic",children:[x,n]})]})}function le({item:r,index:x,onClick:h}){const n=r.santri,m=r.kuantitas,u=n.nama_lengkap_santri.split(" ").map(b=>b[0]).join("").substring(0,2).toUpperCase();return e.jsxs(S.div,{initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{delay:x*.03},onClick:h,className:"group bg-gray-50/50 hover:bg-white p-4 rounded-3xl border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all cursor-pointer flex items-center gap-4",children:[e.jsx("span",{className:"w-8 text-[10px] font-bold text-gray-300 text-center",children:x+1}),n.foto_santri?e.jsx("img",{src:n.foto_santri,className:"w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"}):e.jsx("div",{className:"w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-lg font-bold border-2 border-white shadow-md",children:u}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h3",{className:"font-bold text-gray-900 truncate uppercase italic tracking-tighter text-base group-hover:text-indigo-600 transition-all",children:n.nama_lengkap_santri}),e.jsx("p",{className:"text-[10px] font-bold text-gray-400 uppercase tracking-widest",children:n.program_santri})]}),e.jsxs("div",{className:"hidden md:flex items-center gap-4 px-6 border-l border-gray-100",children:[e.jsx(D,{label:"Jam",value:m.productive.jam_produktif,color:"blue"}),e.jsx(D,{label:"Hafalan",value:m.rabbani.hafalan_baru,color:"emerald"}),e.jsx(D,{label:"Progress",value:`${m.intelligent.course_progress}%`,color:"violet"})]}),e.jsx("div",{className:"p-3 bg-white rounded-xl text-gray-300 group-hover:text-indigo-600 transition-all",children:e.jsx(C,{className:"w-5 h-5"})})]})}function D({label:r,value:x,color:h}){const n={blue:"text-blue-500",emerald:"text-emerald-500",violet:"text-violet-500"};return e.jsxs("div",{className:"text-center min-w-[70px]",children:[e.jsx("p",{className:"text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1",children:r}),e.jsx("p",{className:`text-sm font-bold italic ${n[h]}`,children:x})]})}export{ge as default};
