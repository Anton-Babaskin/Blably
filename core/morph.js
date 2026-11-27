/* Core: Turkish morphology, suffix builder and question generator. Pure functions, no page access. */
import { lc, pick, shuffle, random } from './text.js';
/* ================= morphology engine ================= */
const V='aeıioöuü', FRONT='eiöü', HARD='fstkçşhp';
const V4={a:'ı',ı:'ı',o:'u',u:'u',e:'i',i:'i',ö:'ü',ü:'ü'};
function lastV(s){s=lc(s);for(let i=s.length-1;i>=0;i--)if(V.includes(s[i]))return s[i];return 'e'}
const v2=s=>FRONT.includes(lastV(s))?'e':'a';
const v4=s=>V4[lastV(s)];
const endV=s=>V.includes(lc(s).slice(-1));
const endH=s=>HARD.includes(lc(s).slice(-1));
const lastC=s=>lc(s).slice(-1);
const why2=s=>`Последняя гласная в «${s}» — <b>${lastV(s)}</b>. Она в ${FRONT.includes(lastV(s))?'коробке «e i ö ü», значит <b>e</b>':'коробке «a ı o u», значит <b>a</b>'}`;
const why4=s=>`Последняя гласная в «${s}» — <b>${lastV(s)}</b>, её пара → <b>${v4(s)}</b>`;
const whyH=s=>endH(s)?`«${s}» кончается на глухую <b>${lastC(s)}</b> (fıstıkçı şahap), поэтому <b>d → t</b>`:`«${s}» кончается на <b>${lastC(s)}</b> — не глухая, остаётся <b>d</b>`;
const P=['ben','sen','o','biz','siz','onlar'];
const PRU=['я','ты','он / она','мы','вы','они'];
const PGEN=['benim','senin','onun','bizim','sizin'];

