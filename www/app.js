'use strict';
const CATS=['food','transport','hotel','fun','motorbike','hygiene','massage','care','other'];
const ICON={food:'🍔',transport:'🚌',hotel:'🏨',fun:'🎉',motorbike:'🏍️',hygiene:'🧼',massage:'💆',care:'🩹',other:'📦'};
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const fmt=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const addDays=(s,k)=>{const d=parse(s);d.setDate(d.getDate()+k);return fmt(d)};
const monday=s=>addDays(s,-((parse(s).getDay()+6)%7));
const today=()=>fmt(new Date());
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const n=x=>(Math.round(x*100)/100).toLocaleString(undefined,{maximumFractionDigits:2});
const ls={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let D=ls.get('tet.data',[]),CUR=ls.get('tet.cur','');
const persist=()=>ls.set('tet.data',D);
const m=x=>n(x)+(CUR?' '+CUR:'');
const S={tab:'add',date:today(),cat:'food',amt:'',note:'',edit:null,tm:'w',yr:new Date().getFullYear(),ym:null};
const reset=()=>{S.edit=null;S.amt='';S.note=''};

function vAdd(){
 const day=D.filter(e=>e.date===S.date),tot=day.reduce((a,e)=>a+e.amt,0),sug=[];
 for(const e of D.slice().sort((a,b)=>b.ts-a.ts)){if(e.cat===S.cat&&e.note&&!sug.includes(e.note)){sug.push(e.note);if(sug.length==5)break}}
 const lbl=parse(S.date).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'})+(S.date==today()?' (today)':'');
 return `<div class="row dn"><button data-a="d" data-n="-1">‹</button><div class="dl" data-a="now">${lbl}</div><button data-a="d" data-n="1">›</button></div>
<div class="cats">${CATS.map(c=>`<button class="${c==S.cat?'on':''}" data-a="c" data-c="${c}"><i>${ICON[c]}</i>${c}</button>`).join('')}</div>
<div class="card"><div class="row amt"><button data-a="a" data-n="-50">−</button><input id="amt" type="number" inputmode="decimal" min="0" step="any" placeholder="Amount" value="${esc(S.amt)}"><button data-a="a" data-n="50">+</button></div>
<input id="note" type="text" placeholder="Comment" value="${esc(S.note)}">
<div class="chips">${sug.map(s=>`<button data-a="s" data-s="${esc(s)}">${esc(s)}</button>`).join('')}</div>
<button class="pri" data-a="save">${S.edit?'Save changes':'Add expense'}</button>
${S.edit?'<div class="row" style="margin-top:8px"><button class="dg" data-a="del">Delete</button><button data-a="cancel">Cancel</button></div>':''}</div>
<h3>Spent this day: ${m(tot)}</h3>
${day.map(e=>`<div class="item" data-a="ed" data-id="${e.id}"><b>${ICON[e.cat]||''} ${e.cat}</b><span>${esc(e.note)}</span><em>${n(e.amt)}</em></div>`).join('')||'<p class="mu">Nothing recorded for this day. Pick a category and enter an amount.</p>'}`;
}

function vTot(){
 const wk=S.tm=='w',g={};
 for(const e of D){const k=wk?monday(e.date):e.date.slice(0,7);const o=g[k]=g[k]||{t:0,c:{}};o.t+=e.amt;o.c[e.cat]=(o.c[e.cat]||0)+e.amt}
 const f=d=>d.toLocaleDateString(undefined,{day:'numeric',month:'short'});
 const lab=k=>wk?f(parse(k))+' to '+f(parse(addDays(k,6)))+' '+parse(addDays(k,6)).getFullYear():new Date(+k.slice(0,4),+k.slice(5)-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
 const keys=Object.keys(g).sort().reverse();
 return `<div class="seg"><button class="${wk?'on':''}" data-a="tm" data-v="w">Weeks</button><button class="${wk?'':'on'}" data-a="tm" data-v="m">Months</button></div>`+
 (keys.map(k=>`<div class="card"${wk?` data-a="go" data-d="${k}"`:''}><div class="row"><b>${lab(k)}</b><b>${m(g[k].t)}${wk?' ›':''}</b></div><div class="mu">${CATS.filter(c=>g[k].c[c]).map(c=>ICON[c]+' '+c+' '+n(g[k].c[c])).join(', ')}</div></div>`).join('')||'<p class="mu">No expenses yet.</p>');
}

function vYear(){
 const tot={};for(const e of D)tot[e.date]=(tot[e.date]||0)+e.amt;
 const mname=i=>new Date(2000,i,1).toLocaleDateString(undefined,{month:'long'});
 const mtot=i=>Object.keys(tot).filter(k=>k.startsWith(S.yr+'-'+pad(i+1))).reduce((a,k)=>a+tot[k],0);
 const grid=(i,big)=>{const off=(new Date(S.yr,i,1).getDay()+6)%7,days=new Date(S.yr,i+1,0).getDate();
  let h='<div class="g'+(big?' big':'')+'">'+[...'MTWTFSS'].map(x=>'<i>'+x+'</i>').join('')+'<span></span>'.repeat(off);
  for(let d=1;d<=days;d++){const k=S.yr+'-'+pad(i+1)+'-'+pad(d),t=tot[k];
   h+=`<button class="${t?'has':''}${k==today()?' td':''}" data-a="go" data-d="${k}">${d}${big&&t?'<small>'+n(t)+'</small>':''}</button>`}
  return h+'</div>'};
 if(S.ym!=null){const i=S.ym;
  return `<div class="row dn"><button data-a="mn" data-n="-1">‹</button><div class="dl">${mname(i)} ${S.yr}<br><span class="mu">${m(mtot(i))}</span></div><button data-a="mn" data-n="1">›</button></div><div class="card">${grid(i,1)}</div><button data-a="ym" data-m="">Back to whole year</button>`}
 const yt=D.filter(e=>e.date.startsWith(S.yr+'-')).reduce((a,e)=>a+e.amt,0);
 return `<div class="row dn"><button data-a="yy" data-n="-1">‹</button><div class="dl">${S.yr}<br><span class="mu">${m(yt)}</span></div><button data-a="yy" data-n="1">›</button></div>
<div class="ys">${[...Array(12).keys()].map(i=>`<div class="card"><button class="mt" data-a="ym" data-m="${i}">${mname(i)}${mtot(i)?' '+n(mtot(i)):''}</button>${grid(i,0)}</div>`).join('')}</div>`;
}

function vData(){
 return `<div class="card"><label for="cur">Currency label, shown after totals</label><input id="cur" value="${esc(CUR)}" placeholder="For example THB"></div>
<div class="card"><button class="pri" style="margin:0" data-a="exj">Export backup file</button>
<button class="pri" data-a="exc">Export CSV for Excel</button>
<button class="pri" data-a="imp">Import backup or CSV file</button><input id="imp" type="file" hidden>
<p class="mu">${D.length} expenses are stored on this phone. Importing adds expenses that are not already here.</p></div>`;
}

async function out(name,text,mime){
 const P=window.Capacitor&&window.Capacitor.Plugins;
 try{if(P&&P.Filesystem&&P.Share){const r=await P.Filesystem.writeFile({path:name,data:text,directory:'CACHE',encoding:'utf8'});await P.Share.share({title:name,url:r.uri,dialogTitle:'Save or send '+name});return}}
 catch(e){if(/cancel/i.test((e&&e.message)||''))return}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove();
}

function render(){
 $('#v').innerHTML={add:vAdd,tot:vTot,year:vYear,data:vData}[S.tab]();
 $('#nav').innerHTML=[['add','Add'],['tot','Totals'],['year','Calendar'],['data','Data']].map(([k,l])=>`<button class="${S.tab==k?'on':''}" data-a="t" data-t="${k}">${l}</button>`).join('');
}

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,d=t.dataset;
 if(a=='a'){const v=Math.max(0,Math.round(((parseFloat($('#amt').value)||0)+Number(d.n))*100)/100);$('#amt').value=S.amt=String(v);return}
 if(a=='s'){S.note=d.s;$('#note').value=d.s;return}
 if(a=='exj')return out('travel-expenses-'+today()+'.json',JSON.stringify({app:'travel-expense-tracker',v:1,cur:CUR,data:D}),'application/json');
 if(a=='exc'){const rows=D.slice().sort((x,y)=>x.date<y.date?-1:x.date>y.date?1:x.ts-y.ts).map(x=>[x.date,x.cat,x.amt,'"'+x.note.replace(/"/g,'""')+'"'].join(','));
  return out('travel-expenses-'+today()+'.csv','\ufeffdate,category,amount,comment\n'+rows.join('\n'),'text/csv')}
 if(a=='imp')return $('#imp').click();
 if(a=='t'){S.tab=d.t;S.ym=null;S.yr=parse(S.date).getFullYear()}
 else if(a=='d'){if(S.edit)reset();S.date=addDays(S.date,Number(d.n))}
 else if(a=='now'){if(S.edit)reset();S.date=today()}
 else if(a=='c')S.cat=d.c;
 else if(a=='save'){const v=parseFloat(S.amt);if(!(v>0))return alert('Enter an amount first');
  const r={date:S.date,cat:S.cat,amt:v,note:S.note.trim(),ts:Date.now()},x=S.edit&&D.find(z=>z.id==S.edit);
  if(x)Object.assign(x,r);else D.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),...r});
  persist();reset()}
 else if(a=='del'){if(!confirm('Delete this expense?'))return;D=D.filter(x=>x.id!=S.edit);persist();reset()}
 else if(a=='cancel')reset();
 else if(a=='ed'){const x=D.find(z=>z.id==d.id);if(!x)return;Object.assign(S,{edit:x.id,date:x.date,cat:x.cat,amt:String(x.amt),note:x.note});scrollTo(0,0)}
 else if(a=='tm')S.tm=d.v;
 else if(a=='yy')S.yr+=Number(d.n);
 else if(a=='mn'){S.ym+=Number(d.n);if(S.ym<0){S.ym=11;S.yr--}if(S.ym>11){S.ym=0;S.yr++}}
 else if(a=='ym')S.ym=d.m===''?null:Number(d.m);
 else if(a=='go'){S.date=d.d;S.tab='add';reset()}
 render();
});

