// app.js (module)
const listEl = document.getElementById('stars-list');
const tpl = document.getElementById('card-template');
const search = document.getElementById('search');

let STARS = [];

// utility: convert RA in hours (e.g., "14.660139") and Dec degrees into Stellarium web-safe params
function toStellariumParams(star){
  // Stellarium web often supports search by name; fallback to coordinates via query string.
  // We'll encode RA (hours) and Dec (deg) into a query string for maximal compatibility.
  const ra = Number(star.ra_hours); // hours (0-24)
  const dec = Number(star.dec_deg); // degrees
  // build a readable target name
  const name = encodeURIComponent(star.name);
  // some instances: use `?target=` or `?object=` — we'll use search path
  const urlByName = `https://stellarium-web.org/search?q=${name}`;
  // also prepare coords URL (some forks accept sky?ra=...&dec=...)
  const coordsUrl = `https://stellarium-web.org/sky?ra=${ra.toFixed(6)}&dec=${dec.toFixed(6)}&z=4`;
  return { urlByName, coordsUrl };
}

function renderList(data){
  listEl.innerHTML = '';
  data.forEach(s=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.thumb').style.backgroundImage = `url('${s.thumb||'https://via.placeholder.com/160x160?text=*'}')`;
    node.querySelector('.star-name').textContent = s.name;
    node.querySelector('.mag').textContent = s.mag ?? '—';
    node.querySelector('.dist').textContent = s.distance ? s.distance+' سم' : '—';
    node.querySelector('.star-desc').textContent = s.desc || '';
    const viewBtn = node.querySelector('.view-btn');
    viewBtn.addEventListener('click', ()=>{
      const p = toStellariumParams(s);
      // try to open coords URL first; if user wants exact name-based search, they'll still get there
      window.open(p.coordsUrl, '_blank', 'noopener');
    });
    const details = node.querySelector('.details-btn');
    details.addEventListener('click', ()=>{
      alert(`${s.name}\nRA(h): ${s.ra_hours}\nDec(°): ${s.dec_deg}\nالقدر: ${s.mag || '—'}`);
    });
    listEl.appendChild(node);
  });
}

// load sample stars
async function loadStars(){
  try{
    const res = await fetch('stars.json');
    STARS = await res.json();
    renderList(STARS);
  }catch(e){
    console.error('Failed to load stars', e);
    listEl.innerHTML = '<p style="color:var(--muted)">فشل تحميل بيانات النجوم.</p>';
  }
}

// search filter (simple)
search.addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  if(!q){ renderList(STARS); return; }
  const filtered = STARS.filter(s => (s.name + ' ' + (s.desc||'')).toLowerCase().includes(q));
  renderList(filtered);
});

loadStars();
