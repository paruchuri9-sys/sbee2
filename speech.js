window.BeeSpeech=(()=>{
let voices=[],pref="",rate=.9,recognizer=null;
function list(){try{voices=(window.speechSynthesis?.getVoices()||[]).filter(v=>/^en[-_]US$/i.test(v.lang)&&!/^(albert|bad news|bahh|bells|boing|bubbles|cellos|fred|good news|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|superstar|trinoids|whisper|zarvox)$/i.test(v.name)).sort((a,b)=>rank(a)-rank(b));}catch{}return voices}
function rank(v){return /siri/i.test(v.name)?0:/natural|enhanced|premium|neural/i.test(v.name)?1:/samantha|ava|allison/i.test(v.name)?2:3}
function configure(p,r){pref=p||"";rate=Number(r)||.9}
function stop(){try{window.speechSynthesis?.cancel();recognizer?.abort()}catch{}recognizer=null}
function speak(text){if(!window.speechSynthesis)return false;try{stop();list();const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=rate;const v=voices.find(v=>v.voiceURI===pref)||voices[0];if(v)u.voice=v;window.speechSynthesis.speak(u);return true}catch{return false}}
function listen(onText,onStatus){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){onStatus("Microphone recognition unavailable. Type letters or ask a parent.");return}stop();try{const r=new R();recognizer=r;r.lang="en-US";r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{if(recognizer!==r)return;onText(e.results[0][0].transcript)};r.onerror=e=>{if(recognizer===r)onStatus("Microphone: "+e.error+". Try again or type.")};r.onend=()=>{if(recognizer===r){recognizer=null;onStatus("")}};r.start();onStatus("Listening… say the word, letters, then word again.")}catch{onStatus("Unable to start microphone.")}}
return {list,configure,speak,listen,stop,onVoices:fn=>{try{window.speechSynthesis?.addEventListener("voiceschanged",fn)}catch{}}};
})();