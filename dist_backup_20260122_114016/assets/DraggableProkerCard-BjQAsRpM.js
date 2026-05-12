import{j as e}from"./feature-qr-C9KTTG4-.js";import{j as p,k as f,C as j}from"./core.esm-DTVB0ODp.js";import{aC as v,ao as u,aA as y,a as w,aN as N,h as _,b as $}from"./vendor-ui-B6e0O3zL.js";import{g as C}from"./index-DHDr6u7z.js";const h={gray:{bg:"from-slate-50 to-gray-100",header:"from-slate-100 to-gray-50",headerText:"text-slate-700",border:"border-slate-200",accent:"bg-slate-500",hover:"bg-blue-50 border-blue-300",addBtn:"bg-slate-100 hover:bg-slate-200 text-slate-600"},blue:{bg:"from-blue-50/50 to-indigo-50/50",header:"from-blue-100 to-indigo-50",headerText:"text-blue-700",border:"border-blue-200",accent:"bg-gradient-to-r from-blue-500 to-indigo-500",hover:"bg-blue-100 border-blue-400",addBtn:"bg-blue-100 hover:bg-blue-200 text-blue-600"},emerald:{bg:"from-emerald-50/50 to-teal-50/50",header:"from-emerald-100 to-teal-50",headerText:"text-emerald-700",border:"border-emerald-200",accent:"bg-gradient-to-r from-emerald-500 to-teal-500",hover:"bg-emerald-100 border-emerald-400",addBtn:"bg-emerald-100 hover:bg-emerald-200 text-emerald-600"},amber:{bg:"from-amber-50/50 to-orange-50/50",header:"from-amber-100 to-orange-50",headerText:"text-amber-700",border:"border-amber-200",accent:"bg-gradient-to-r from-amber-500 to-orange-500",hover:"bg-amber-100 border-amber-400",addBtn:"bg-amber-100 hover:bg-amber-200 text-amber-600"},purple:{bg:"from-purple-50/50 to-pink-50/50",header:"from-purple-100 to-pink-50",headerText:"text-purple-700",border:"border-purple-200",accent:"bg-gradient-to-r from-purple-500 to-pink-500",hover:"bg-purple-100 border-purple-400",addBtn:"bg-purple-100 hover:bg-purple-200 text-purple-600"}};function S({id:m,title:a,children:i,icon:n,count:t=0,color:x="gray",horizontal:o=!1,onAdd:c,onEdit:d,onDelete:s,showAddButton:b=!0}){const{setNodeRef:g,isOver:l}=p({id:m}),r=h[x]||h.gray;return e.jsxs("div",{className:`
        flex flex-col 
        ${o?"min-h-[140px]":""} 
        w-full 
        bg-gradient-to-b ${r.bg}
        rounded-2xl 
        overflow-hidden 
        border-2 ${l?r.hover:r.border}
        shadow-lg shadow-gray-200/50
        transition-all duration-300
        ${l?"scale-[1.02] shadow-xl":""}
        group/column
      `,children:[e.jsxs("div",{className:`
        px-4 py-3 
        bg-gradient-to-r ${r.header}
        border-b ${r.border}
        flex items-center justify-between
        backdrop-blur-sm
      `,children:[e.jsxs("div",{className:"flex items-center gap-2 flex-1 min-w-0",children:[n&&e.jsx("div",{className:`p-1.5 rounded-lg ${r.accent} text-white shadow-sm flex-shrink-0`,children:n}),e.jsx("h3",{className:`font-semibold text-sm ${r.headerText} tracking-wide truncate`,children:a})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[(d||s)&&e.jsxs("div",{className:"flex gap-0.5 opacity-0 group-hover/column:opacity-100 transition-opacity",children:[d&&e.jsx("button",{onClick:d,className:"p-1 rounded hover:bg-white/50 text-gray-500 hover:text-blue-600 transition-colors",title:"Edit jabatan",children:e.jsx(v,{className:"w-3.5 h-3.5"})}),s&&e.jsx("button",{onClick:s,className:"p-1 rounded hover:bg-white/50 text-gray-500 hover:text-red-600 transition-colors",title:"Hapus jabatan",children:e.jsx(u,{className:"w-3.5 h-3.5"})})]}),e.jsx("span",{className:"inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs font-bold text-gray-700 shadow-sm border border-white/50 ml-1",children:t})]})]}),e.jsxs("div",{ref:g,className:`
          flex-1 p-3 
          ${o?"flex flex-wrap gap-3 overflow-x-auto items-start":"space-y-2 overflow-y-auto"} 
          transition-all duration-300
          ${l?"ring-2 ring-inset ring-blue-400/30":""}
        `,children:[i,t===0&&!l&&e.jsx("div",{className:`
            ${o?"w-full h-16":"h-14"} 
            border-2 border-dashed border-gray-300/60 
            rounded-xl 
            flex items-center justify-center 
            text-gray-400 text-xs text-center 
            p-2
            bg-white/30
          `,children:"Tarik santri ke sini"}),l&&t===0&&e.jsx("div",{className:`
            ${o?"w-full h-16":"h-14"} 
            border-2 border-dashed border-blue-400 
            rounded-xl 
            flex items-center justify-center 
            text-blue-500 text-sm font-medium
            bg-blue-50/50
            animate-pulse
          `,children:"Lepaskan di sini"})]}),b&&c&&e.jsx("div",{className:`px-3 py-2 border-t ${r.border} bg-white/50`,children:e.jsxs("button",{onClick:c,className:`
              w-full flex items-center justify-center gap-2
              py-1.5 px-3 rounded-lg
              ${r.addBtn}
              text-xs font-medium
              transition-all duration-200
              hover:shadow-sm
            `,children:[e.jsx(y,{className:"w-4 h-4"}),"Tambah"]})})]})}function D({id:m,proker:a,onEdit:i,onDelete:n,onView:t}){const{attributes:x,listeners:o,setNodeRef:c,transform:d,isDragging:s}=f({id:m,data:a}),b={transform:j.Translate.toString(d),opacity:s?.6:1,zIndex:s?1e3:1},g=a.pj&&a.pj.nama_lengkap_santri;return e.jsx("div",{ref:c,style:b,...x,...o,className:`
        bg-white rounded-xl border border-gray-100 p-4 mb-3
        cursor-grab active:cursor-grabbing group relative
        transition-all duration-200
        hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5
        ${s?"shadow-2xl ring-2 ring-blue-400 rotate-2":"shadow-sm"}
      `,children:e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsxs("div",{className:"flex justify-between items-start gap-2",children:[e.jsx("h4",{className:"text-sm font-bold text-gray-800 leading-tight flex-1",children:a.nama_proker}),e.jsxs("div",{className:"flex gap-1 opacity-0 group-hover:opacity-100 transition-all",onPointerDown:l=>l.stopPropagation(),children:[e.jsx("button",{onClick:()=>t==null?void 0:t(a),className:"p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors",children:e.jsx(w,{className:"w-3.5 h-3.5"})}),e.jsx("button",{onClick:()=>i==null?void 0:i(a),className:"p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",children:e.jsx(N,{className:"w-3.5 h-3.5"})}),e.jsx("button",{onClick:()=>n==null?void 0:n(a.id_proker),className:"p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",children:e.jsx(u,{className:"w-3.5 h-3.5"})})]})]}),a.divisi_nama&&e.jsx("div",{className:"flex items-center gap-1.5",children:e.jsx("span",{className:"px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider",children:a.divisi_nama})}),e.jsx("div",{className:"flex flex-wrap items-center gap-4 text-[11px] text-gray-500",children:e.jsxs("div",{className:"flex items-center gap-1.5 font-medium",children:[e.jsx(_,{className:"w-3.5 h-3.5 text-gray-400"}),e.jsx("span",{children:a.tgl_pelaksanaan?new Date(a.tgl_pelaksanaan).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):a.thn_proker})]})}),e.jsx("div",{className:"flex items-center justify-between pt-3 border-t border-gray-50",children:e.jsx("div",{className:"flex items-center gap-2",children:g?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"relative",children:[e.jsx("img",{src:C(a.pj.foto_santri,`https://ui-avatars.com/api/?name=${encodeURIComponent(a.pj.nama_lengkap_santri)}&background=random&bold=true`),alt:a.pj.nama_lengkap_santri,className:"w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-sm"}),a.pj_count&&a.pj_count>1&&e.jsxs("div",{className:"absolute -top-1 -right-1.5 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full",children:["+",a.pj_count-1]})]}),e.jsx("span",{className:"text-[11px] font-medium text-gray-600 truncate max-w-[100px]",children:a.pj.nama_lengkap_santri})]}):e.jsxs("div",{className:"flex items-center gap-1.5 text-gray-400 italic text-[10px]",children:[e.jsx($,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Belum ada PJ"})]})})})]})})}export{S as D,D as a};
