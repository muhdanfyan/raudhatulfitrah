import{j as e}from"./feature-qr-CH11mU4S.js";import{f as R,r as n,L as B}from"./vendor-react-DD1R5Y1N.js";import{a as x}from"./index-Cx4F5PbP.js";import{L as P,x as M,bf as Q,aX as V,q,b7 as C,U as J}from"./vendor-ui-4oAqa_ZM.js";import"./vendor-firebase-mGmEEqo4.js";const I={idcard_title:"Pondok Pesantren",idcard_subtitle:"Informatika",idcard_bg_color:"#1e40af",idcard_text_color:"#ffffff",idcard_show_logo:"1",idcard_show_qr:"1",idcard_footer_text:"Scan untuk verifikasi"};function H(){const{id:a}=R(),[i,f]=n.useState([]),[r,c]=n.useState([]),[p,u]=n.useState(!0),[h,l]=n.useState(""),[m,$]=n.useState(!1),[N,k]=n.useState(!1),[_,z]=n.useState(I),A=n.useRef(null),b=JSON.parse(localStorage.getItem("pisantri_user")||"{}"),y=b.role==="santri",E=["superadmin","akademik","pembinaan"].includes(b.role);n.useEffect(()=>{F()},[]);const F=async()=>{try{const t=await x.get("/settings/idcard");t.success&&t.data&&z({...I,...t.data})}catch(t){console.error("Failed to fetch ID card settings:",t)}};n.useEffect(()=>{(async()=>{var s;u(!0);try{let o="/santri?per_page=200&status=Mondok";a?o=`/santri/${a}`:y&&b.santri_id&&(o=`/santri/${b.santri_id}`);const d=await x.get(o);if(d.status==="success"||d.success)if(a||y){const g=d.data;f([g]),c([g.id])}else{const g=Array.isArray(d.data)?d.data:((s=d.data)==null?void 0:s.data)||[];f(g)}}catch(o){console.error("Failed to fetch santri:",o)}finally{u(!1)}})()},[a]);const j=i.filter(t=>{var s;return(s=t.name)==null?void 0:s.toLowerCase().includes(h.toLowerCase())}),U=t=>{c(s=>s.includes(t)?s.filter(o=>o!==t):[...s,t])},T=()=>{r.length===j.length?c([]):c(j.map(t=>t.id))},D=async()=>{k(!0),$(!0),await new Promise(d=>setTimeout(d,100));const t=document.querySelectorAll(".id-card-qr"),s=document.querySelectorAll(".id-card-photo"),o=d=>Promise.all(Array.from(d).map(g=>{const w=g;return w.complete?Promise.resolve():new Promise(v=>{w.onload=v,w.onerror=v,setTimeout(v,3e3)})}));await Promise.all([o(t),o(s)]),setTimeout(()=>{window.print(),k(!1)},500)},S=i.filter(t=>r.includes(t.id));return p?e.jsx("div",{className:"flex items-center justify-center min-h-[400px]",children:e.jsx(P,{className:"w-8 h-8 animate-spin text-primary"})}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .id-card {
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .id-card {
          width: 53.98mm;
          height: 85.60mm;
          background: #ffffff;
          border-radius: 3mm;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }
        .id-card-header {
          width: 100%;
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          padding: 3mm 2mm;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2mm;
        }
        .id-card-logo {
          width: 10mm;
          height: 10mm;
          border-radius: 50%;
          background: white;
          padding: 1mm;
          object-fit: contain;
        }
        .id-card-header-text {
          color: white;
          text-align: left;
        }
        .id-card-header-text .title {
          font-size: 2.8mm;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.2mm;
        }
        .id-card-header-text .subtitle {
          font-size: 2mm;
          opacity: 0.9;
        }
        .id-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2mm;
          width: 100%;
        }
        .id-card-photo {
          width: 20mm;
          height: 20mm;
          border-radius: 2mm;
          border: 0.5mm solid #3b82f6;
          object-fit: cover;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        .id-card-name {
          color: #1e293b;
          font-size: 3.2mm;
          font-weight: 700;
          margin-top: 2mm;
          text-align: center;
          max-width: 48mm;
          line-height: 1.3;
        }
        .id-card-info {
          color: #64748b;
          font-size: 2.5mm;
          text-align: center;
          margin-top: 1mm;
        }
        .id-card-info strong {
          color: #3b82f6;
          font-weight: 600;
        }
        .id-card-qr-section {
          margin-top: 2mm;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .id-card-qr {
          width: 14mm;
          height: 14mm;
          padding: 0.5mm;
          border: 0.3mm solid #e5e7eb;
          border-radius: 1mm;
        }
        .id-card-qr-label {
          font-size: 1.8mm;
          color: #94a3b8;
          margin-top: 0.5mm;
        }
        .id-card-footer {
          width: 100%;
          background: #f8fafc;
          border-top: 0.3mm solid #e5e7eb;
          padding: 1.5mm;
          text-align: center;
        }
        .id-card-footer-id {
          font-size: 2mm;
          color: #64748b;
          font-weight: 500;
        }
        .id-card-footer-year {
          font-size: 1.8mm;
          color: #94a3b8;
        }
      `}),e.jsxs("div",{className:"no-print space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h1",{className:"text-2xl font-bold text-gray-900",children:"Cetak ID Card Santri"}),e.jsxs("div",{className:"flex gap-2",children:[E&&e.jsxs(B,{to:"/idcard/settings",className:"flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50",children:[e.jsx(M,{className:"w-5 h-5"}),"Template"]}),e.jsx("button",{onClick:D,disabled:r.length===0||N,className:"flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed",children:N?e.jsxs(e.Fragment,{children:[e.jsx(P,{className:"w-5 h-5 animate-spin"}),"Memuat gambar..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Q,{className:"w-5 h-5"}),"Cetak (",r.length,")"]})})]})]}),!y&&!a&&e.jsxs("div",{className:"flex gap-4 items-center",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(V,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"}),e.jsx("input",{type:"text",placeholder:"Cari nama santri...",className:"pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",value:h,onChange:t=>l(t.target.value)})]}),e.jsxs("button",{onClick:T,className:"flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50",children:[r.length===j.length?e.jsx(q,{className:"w-5 h-5 text-primary"}):e.jsx(C,{className:"w-5 h-5 text-gray-400"}),"Pilih Semua"]})]}),!y&&!a&&e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3",children:j.map(t=>e.jsxs("div",{onClick:()=>U(t.id),className:`cursor-pointer p-3 rounded-lg border-2 transition-all ${r.includes(t.id)?"border-primary bg-primary/5":"border-gray-200 hover:border-gray-300"}`,children:[e.jsx("div",{className:"flex items-center gap-2 mb-2",children:r.includes(t.id)?e.jsx(q,{className:"w-4 h-4 text-primary"}):e.jsx(C,{className:"w-4 h-4 text-gray-400"})}),e.jsx("img",{src:t.foto_url||(t.photo?`${x.getBaseUrl()}/storage/fotosantri/${t.photo}`:"/default-avatar.png"),alt:t.name,className:"w-full aspect-square object-cover rounded-lg mb-2",onError:s=>{s.target.src="https://via.placeholder.com/100?text=?"}}),e.jsx("p",{className:"text-xs font-medium text-gray-900 truncate",children:t.name}),e.jsx("p",{className:"text-xs text-gray-500 truncate",children:t.konsentrasi_nama||"-"})]},t.id))}),r.length>0&&e.jsxs("div",{className:"mt-6",children:[e.jsxs("h2",{className:"text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2",children:[e.jsx(J,{className:"w-5 h-5"}),"Preview ID Card (",r.length," santri)"]}),e.jsx("div",{className:"flex flex-wrap gap-4 justify-center p-6 bg-gray-100 rounded-xl",children:S.map(t=>e.jsx(L,{santri:t,settings:_},t.id))})]})]}),e.jsx("div",{className:"print-area hidden print:block",ref:A,children:e.jsx("div",{className:"flex flex-wrap gap-2 justify-start",children:S.map(t=>e.jsx(L,{santri:t,settings:_},t.id))})})]})}function L({santri:a,settings:i}){const f=a.foto_url||(a.photo?`${x.getBaseUrl()}/storage/fotosantri/${a.photo}`:"https://via.placeholder.com/100?text=?");new Date().getFullYear();const r=i.idcard_bg_color||"#1e40af",c=i.idcard_text_color||"#ffffff",p=i.idcard_show_logo!=="0",u=i.idcard_show_qr!=="0",h=i.idcard_logo_url||`${x.getBaseUrl()}/logo.png`,l=i.idcard_background_url;return e.jsxs("div",{className:"id-card",style:{backgroundImage:l?`url(${l})`:void 0,backgroundSize:"cover",backgroundPosition:"center"},children:[!l&&e.jsxs("div",{className:"id-card-header",style:{background:`linear-gradient(135deg, ${r} 0%, ${r}cc 100%)`},children:[p&&e.jsx("img",{src:h,alt:"Logo",className:"id-card-logo",onError:m=>{m.target.style.display="none"}}),e.jsxs("div",{className:"id-card-header-text",style:{color:c},children:[e.jsx("div",{className:"title",children:i.idcard_title||"Pondok Pesantren"}),e.jsx("div",{className:"subtitle",children:i.idcard_subtitle||"Informatika"})]})]}),e.jsxs("div",{className:"id-card-body",children:[l&&p&&e.jsx("img",{src:h,alt:"Logo",className:"id-card-logo-standalone",style:{width:"12mm",height:"12mm",borderRadius:"50%",objectFit:"contain",marginBottom:"2mm",background:"white",padding:"1mm",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"},onError:m=>{m.target.style.display="none"}}),e.jsx("img",{src:f,alt:a.name,className:"id-card-photo",style:{borderColor:r},onError:m=>{m.target.src="https://via.placeholder.com/100?text=?"}}),e.jsx("div",{className:"id-card-name",children:a.name}),e.jsxs("div",{className:"id-card-info",children:[e.jsx("div",{style:{color:r,fontWeight:600},children:a.konsentrasi_nama||"-"}),e.jsxs("div",{children:["Angkatan ",a.angkatan_nama||"-"]})]}),u&&e.jsxs("div",{className:"id-card-qr-section",children:[e.jsx("img",{src:`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${a.id}`,alt:"QR Code",className:"id-card-qr"}),e.jsx("div",{className:"id-card-qr-label",children:i.idcard_footer_text||"Scan untuk verifikasi"})]})]})]})}export{H as default};