document.addEventListener('input',e=>{const i=e.target.id;
 if(i=='amt')S.amt=e.target.value;else if(i=='note')S.note=e.target.value;
 else if(i=='cur'){CUR=e.target.value.trim();ls.set('tet.cur',CUR)}});

function parseCsv(t,dl){
 const R=[];let r=[],f='',q=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
  else if(c=='"')q=true;
  else if(c==dl){r.push(f);f=''}
  else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);R.push(r);r=[];f=''}
  else f+=c}
 if(f||r.length){r.push(f);R.push(r)}
 return R.filter(r=>r.some(x=>x.trim()));
}

function impJson(j){
 const a=Array.isArray(j)?j:j.data,ids=new Set(D.map(x=>x.id));let c=0;
 for(const x of a){if(!x||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!(Number(x.amt)>0)||!x.id||ids.has(x.id))continue;
  D.push({id:String(x.id),date:x.date,cat:CATS.includes(x.cat)?x.cat:'other',amt:Number(x.amt),note:String(x.note||''),ts:Number(x.ts)||0});ids.add(x.id);c++}
 if(!CUR&&j.cur){CUR=String(j.cur);ls.set('tet.cur',CUR)}
 return c+' expenses imported from the backup';
}

function impCsv(t){
 const first=t.split(/\r?\n/)[0],dl=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
 const R=parseCsv(t,dl);if(!R.length)return 'No rows found in that file';
 const h=R[0].map(x=>x.trim().toLowerCase()),hasH=h.some(x=>/date/.test(x)),ix=k=>hasH?h.findIndex(x=>k.test(x)):-1;
 const ci=[ix(/date/),ix(/cat/),ix(/amount|amt|cost|price|total/),ix(/comment|note|desc/)].map((v,i)=>v<0?i:v);
 if(hasH)R.shift();
 const key=(d,c,a,x)=>[d,c,a,x].join('|'),have={};
 for(const x of D){const k=key(x.date,x.cat,x.amt,x.note);have[k]=(have[k]||0)+1}
 let add=0,dup=0,bad=0;const base=Date.now();
 for(const r of R){
  const dm=(r[ci[0]]||'').trim().match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/),raw=(r[ci[2]]||'').replace(/\s/g,''),
   amt=Number(dl==';'?raw.replace(',','.'):raw.replace(/,/g,''));
  if(!dm||!(amt>0)||new Date(+dm[1],+dm[2]-1,+dm[3]).getMonth()!=+dm[2]-1){bad++;continue}
  const date=dm[1]+'-'+pad(+dm[2])+'-'+pad(+dm[3]),cl=(r[ci[1]]||'').trim().toLowerCase(),cat=CATS.includes(cl)?cl:'other',note=(r[ci[3]]||'').trim(),k=key(date,cat,amt,note);
  if(have[k]>0){have[k]--;dup++;continue}
  D.push({id:(base+add).toString(36)+Math.random().toString(36).slice(2,6),date,cat,amt,note,ts:parse(date).getTime()+add});add++}
 return add+' imported, '+dup+' already here, '+bad+' skipped (bad date or amount)';
}

document.addEventListener('change',e=>{
 if(e.target.id!='imp'||!e.target.files[0])return;
 const r=new FileReader();
 r.onload=()=>{try{const t=String(r.result).replace(/^\ufeff/,''),res=/^\s*[\[{]/.test(t)?impJson(JSON.parse(t)):impCsv(t);
  persist();render();alert(res)}catch(err){alert('That file could not be read as a backup or CSV file')}};
 r.readAsText(e.target.files[0]);e.target.value='';
});

render();