function nounForm(n,k,p){
  const w=n.w, ap=n.p?"'":"", why=[];
  const st=(n.s&&!n.p)?n.s:w;
  const softWhy=`Длинное слово на <b>${lastC(w)}</b> перед гласной смягчается: ${w} → <b>${st}</b>`;
  let root=w, suf='';
  if(n.p) why.push('Это имя собственное, поэтому хвостик идёт через апостроф');
  if(k==='plural'){suf='l'+v2(w)+'r'; why.push(why2(w));}
  else if(k==='loc'||k==='abl'){const d=endH(w)?'t':'d'; suf=ap+d+v2(w)+(k==='abl'?'n':''); why.push(whyH(w),why2(w));}
  else if(k==='dat'){
    if(endV(w)){suf=ap+'y'+v2(w); why.push('Слово кончается на гласную — вставляем <b>y</b>',why2(w));}
    else{root=st; suf=ap+v2(w); if(st!==w)why.push(softWhy); why.push(why2(w));}
  }
  else if(k==='acc'){
    if(endV(w)){suf=ap+'y'+v4(w); why.push('Слово кончается на гласную — вставляем <b>y</b>',why4(w));}
    else{root=st; suf=ap+v4(w); if(st!==w)why.push(softWhy); why.push(why4(w));}
  }
  else if(k==='poss'){
    const x=v4(w);
    if(endV(w)){
      suf=['m','n','s'+x,'m'+x+'z','n'+x+'z'][p];
      why.push('Слово кончается на гласную — соединительная гласная не нужна');
      if(p===2)why.push('Для «его / её» после гласной вставляем <b>s</b>: araba → araba<b>sı</b>');
    }else{root=st; suf=[x+'m',x+'n',x,x+'m'+x+'z',x+'n'+x+'z'][p]; if(st!==w)why.push(softWhy);}
    why.push(why4(w));
  }
  return {parts:[root,suf],why,from:root.length-1};
}
const vb=v=>v.sf||v.s;
function pres(v,p,neg){
  const s=v.s, why=[]; let root, mid;
  if(neg){root=s; mid='m'+v4(s)+'yor'; why.push('«Не»: корень + <b>m</b> + гласная по парам + <b>yor</b>',why4(s));}
  else if(v.sp){root=v.sp==='de'?'d':'y'; mid='iyor'; why.push(`Это исключение: ${v.sp==='de'?'demek → <b>diyor</b>':'yemek → <b>yiyor</b>'}`);}
  else if(endV(s)){
    const l=lc(s).slice(-1);
    if('ae'.includes(l)){root=s.slice(0,-1); mid=v4(root)+'yor'; why.push(`Корень кончается на <b>${l}</b> — она выпадает, на её место <b>${v4(root)}</b> (пара гласной «${lastV(root)}»)`);}
    else{root=s; mid='yor'; why.push(`Корень кончается на <b>${l}</b> — просто добавляем <b>yor</b>`);}
  }
  else{root=vb(v); mid=v4(s)+'yor'; if(v.sf)why.push(`t → d перед гласной: ${s} → <b>${v.sf}</b>`); why.push(why4(s));}
  const end=['um','sun','','uz','sunuz','lar'][p];
  why.push(`После -yor окончание всегда с <b>u</b>. Для «${P[p]}»: ${end?'<b>-'+end+'</b>':'окончания нет'}`);
  return {parts:[root,mid,end].filter(Boolean),why,from:root.length-1};
}
function past(v,p,neg){
  const s=v.s, why=[]; let mid;
  if(neg){const m='m'+v2(s); mid=m+'d'+v4(s+m); why.push('«Не»: + <b>me / ma</b>, потом <b>-di</b>',why2(s));}
  else{const d=endH(s)?'t':'d'; mid=d+v4(s); why.push(whyH(s),why4(s));}
  const full=s+mid, x=v4(full), y=v2(full);
  const end=['m','n','','k','n'+x+'z','l'+y+'r'][p];
  why.push(`Для «${P[p]}»: ${end?'<b>-'+end+'</b>':'окончания нет'}`);
  return {parts:[s,mid,end].filter(Boolean),why,from:s.length-1};
}
function fut(v,p,neg){
  const s=v.s, why=[]; let root, mid;
  if(neg){root=s; const m='m'+v2(s); mid=m+'y'+v2(s+m)+'c'+v2(s+m)+'k'; why.push('«Не»: + <b>me / ma</b>, потом <b>y</b> и <b>ecek / acak</b>',why2(s));}
  else if(v.sp){root=v.sp==='de'?'diy':'yiy'; mid='ecek'; why.push(`Это исключение: ${v.sp==='de'?'demek → <b>diyecek</b>':'yemek → <b>yiyecek</b>'}`);}
  else if(endV(s)){root=s; mid='y'+v2(s)+'c'+v2(s)+'k'; why.push('Корень на гласную — вставляем <b>y</b>',why2(s));}
  else{root=vb(v); mid=v2(s)+'c'+v2(s)+'k'; if(v.sf)why.push(`t → d перед гласной: ${s} → <b>${v.sf}</b>`); why.push(why2(s));}
  const F=root+mid, a=v2(F), i=v4(F); let end='';
  if(p===0||p===3){mid=mid.slice(0,-1)+'ğ'; end=i+(p===0?'m':'z'); why.push('Перед гласной <b>k → ğ</b>: -ecek + im = -<b>eceğim</b>');}
  else end=['','s'+i+'n','','','s'+i+'n'+i+'z','l'+a+'r'][p];
  why.push(`Для «${P[p]}»: ${end?'<b>-'+end+'</b>':'окончания нет'}`);
  return {parts:[root,mid,end].filter(Boolean),why,from:root.length-1};
}
const EXC=['al','bil','bul','dur','gel','gör','kal','ol','öl','san','ver','var','vur'];
function aor(v,p,neg){
  const s=v.s, why=[], last=s.split(' ').pop();
  const nv=[...lc(last)].filter(c=>V.includes(c)).length;
  if(neg){
    const m='m'+v2(s), z=m+'z', x=v4(z), y=v2(s);
    const mid=[m+'m',z,z,m+'y'+v4(m)+'z',z,z][p];
    const end=['','s'+x+'n','','','s'+x+'n'+x+'z','l'+y+'r'][p];
    why.push('«Не»: <b>-mez / -maz</b>, но «я» → <b>-mem</b>, «мы» → <b>-meyiz</b>',why2(s));
    return {parts:[s,mid,end].filter(Boolean),why,from:s.length-1};
  }
  let root, mid;
  if(v.sp||endV(s)){root=s; mid='r'; why.push('Корень на гласную — просто <b>-r</b>');}
  else if(nv===1&&!EXC.includes(lc(last))){root=vb(v); mid=v2(s)+'r'; why.push(`«${last}» — один слог, значит <b>-ar / -er</b>`,why2(s));}
  else{root=vb(v); mid=v4(s)+'r'; why.push(nv===1?`«${last}» — одно из 13 исключений, значит <b>-ir</b>`:'Несколько слогов, значит <b>-ir</b> по парам',why4(s));}
  if(v.sf&&root===v.sf)why.push(`t → d перед гласной: ${s} → <b>${v.sf}</b>`);
  const F=root+mid, x=v4(F), y=v2(F);
  const end=[x+'m','s'+x+'n','',x+'z','s'+x+'n'+x+'z','l'+y+'r'][p];
  why.push(`Для «${P[p]}»: ${end?'<b>-'+end+'</b>':'окончания нет'}`);
  return {parts:[root,mid,end].filter(Boolean),why,from:root.length-1};
}
function quest(v,p,tense){
  let r;
  if(tense==='past'){
    r=past(v,p,false); const f=r.parts.join(''), q=' m'+v4(f);
    return {parts:[...r.parts,q],why:['В прошедшем <b>-di</b> окончание остаётся на глаголе, а <b>mi</b> идёт отдельно',`mi подстраивается под «${f}» → <b>${q.trim()}</b>`],from:r.from};
  }
  if(tense==='pres'){
    r=pres(v,2,false);
    if(p===5)return {parts:[...r.parts,'lar',' mı'],why:['«onlar»: -lar остаётся на глаголе, потом <b>mı</b>'],from:r.from};
    const q=' mu'+['yum','sun','','yuz','sunuz'][p];
    return {parts:[...r.parts,q],why:['В <b>-iyor</b> окончание «кто» переезжает на mi: geliyor <b>musun</b>?','После -yor всегда <b>mu</b>, а перед гласной — <b>y</b>: mu<b>y</b>um'],from:r.from};
  }
  r=fut(v,2,false); const F=r.parts.join(''), i=v4(F);
  if(p===5){const l='l'+v2(F)+'r';return {parts:[...r.parts,l,' m'+v4(l)],why:['«onlar»: -ler остаётся на глаголе, потом <b>mi</b>'],from:r.from};}
  const q=' m'+i+['y'+i+'m','s'+i+'n','','y'+i+'z','s'+i+'n'+i+'z'][p];
  return {parts:[...r.parts,q],why:['В <b>-ecek</b> окончание «кто» переезжает на mi: gelecek <b>misin</b>?',`mi подстраивается под «${F}» → <b>m${i}</b>`],from:r.from};
}
function abil(v,p){
  const s=v.s, why=[]; let root;
  if(v.sp)root=v.sp==='de'?'diy':'yiy';
  else if(endV(s)){root=s+'y'; why.push('Корень на гласную — вставляем <b>y</b>');}
  else root=vb(v);
  why.push(`Корень + <b>${v2(s)}bil</b> («могу») + <b>ir</b>`,why2(s),'Дальше всегда с e/i: -im, -sin, —, -iz, -siniz, -ler');
  return {parts:[root,v2(s)+'bilir',['im','sin','','iz','siniz','ler'][p]].filter(Boolean),why,from:root.length-1};
}
function must(v,p){
  const s=v.s, a=v2(s), x=a==='e'?'i':'ı';
  const end=['y'+x+'m','s'+x+'n','','y'+x+'z','s'+x+'n'+x+'z','l'+a+'r'][p];
  return {parts:[s,'m'+a+'l'+x,end].filter(Boolean),why:[`Корень + <b>m${a}l${x}</b> («должен»)`,why2(s),'Для «я» и «мы» после гласной вставляем <b>y</b>: -meli<b>y</b>im'],from:s.length-1};
}

