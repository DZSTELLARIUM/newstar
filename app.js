// app.js (module)
const CERT_AREA = document.getElementById('certificate-area');

// استيراد بيانات النجوم من stars.json
async function fetchStars(){
  try{
    const res = await fetch('stars.json');
    return await res.json();
  }catch(e){
    console.error('failed to load stars.json', e);
    return [];
  }
}

// يبني رابط Stellarium Web مع إحداثيات RA (hours) و Dec (deg)
function stellariumUrl(star){
  // عدة مثيلات تقبل /sky?ra=...&dec=...&z=...
  const ra = Number(star.ra_hours || 0).toFixed(6);
  const dec = Number(star.dec_deg || 0).toFixed(6);
  return `https://stellarium-web.org/sky?ra=${encodeURIComponent(ra)}&dec=${encodeURIComponent(dec)}&z=4&target=${encodeURIComponent(star.name)}`;
}

// بناء بطاقة الشهادة HTML
function createCard(star){
  const div = document.createElement('article');
  div.className = 'card';
  div.innerHTML = `
    <div class="left">
      <div class="badge">★</div>
      <div class="qr">رقم: ${star.registry}</div>
    </div>
    <div class="right">
      <h3 class="title">${star.name}</h3>
      <div class="registry">رقم السجل: ${star.registry} • تم التسجيل: ${star.date}</div>
      <div class="rows">
        <div class="row"><div class="label">المجموعة النجمية</div><div class="value">${star.constellation}</div></div>
        <div class="row"><div class="label">القدر الظاهري</div><div class="value">${star.mag ?? '—'}</div></div>
        <div class="row"><div class="label">الموقع (RA / Dec)</div><div class="value">${star.ra_hours}h / ${star.dec_deg}°</div></div>
      </div>
      <p style="color:var(--muted);margin:0 0 12px">${star.desc ?? ''}</p>
      <div class="actions">
        <button class="btn view">مشاهدة في Stellarium</button>
        <button class="btn secondary download">تحميل الشهادة</button>
      </div>
    </div>
  `;

  // فتح Stellarium Web في نافذة جديدة
  div.querySelector('.view').addEventListener('click', ()=>{
    const url = stellariumUrl(star);
    window.open(url, '_blank', 'noopener');
  });

  // تحميل شهادة كصورة بسيطة (HTML -> canvas via SVG trick) — يعمل بدون مكتبات
  div.querySelector('.download').addEventListener('click', async ()=>{
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
        <defs><style><![CDATA[
          @font-face{font-family:sys;src:local('Segoe UI'), local('Noto Naskh Arabic'), local('Arial');}
          .t{font-family:sys;fill:#e9f0ff}
          .gold{fill:${'#d4af37'}}
        ]]></style></defs>
        <rect width="100%" height="100%" fill="#071223" />
        <text x="600" y="120" text-anchor="middle" font-size="46" class="t gold">شهادة تسجيل نجمة</text>
        <text x="600" y="190" text-anchor="middle" font-size="28" class="t">${star.name}</text>
        <text x="200" y="300" font-size="24" class="t">رقم السجل: <tspan class="gold">${star.registry}</tspan></text>
        <text x="200" y="350" font-size="20" class="t">المجموعة: <tspan class="gold">${star.constellation}</tspan></text>
        <text x="200" y="400" font-size="20" class="t">الإحداثيات: <tspan class="gold">${star.ra_hours}h / ${star.dec_deg}°</tspan></text>
        <text x="200" y="460" font-size="18" class="t">${star.desc ?? ''}</text>
        <text x="600" y="740" text-anchor="middle" font-size="14" class="t">${new Date().toLocaleDateString('ar-EG')}</text>
      </svg>`;
    const blob = new Blob([svg], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${star.registry}_certificate.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  return div;
}

(async ()=>{
  const stars = await fetchStars();
  if(!stars || stars.length===0){
    CERT_AREA.innerHTML = `<div class="card"><div class="right"><p style="color:var(--muted)">لا توجد بيانات. تأكد من وجود ملف stars.json.</p></div></div>`;
    return;
  }
  stars.forEach(s=>{
    CERT_AREA.appendChild(createCard(s));
  });
})();

