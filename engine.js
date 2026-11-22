(function(root){
const DAY=86400000;
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z]/g,"");
const dateKey=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const key=w=>norm(w.word||w);
function parseSpeech(raw,target){
 let clean=s=>s.toLowerCase().replace(/[.,!?;:–—-]/g," ").replace(/\s+/g," ").trim();
 let t=clean(raw),w=clean(target);
 if(/^(?:may i (?:have|hear) (?:the |a )?|can you (?:give me |say )?|please )?(?:definition|meaning|what does it mean)$/.test(t))return {command:"definition"};
 if(/^(?:may i (?:have|hear) (?:the |a )?|please )?(?:sentence|use it in a sentence)$/.test(t))return {command:"sentence"};
 if(/^(?:please )?(?:repeat|repeat the word|say it again)$/.test(t))return {command:"repeat"};
 if(/^(?:language of origin|origin|what is the origin)$/.test(t))return {command:"origin"};
 if(t===w)return {letters:"",reason:"word-only"};
 if(t.startsWith(w+" "))t=t.slice(w.length).trim();
 if(t.endsWith(" "+w))t=t.slice(0,-w.length).trim();
 const names={ay:"a",bee:"b",be:"b",cee:"c",see:"c",sea:"c",dee:"d",ee:"e",eff:"f",gee:"g",aitch:"h",eye:"i",jay:"j",kay:"k",ell:"l",em:"m",en:"n",oh:"o",pee:"p",cue:"q",queue:"q",are:"r",ess:"s",tee:"t",tea:"t",you:"u",vee:"v",doubleyou:"w",ex:"x",why:"y",zee:"z",zed:"z"};
 t=t.replace(/\bdouble (you|u)\b/g,"doubleyou");
 const tokens=t.split(" ").filter(Boolean),out=[];
 for(let i=0;i<tokens.length;i++){let x=tokens[i];let repeat=1;if(x==="double"||x==="triple"){repeat=x==="double"?2:3;x=tokens[++i]||""}const l=/^[a-z]$/.test(x)?x:names[x];if(!l)return {letters:"",reason:"unclear"};out.push(l.repeat(repeat))}
 return out.length?{letters:out.join("").toUpperCase()}:{letters:"",reason:"unclear"};
}
function history(a,w){return a.filter(x=>x.key===key(w)&&x.outcome!=="skip").sort((a,b)=>a.at-b.at)}
function mastery(a,w,now=Date.now()){
 const h=history(a,w),last=h.at(-1);if(!last)return {status:"new",due:0,days:0};
 let wins=h.slice(h.map(x=>x.outcome).lastIndexOf("wrong")+1).filter(x=>x.outcome==="correct"&&!x.assisted);
 const dates=[...new Set(wins.map(x=>dateKey(x.at)))];const gap=wins.length?(wins.at(-1).at-wins[0].at)/DAY:0;
 const mastered=dates.length>=3&&gap>=7;
 const wait=last.outcome==="wrong"?0:mastered?14:dates.length>=2?4:1;
 return {status:mastered?"mastered":last.outcome==="wrong"?"review":"learning",due:last.at+wait*DAY,days:dates.length};
}
function stats(state){
 const attempts=state.attempts||[], scored=attempts.filter(a=>a.outcome==="correct"||a.outcome==="wrong");
 const list=state.words||[], covered=list.filter(w=>scored.some(a=>a.key===key(w))).length, mastered=list.filter(w=>mastery(scored,w).status==="mastered").length;
 const fresh=scored.filter(a=>a.fresh&&a.phase==="transfer"), right=a=>a.filter(x=>x.outcome==="correct").length;
 return {covered,mastered,total:list.length,scored:scored.length,right:right(scored),fresh:fresh.length,freshRight:right(fresh),seconds:(state.sessions||[]).reduce((n,s)=>n+s.seconds,0)};
}
function makePlan(state,curriculum,mode="daily",chosen=""){
 const words=state.words||[],a=state.attempts||[],seen=new Set(state.seen||[]),now=Date.now();
 const order=(x,y)=>{let mx=mastery(a,x,now),my=mastery(a,y,now);return Number(mx.due>now)-Number(my.due>now)||mx.due-my.due};
 const fromList=words.slice().sort(order).slice(0,4).map(w=>({...w,phase:"recall",source:"listed"}));
 const pick=curriculum.find(p=>p.id===chosen)||curriculum.slice().sort((x,y)=>{
 const score=p=>{const h=a.filter(q=>q.pattern===p.id&&q.phase==="transfer"&&q.outcome!=="skip");const fresh=p.transfer.filter(v=>!seen.has(norm(v[0]))&&!words.some(w=>key(w)===norm(v[0]))).length;return fresh*10+(h.filter(q=>q.outcome==="wrong").length)-h.length};return score(y)-score(x)})[0];
 const item=(v,phase)=>({word:v[0],definition:v[1],phase,pattern:pick.id,source:"curriculum"});
 const practice=pick.practice.map(v=>item(v,"practice"));
 const transfer=pick.transfer.map(v=>item(v,"transfer")).filter(w=>!seen.has(key(w))&&!words.some(x=>key(x)===key(w)));
 if(mode==="bee")return (words.length?words.slice().sort(order).slice(0,10):curriculum.flatMap(p=>p.practice.map(v=>({word:v[0],definition:v[1],pattern:p.id,source:"curriculum"}))).slice(0,10)).map(w=>({...w,phase:"bee"}));
 if(mode==="mystery")return curriculum.flatMap(p=>p.transfer.map(v=>({word:v[0],definition:v[1],phase:"transfer",pattern:p.id,source:"curriculum"}))).filter(w=>!seen.has(key(w))&&!words.some(x=>key(x)===key(w))).slice(0,5);
 return [...(mode==="daily"?fromList:[]),{lesson:pick.id},...practice,...transfer.slice(0,2)];
}
root.BeeEngine={norm,key,dateKey,parseSpeech,mastery,stats,makePlan};
})(typeof window!=="undefined"?window:globalThis);