/* ================= question generator =================
   Nouns, verbs and topic names come from the course package (grammar.json): G = {nouns, verbs} */
const TASK={plural:'Сделай «много»',loc:'Где? Добавь -de / -da',dat:'Куда? Добавь -e / -a',abl:'Откуда? Добавь -den / -dan',acc:'«Тот самый»: добавь -i'};
const TNAME={pres:'сейчас',presNeg:'«не» сейчас',past:'в прошлом',pastNeg:'«не» в прошлом',fut:'в будущем',aor:'обычно',aorNeg:'обычно «не»',abil:'могу',must:'должен'};

/* A grammar question as data: prompt {kind, task, word, tr, lead?, q?}, the answer and its parts.
   The screen draws the prompt; task and tr are course text in the base language. */
function genQ(t,G){
  if(['plural','loc','dat','abl','acc','poss','poss1'].includes(t)){
    const pool=(t==='plural'||t.startsWith('poss'))?G.nouns.filter(n=>!n.p):G.nouns;
    const n=pick(pool), p=t==='poss1'?0:Math.floor(random()*5);
    const r=nounForm(n,t==='poss1'?'poss':t,p); let prompt;
    if(t.startsWith('poss')) prompt={kind:'sent',task:['мой','твой','его / её','наш','ваш'][p],lead:PGEN[p],word:n.w,tr:n.r};
    else prompt={kind:'word',task:TASK[t],word:n.w,tr:n.r};
    return {t,prompt,...r,answer:r.parts.join('')};
  }
  const v=pick(G.verbs), p=Math.floor(random()*6); let r, label;
  if(t==='q'){const tn=pick(['pres','past','fut']); r=quest(v,p,tn); label='вопрос, '+{pres:'сейчас',past:'в прошлом',fut:'в будущем'}[tn];}
  else{
    let neg=false; if(t==='fut'&&random()<.2)neg=true;
    r={pres:()=>pres(v,p,false),presNeg:()=>pres(v,p,true),past:()=>past(v,p,false),pastNeg:()=>past(v,p,true),fut:()=>fut(v,p,neg),aor:()=>aor(v,p,false),aorNeg:()=>aor(v,p,true),abil:()=>abil(v,p),must:()=>must(v,p)}[t]();
    label=neg?'«не» в будущем':TNAME[t];
  }
  const prompt={kind:'sent',task:`${PRU[p]} · ${label}`,lead:P[p][0].toUpperCase()+P[p].slice(1),q:t==='q',word:v.i,tr:v.r};
  return {t,prompt,...r,answer:r.parts.join('')};
}
const SUB={a:['e'],e:['a'],ı:['i','u'],i:['ı','ü'],u:['ü','ı'],ü:['u','i'],o:['ö'],ö:['o'],d:['t'],t:['d'],ğ:['k','g'],k:['ğ'],b:['p'],p:['b'],c:['ç'],ç:['c'],g:['k'],y:['']};
function mkOptions(q){
  const ans=q.answer, ch=[...ans], out=new Set();
  for(let i=Math.max(0,q.from);i<ch.length;i++)(SUB[ch[i]]||[]).forEach(r=>{const a=ch.slice();a[i]=r;const s=a.join('');if(s!==ans)out.add(s)});
  let d=shuffle([...out]);
  if(d.length<3){const ex=new Set();d.forEach(x=>{const c=[...x];for(let i=Math.max(0,q.from);i<c.length;i++)(SUB[c[i]]||[]).forEach(r=>{const a=c.slice();a[i]=r;const s=a.join('');if(s!==ans&&!out.has(s))ex.add(s)})});d=d.concat(shuffle([...ex]))}
  return shuffle([ans,...d.slice(0,3)]);
}

