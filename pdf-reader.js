function parsePositionedItems(pages){
 const found=[],parts=["geographical entry","plural noun","adjective","adverb","preposition","interjection","noun","verb"];
 for(const page of pages){
   const h=page.height||792;
   const items=page.items.filter(t=>t.str&&Number.isFinite(t.x)&&Number.isFinite(t.y))
     .map(t=>({...t,str:t.str.trim()})).filter(t=>t.str&&t.y>65&&t.y<h-65);
   const numbered=items.filter(t=>t.x>=19&&t.x<66&&/^\d{1,3}\.$/.test(t.str))
     .sort((a,b)=>b.y-a.y);
   for(let i=0;i<numbered.length;i++){
     const number=Number(numbered[i].str.slice(0,-1));
     const top=numbered[i].y+7;
     const bottom=i+1<numbered.length?numbered[i+1].y+7:55;
     const row=items.filter(t=>t.y<=top&&t.y>bottom).sort((a,b)=>b.y-a.y||a.x-b.x);
     const tokens=row.filter(t=>t.x>=65&&t.x<158).map(t=>t.str);
     let phrase=tokens.join(" ").replace(/\s+/g," ").trim(),alternates=[];
     if(/\bOR\b/i.test(phrase)){
       const choices=phrase.split(/\bOR\b/i).map(s=>s.replace(/\*+/g,"").trim()).filter(Boolean);
       phrase=choices[0]||"";alternates=choices.slice(1);
     }
     phrase=phrase.replace(/\*+/g,"").trim();
     const pos=row.filter(t=>t.x>=158&&t.x<260).map(t=>t.str).join(" ").toLowerCase();
     const definition=row.filter(t=>t.x>=260).map(t=>t.str).join(" ").replace(/\s+/g," ").trim();
     if(number>=1&&number<=450&&phrase&&/^[\p{L}\p{M}\s'’\-]+$/u.test(phrase))
       found.push({number,word:phrase,alternates,partOfSpeech:parts.find(p=>pos.includes(p))||"",definition,sentence:"",source:"listed"});
   }
 }
 const unique=new Map();for(const item of found)if(!unique.has(item.number))unique.set(item.number,item);
 return [...unique.values()].sort((a,b)=>a.number-b.number);
}
export async function readPDF(file){
 const pdfjs=await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs");
 pdfjs.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
 const doc=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
 const pages=[];
 for(let i=1;i<=doc.numPages;i++){
   const page=await doc.getPage(i),content=await page.getTextContent();
   pages.push({height:page.getViewport({scale:1}).height,items:content.items.filter(t=>t.transform).map(t=>({str:t.str,x:t.transform[4],y:t.transform[5]}))});
 }
 const words=parsePositionedItems(pages);
 if(words.length<10)throw Error("Numbered word entries were not found");
 return words;
}