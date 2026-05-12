const d=new Map,c={"Al-Fatihah":1,"Al-Baqarah":2,"Ali Imran":3,"An-Nisa":4,"Al-Maidah":5,"Al-Anam":6,"Al-A'raf":7,"Al-Anfal":8,"At-Taubah":9,Yunus:10,Hud:11,Yusuf:12,"Ar-Ra'd":13,Ibrahim:14,"Al-Hijr":15,"An-Nahl":16,"Al-Isra":17,"Al-Kahf":18,Maryam:19,"Ta Ha":20,"Al-Anbiya":21,"Al-Hajj":22,"Al-Mu'minun":23,"An-Nur":24,"Al-Furqan":25,"Asy-Syuara":26,"An-Naml":27,"Al-Qasas":28,"Al-Ankabut":29,"Ar-Rum":30,Luqman:31,"As-Sajdah":32,"Al-Ahzab":33,"Saba'":34,Fatir:35,"Ya Sin":36,"As-Saffat":37,Sad:38,"Az-Zumar":39,Ghafir:40,Fussilat:41,"Asy-Syura":42,"Az-Zukhruf":43,"Ad-Dukhan":44,"Al-Jasiyah":45,"Al-Ahqaf":46,Muhammad:47,"Al-Fath":48,"Al-Hujurat":49,Qaf:50,"Az-Zariyat":51,"At-Tur":52,"An-Najm":53,"Al-Qamar":54,"Ar-Rahman":55,"Al-Waqi'ah":56,"Al-Hadid":57,"Al-Mujadilah":58,"Al-Hasyr":59,"Al-Mumtahanah":60,"As-Saff":61,"Al-Jumu'ah":62,"Al-Munafiqun":63,"At-Tagabun":64,"At-Talaq":65,"At-Tahrim":66,"Al-Mulk":67,"Al-Qalam":68,"Al-Haqqah":69,"Al-Ma'arij":70,Nuh:71,"Al-Jinn":72,"Al-Muzzammil":73,"Al-Muddassir":74,"Al-Qiyamah":75,"Al-Insan":76,"Al-Mursalat":77,"An-Naba'":78,"An-Nazi'at":79,Abasa:80,"At-Takwir":81,"Al-Infitar":82,"Al-Muthaffifiyn":83,"Al-Insyiqaq":84,"Al-Buruj":85,"At-Tariq":86,"Al-A'la":87,"Al-Gasyiyah":88,"Al-Fajr":89,"Al-Balad":90,"Asy-Syams":91,"Al-Lail":92,"Ad-Duha":93,"Al-Insyirah":94,"At-Tin":95,"Al-Alaq":96,"Al-Qadr":97,"Al-Bayyinah":98,"Az-Zalzalah":99,"Al-Adiyat":100,"Al-Qariah":101,"At-Takasur":102,"Al-Asr":103,"Al-Humazah":104,"Al-Fil":105,Quraisy:106,"Al-Ma'un":107,"Al-Kausar":108,"Al-Kafirun":109,"An-Nasr":110,"Al-Lahab":111,"Al-Ikhlas":112,"Al-Falaq":113,"An-Nas":114};function m(n){return c[n]||0}function f(n){const t=n.trim();if(t.includes("-")){const[e,l]=t.split("-").map(r=>parseInt(r.trim()));return{start:e||1,end:l||e||1}}const a=parseInt(t)||1;return{start:a,end:a}}function g(n){const t=["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];return n.toString().split("").map(a=>t[parseInt(a)]).join("")}function w(n){if(!n)return"";const t={h:"ham_wasl",l:"lam",n:"idgham_no_ghunnah",p:"madda_permissible",s:"slnt",q:"qlq",i:"ikhfa",f:"ikhfa",g:"ghunnah",b:"iqlab",m:"idgham_ghunnah",v:"madda_permissible",a:"madda_obligatory",o:"madda_necessary",u:"idgham_wo_ghunnah"};let a=n;return a=a.replace(/\[([a-z0-9]+)(?::\d+)?\[([^\]]+)\]+\]?/g,(e,l,r)=>`<span class="${t[l]||"tajweed-mark"}">${r}</span>`),a=a.replace(/\[[a-z0-9]+(?::\d+)?\[/gi,""),a=a.replace(/[\[\]]/g,""),a=a.replace(/[a-z0-9]+:/gi,""),a}async function A(n){const t=`surah-${n}`;if(d.has(t))return d.get(t);try{const a=await fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-uthmani,id.indonesian`);if(!a.ok)throw new Error("Failed to fetch Quran data");const e=await a.json();if(e.code!==200||!e.data||e.data.length<2)throw new Error("Invalid response from Quran API");const l=e.data[0],r=e.data[1],s=l.ayahs.map((o,i)=>{var h;return{number:o.number,numberInSurah:o.numberInSurah,text:o.text,translation:((h=r.ayahs[i])==null?void 0:h.text)||"",juz:o.juz,page:o.page}});return d.set(t,s),s}catch(a){throw console.error("Error fetching Quran:",a),a}}async function p(n){const t=`surah-tajweed-${n}`;if(d.has(t))return d.get(t);try{const a=await fetch(`https://api.alquran.cloud/v1/surah/${n}/editions/quran-tajweed,id.indonesian`);if(!a.ok)throw new Error("Failed to fetch Quran data");const e=await a.json();if(e.code!==200||!e.data||e.data.length<2)throw new Error("Invalid response from Quran API");const l=e.data[0],r=e.data[1],s=l.ayahs.map((o,i)=>{var h;return{number:o.number,numberInSurah:o.numberInSurah,text:o.text,translation:((h=r.ayahs[i])==null?void 0:h.text)||"",juz:o.juz,page:o.page}});return d.set(t,s),s}catch(a){throw console.error("Error fetching Quran Tajweed:",a),a}}const y=`
  /* Base tajweed styling */
  .tajweed [class^="h"], .tajweed [class*=" h"] { 
    color: #9CA3AF; 
  }
  
  /* Hamzah Wasl - Silent */
  .tajweed .ham_wasl { 
    color: #9CA3AF;
    opacity: 0.6;
  }
  
  /* Silent letters */
  .tajweed .slnt { 
    color: #9CA3AF; 
    letter-spacing: -10px;
    opacity: 0.4;
  }
  
  /* Mad/Panjang - Blue with underline wave */
  .tajweed .madda_normal { 
    color: #3B82F6;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgba(59, 130, 246, 0.5);
    text-underline-offset: 4px;
  }
  .tajweed .madda_permissible { 
    color: #2563EB;
    text-decoration: underline;
    text-decoration-style: wavy;
    text-decoration-color: rgba(37, 99, 235, 0.6);
    text-underline-offset: 4px;
  }
  .tajweed .madda_necessary { 
    color: #1D4ED8;
    text-decoration: underline double;
    text-decoration-color: rgba(29, 78, 216, 0.7);
    text-underline-offset: 4px;
    font-weight: 600;
  }
  .tajweed .madda_obligatory { 
    color: #1E40AF;
    text-decoration: underline double;
    text-decoration-color: rgba(30, 64, 175, 0.8);
    text-underline-offset: 4px;
    font-weight: 700;
  }
  
  /* Qalqalah - Red bold with dot */
  .tajweed .qlq { 
    color: #EF4444;
    font-weight: 700;
    text-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
  }
  
  /* Ikhfa Marker - Green */
  .tajweed .imark, .tajweed .imark_ana, .tajweed .ikhfa { 
    color: #22C55E;
    text-decoration: underline dotted;
    text-decoration-color: rgba(34, 197, 94, 0.6);
    text-underline-offset: 4px;
  }
  
  /* Idgham - Green darker */
  .tajweed .idghaam_shafawi, .tajweed .idgham_shafawi, .tajweed .idgham_ghunnah { 
    color: #16A34A;
    text-decoration: underline;
    text-decoration-color: rgba(22, 163, 74, 0.5);
    text-underline-offset: 4px;
  }
  
  /* Idgham tanpa ghunnah */
  .tajweed .idgham_no_ghunnah, .tajweed .idgham_wo_ghunnah {
    color: #6B7280;
    text-decoration: underline;
    text-decoration-color: rgba(107, 114, 128, 0.3);
    text-underline-offset: 4px;
  }
  
  /* Ghunnah - Orange with glow */
  .tajweed .ghunnah { 
    color: #FB923C;
    font-weight: 600;
    text-shadow: 0 0 14px rgba(251, 146, 60, 0.5);
  }
  
  /* Iqlab - Cyan glow */
  .tajweed .iqlab { 
    color: #06B6D4;
    font-weight: 600;
    text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
  }
`;async function b(n,t,a,e=2,l=2){const r=await A(n),s=r.length,o=Math.max(1,t-e),i=Math.min(s,a+l);return{ayatList:r.filter(u=>u.numberInSurah>=o&&u.numberInSurah<=i),totalAyat:s,displayStart:o,displayEnd:i,selectedStart:t,selectedEnd:a}}async function j(){const n="surah-list",t=localStorage.getItem(n);if(t)try{return JSON.parse(t)}catch{}try{const e=await(await fetch("https://api.alquran.cloud/v1/surah")).json();if(e.code===200&&e.data){const l=e.data.map(r=>({number:r.number,name:r.name,englishName:r.englishName,englishNameTranslation:r.englishNameTranslation,numberOfAyahs:r.numberOfAyahs,revelationType:r.revelationType}));return localStorage.setItem(n,JSON.stringify(l)),l}throw new Error("Invalid response")}catch(a){throw console.error("Error fetching surah list:",a),a}}export{y as T,A as a,j as b,f as c,m as d,p as f,b as g,w as p,g as t};