/* Every form the generator can ask about, for recording audio: [pack, text, isQuestion] in a fixed order */
function formsForAudio(G){
  const out=[], J=r=>r.parts.join(''), add=(pack,r,q)=>out.push([pack,J(r),!!q]);
  const common=G.nouns.filter(n=>!n.p);
  common.forEach(n=>add('g-plural',nounForm(n,'plural',0)));
  common.forEach(n=>[0,1,2,3,4].forEach(p=>add('g-poss',nounForm(n,'poss',p))));
  ['loc','dat','abl','acc'].forEach(k=>G.nouns.forEach(n=>add('g-'+k,nounForm(n,k,0))));
  G.verbs.forEach(v=>[0,1,2,3,4,5].forEach(p=>{
    add('g-pres',pres(v,p,false));add('g-presNeg',pres(v,p,true));
    add('g-past',past(v,p,false));add('g-pastNeg',past(v,p,true));
    add('g-fut',fut(v,p,false));add('g-fut',fut(v,p,true));
    add('g-aor',aor(v,p,false));add('g-aorNeg',aor(v,p,true));
    add('g-abil',abil(v,p));add('g-must',must(v,p));
    ['pres','past','fut'].forEach(t=>add('g-q',quest(v,p,t),true));
  }));
  return out;
}

export {V,v2,v4,lastV,endV,endH,nounForm,pres,past,fut,aor,quest,abil,must,P,PRU,PGEN,TASK,TNAME,genQ,mkOptions,formsForAudio};
