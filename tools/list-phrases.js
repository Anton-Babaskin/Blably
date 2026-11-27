const fs=require('fs'),vm=require('vm');
const src=['util.js','morph.js','data.js'].map(f=>fs.readFileSync('../'+f,'utf8')).join('\n').replace(/'use strict';/g,'');
const out={}; const seen=new Set();
const code=src+`
const add=(pack,t,q)=>{const k=speakKey(t);if(!k||hasCyr(k)||seen.has(k))return;seen.add(k);(out[pack]=out[pack]||[]).push([k,q?k+'?':k])};
['İyi geceler','Günaydın','İyi günler','İyi akşamlar'].forEach(t=>add('course',t));
[...TALK,...GRAM].forEach(u=>u.ls.forEach(l=>l.steps.forEach(s=>{
  if(s.k==='learn')s.ex.forEach(e=>add('course',e[0]));
  if(s.k==='mc'){if(s.say)add('course',s.say);if(!hasCyr(s.o[0])&&!/</.test(s.o[0]))add('course',s.o[0])}
  if(s.k==='build'){add('course',s.a);[...s.a.split(' '),...(s.x||[])].forEach(w=>add('course',cmp(w)))}
  if(s.k==='match')s.p.forEach(p=>add('course',p[0]));
})));
WG.forEach((g,i)=>g.cats.forEach(c=>c.it.forEach(x=>add('words'+(i+1),x[0]))));
const common=NOUNS.filter(n=>!n.p);
const J=r=>r.parts.join('');
common.forEach(n=>add('g-plural',J(nounForm(n,'plural',0))));
common.forEach(n=>[0,1,2,3,4].forEach(p=>add('g-poss',J(nounForm(n,'poss',p)))));
['loc','dat','abl','acc'].forEach(k=>NOUNS.forEach(n=>add('g-'+k,J(nounForm(n,k,0)))));
const PS=[0,1,2,3,4,5];
VERBS.forEach(v=>PS.forEach(p=>{
  add('g-pres',J(pres(v,p,false)));add('g-presNeg',J(pres(v,p,true)));
  add('g-past',J(past(v,p,false)));add('g-pastNeg',J(past(v,p,true)));
  add('g-fut',J(fut(v,p,false)));add('g-fut',J(fut(v,p,true)));
  add('g-aor',J(aor(v,p,false)));add('g-aorNeg',J(aor(v,p,true)));
  add('g-abil',J(abil(v,p)));add('g-must',J(must(v,p)));
  ['pres','past','fut'].forEach(t=>add('g-q',J(quest(v,p,t)),true));
}));
`;
vm.runInNewContext(code,{out,seen,console});
fs.writeFileSync('./keys.json',JSON.stringify(out));
for(const k in out)console.log(k,out[k].length);
