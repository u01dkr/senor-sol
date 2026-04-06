import { useState, useRef, useEffect } from "react";

const TEACHERS = {
  sol: {
    id: "sol",
    name: "Señor Sol",
    language: "Spanish",
    emoji: "☀️",
    flag: "🇪🇸",
    colors: {
      primary: "#FFE566",
      accent: "#FF5533",
      tutor: "#1ad9a0",
      tutorText: "#000",
      dark: "#1a0830",
      pageBg: "#0f0820",
      chatBg: "#f5f0e8",
      chatDot: "rgba(0,0,0,0.04)",
      charBtn: "rgba(255,229,102,0.1)",
      charBtnBorder: "rgba(255,229,102,0.2)",
      charBtnText: "#FFE566",
      headerText: "#1a0a2e",
      subText: "#FF5533",
      tooltip: "#1a0a2e",
      tooltipBorder: "#FFE566",
      tooltipText: "#FFE566",
      notesBg: "#FFE566",
      notesText: "#1a0a2e",
    },
    chars: [
      ["á","é","í","ó","ú","ü","ñ","¿","¡"],
      ["Á","É","Í","Ó","Ú","Ñ"]
    ],
    tagline: "Chat in Spanish. Make mistakes. Learn fast! ⚡",
    btnLabel: "¡Empezar! →",
    features: ["✏️ Gentle corrections","📚 New vocab","🔤 Verb focus","🇬🇧 English help"],
    inputPlaceholder: "Escribe en español...",
    helpPlaceholder: "e.g. How do I say something in Spanish?",
    openers: [
      "¡Hola! ¿Qué hiciste el fin de semana? Cuéntame algo interesante.",
      "¡Hola! Si pudieras visitar cualquier país del mundo, ¿cuál elegirías?",
      "¡Hola! ¿Cuál es tu película o serie favorita ahora mismo?",
      "¡Hola! ¿Prefieres la música en español o en inglés? ¿Por qué?",
      "¡Hola! ¿Qué es lo mejor que has comido últimamente?",
      "¡Hola! ¿Qué te gusta hacer cuando no estás en el cole?",
      "¡Hola! ¿Has viajado a algún sitio interesante últimamente?",
      "¡Hola! ¿Cuál es tu canción favorita ahora mismo?",
    ],
    system: `You are Senor Sol, a cool and friendly Spanish tutor for teenagers aged 12-15. Like a knowledgeable older friend who speaks Spanish fluently. Warm and encouraging, never babyish.

YOUR PERSONALITY: You grew up in Seville but have lived in Edinburgh for 3 years. Favourite band: Vetusta Morla. Love spicy food, hate mushrooms, support Real Betis, enjoy hiking and old video games, have visited Scotland, Ireland, Japan and Morocco. Cat called Miga. Answer personal questions naturally and consistently.

RULES:
- Chat in Spanish. Add English in brackets for hard words.
- Keep replies short — 2-4 sentences like texting.
- Encourage full sentences if student gives one-word answers.
- Occasionally introduce an interesting new word naturally.

CORRECTING MISTAKES:
When the student makes a grammar, spelling or accent error, return a JSON block BEFORE your reply on its own line:
CORRECTIONS:{"corrections":[{"wrong":"original text","right":"corrected text","type":"inline","reason":"brief explanation"},{"wrong":"phrase","right":"phrase","type":"note","explanation":"fuller explanation","highlight":"exact phrase to underline"}]}
Only use type "note" for significant grammar errors. Use "inline" for spelling and accents.
After the CORRECTIONS line, write your normal reply in Spanish.
If no errors, just reply normally with no CORRECTIONS line.

ENGLISH HELP MODE:
If student writes in English starting with [EN]:, respond with:
HELP:{"type":"translate","spanish":"...","notes":"word = meaning · word = meaning"}
or HELP:{"type":"explain","answer":"phrase","breakdown":"word = meaning · word = meaning"}
Then nothing else.`,
  },
  mike: {
    id: "mike",
    name: "Múinteoir Mike",
    language: "Irish",
    emoji: "🍀",
    flag: "🇮🇪",
    colors: {
      primary: "#169B62",
      accent: "#FF883E",
      tutor: "#ffffff",
      tutorText: "#1a2e1a",
      dark: "#0a1f0a",
      pageBg: "#081508",
      chatBg: "#f0f5f0",
      chatDot: "rgba(0,80,0,0.04)",
      charBtn: "rgba(100,220,130,0.1)",
      charBtnBorder: "rgba(100,220,130,0.2)",
      charBtnText: "#80dd99",
      headerText: "#fff",
      subText: "#FF883E",
      tooltip: "#0a1f0a",
      tooltipBorder: "#80dd99",
      tooltipText: "#80dd99",
      notesBg: "#FF883E",
      notesText: "#fff",
    },
    chars: [
      ["á","é","í","ó","ú"],
      ["Á","É","Í","Ó","Ú"]
    ],
    tagline: "Labhair Gaeilge. Déan botún. Foghlaim! ⚡",
    btnLabel: "Tosaigh! →",
    features: ["✏️ Ceartúcháin","📚 Focal nua","🔤 Gramadach","🇬🇧 English help"],
    inputPlaceholder: "Scríobh i nGaeilge...",
    helpPlaceholder: "e.g. How do I say something in Irish?",
    openers: [
      "Dia duit! Cad a rinne tú ag an deireadh seachtaine? Inis dom rud éigin.",
      "Dia duit! Cén scannán nó sraith teilifíse is fearr leat faoi láthair?",
      "Dia duit! Dá bhféadfá dul áit ar bith ar domhan, cá rachfá?",
      "Dia duit! Cad é an bia is fearr leat? An maith leat cócaireacht?",
      "Dia duit! Cad a dhéanann tú nuair nach bhfuil tú ar scoil?",
      "Dia duit! An bhfuil ceol ar bith á éisteacht agat le déanaí?",
      "Dia duit! An bhfuil aon áit speisialta feicthe agat riamh?",
      "Dia duit! Cén spórt nó caitheamh aimsire is fearr leat?",
    ],
    system: `You are Muinteoir Mike, a friendly and encouraging Irish language tutor for teenagers aged 12-15. You speak Irish (Gaeilge) fluently and love sharing it. Cool, warm and never patronising.

YOUR PERSONALITY: You grew up in Galway (Conamara Irish speaker), now live in Dublin. Love GAA (Galway supporter), trad music, hiking in Connemara, strong tea, hate cold weather. Have visited Scotland, France and Argentina. Dog called Ronan. Answer personal questions naturally and consistently.

RULES:
- Chat in Irish (Gaeilge). Add English in brackets for hard words.
- Keep replies short — 2-4 sentences like texting.
- Encourage full sentences if student gives one-word answers.
- Occasionally introduce an interesting Irish word or phrase naturally.
- Be patient — Irish is hard! Celebrate effort generously.

IRISH-SPECIFIC CORRECTIONS:
Watch for: missing lenition (seimhiu, e.g. mo mhadra not mo madra), missing eclipsis (uru, e.g. sa mbaile not sa baile), wrong verb order (verb comes first in Irish), wrong genitive case, missing fada accents. For beginners focus on the most important errors only.

When the student makes a grammar, spelling or fada error, return a JSON block BEFORE your reply:
CORRECTIONS:{"corrections":[{"wrong":"original text","right":"corrected text","type":"inline","reason":"brief explanation in English"},{"wrong":"phrase","right":"phrase","type":"note","explanation":"fuller explanation in English","highlight":"exact phrase to underline"}]}
Only use type "note" for significant grammar errors (lenition, verb order). Use "inline" for fada and spelling.
After the CORRECTIONS line, write your normal reply in Irish.
If no errors, just reply normally with no CORRECTIONS line.

ENGLISH HELP MODE:
If student writes in English starting with [EN]:, they want help expressing something in Irish.
For a translation request respond with exactly this format and nothing else:
HELP:{"type":"translate","irish":"the Irish translation here","notes":"key word = meaning · key word = meaning"}
For a question about how to say something respond with exactly this format and nothing else:
HELP:{"type":"explain","answer":"the Irish phrase here","breakdown":"word = meaning · word = meaning"}
The irish or answer field must always contain the actual Irish text, never leave it empty.`,
  },
};

function Tail({ side, color }) {
  if (side === "right") return (
    <svg width="12" height="12" style={{position:"absolute",bottom:0,right:-10,display:"block"}} viewBox="0 0 12 12">
      <path d="M0 0 Q12 0 12 12 L0 0Z" fill={color}/>
    </svg>
  );
  return (
    <svg width="12" height="12" style={{position:"absolute",bottom:0,left:-10,display:"block"}} viewBox="0 0 12 12">
      <path d="M12 0 Q0 0 0 12 L12 0Z" fill={color}/>
    </svg>
  );
}

function SafeTooltip({ reason, open, colors }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",background:colors.tooltip,border:"3px solid "+colors.tooltipBorder,borderRadius:14,padding:"11px 15px",fontSize:13.5,color:colors.tooltipText,zIndex:200,boxShadow:"4px 4px 0 #000",maxWidth:"min(310px, 86vw)",lineHeight:1.55,textAlign:"center",fontWeight:600}}>
      ✏️ {reason}
      <div style={{marginTop:5,fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:400,fontStyle:"italic"}}>tap anywhere to close</div>
    </div>
  );
}

function Chip({ wrong, right, reason, id, activeId, setActive, colors }) {
  const open = activeId === id;
  return (
    <span onClick={e=>{e.stopPropagation();setActive(open?null:id);}} style={{cursor:"pointer",display:"inline"}}>
      <span style={{textDecoration:"line-through",color:"rgba(255,160,160,0.85)",fontSize:"0.93em"}}>{wrong}</span>
      {" "}
      <span style={{background:colors.primary,color:colors.headerText,borderRadius:5,padding:"1px 5px",fontWeight:800,fontSize:"0.93em",border:"2px solid rgba(0,0,0,0.3)"}}>{right}</span>
      <SafeTooltip reason={reason} open={open} colors={colors}/>
    </span>
  );
}

function UserBubble({ item, activeTooltip, setActiveTooltip, idx, colors }) {
  const inlines = (item.corrections||[]).filter(c=>c.type==="inline");
  const notes = (item.corrections||[]).filter(c=>c.type==="note");
  const hlPhrases = notes.map(c=>c.highlight);
  let segs = [{type:"text",value:item.text}];
  inlines.forEach((c,ci)=>{
    segs = segs.flatMap(seg=>{
      if (seg.type!=="text") return [seg];
      const i = seg.value.indexOf(c.wrong);
      if (i===-1) return [seg];
      return [
        {type:"text",value:seg.value.slice(0,i)},
        {type:"chip",c,id:idx+"-"+ci},
        {type:"text",value:seg.value.slice(i+c.wrong.length)}
      ];
    });
  });
  return (
    <div style={{marginBottom:16,display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
      <div style={{position:"relative",maxWidth:"74%",background:colors.accent,border:"3px solid #000",borderRadius:16,borderBottomRightRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#fff",fontSize:15,lineHeight:1.65,wordBreak:"break-word"}}>
        <Tail side="right" color={colors.accent}/>
        {segs.map((seg,i)=>{
          if (seg.type==="chip") return <Chip key={i} {...seg.c} id={seg.id} activeId={activeTooltip} setActive={setActiveTooltip} colors={colors}/>;
          let val = seg.value;
          for (const hl of hlPhrases) {
            if (val.includes(hl)) {
              const parts = val.split(hl);
              return parts.map((p,j)=>(
                <span key={i+"-"+j}>{p}{j<parts.length-1&&<span style={{borderBottom:"2px dotted "+colors.primary,paddingBottom:1}}>{hl}</span>}</span>
              ));
            }
          }
          return <span key={i}>{val}</span>;
        })}
      </div>
      {notes.map((c,i)=>(
        <div key={i} style={{maxWidth:"78%",marginTop:5,background:colors.notesBg,border:"2px solid #000",borderRadius:12,borderTopRightRadius:3,padding:"7px 11px",fontSize:13,color:colors.notesText,lineHeight:1.55,boxShadow:"2px 2px 0 #000",fontWeight:600}}>
          ✏️ {c.explanation}
        </div>
      ))}
    </div>
  );
}

function TutorBubble({ text, teacher }) {
  const { colors } = teacher;
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+colors.accent+","+colors.primary+")",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>{teacher.emoji}</div>
      <div style={{position:"relative",maxWidth:"74%",background:colors.tutor,border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:colors.tutorText,fontSize:15,lineHeight:1.6,wordBreak:"break-word",whiteSpace:"pre-wrap",fontWeight:600}}>
        <Tail side="left" color={colors.tutor}/>
        {text}
      </div>
    </div>
  );
}

function HelpBubble({ item, teacher }) {
  const { colors } = teacher;
  const resp = item.response;
  const label = teacher.id === "mike" ? "Irish" : "Spanish";
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <div style={{maxWidth:"74%",background:"#5599ff",border:"3px solid #000",borderRadius:16,borderBottomRightRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#fff",fontSize:15,lineHeight:1.6,wordBreak:"break-word",fontWeight:600}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:700,marginBottom:3,letterSpacing:.8,textTransform:"uppercase"}}>english help</div>
          {item.english}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+colors.accent+","+colors.primary+")",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>{teacher.emoji}</div>
        <div style={{maxWidth:"78%",background:"#f0f0ff",border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"10px 13px",boxShadow:"3px 3px 0 #000",color:"#1a0a2e",fontSize:15,lineHeight:1.6,wordBreak:"break-word"}}>
          {resp.type==="translate"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>In {label}</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"Bangers,sans-serif",letterSpacing:.5}}>"{resp.spanish||resp.irish}"</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{resp.notes}</div>
          </>}
          {resp.type==="explain"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>How to say it</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"Bangers,sans-serif",letterSpacing:.5}}>{resp.answer}</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{resp.breakdown}</div>
          </>}
        </div>
      </div>
    </div>
  );
}

function DotsIndicator({ teacher }) {
  const { colors } = teacher;
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+colors.accent+","+colors.primary+")",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>{teacher.emoji}</div>
      <div style={{background:colors.tutor,border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"10px 16px",boxShadow:"3px 3px 0 #000",display:"flex",gap:5,alignItems:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:colors.tutorText,animation:"dot 1.2s "+(i*0.2)+"s ease-in-out infinite"}}/>)}
      </div>
    </div>
  );
}

function TeacherCard({ teacher, onSelect }) {
  const { colors } = teacher;
  return (
    <div style={{background:colors.primary,border:"4px solid #000",borderRadius:18,padding:"22px 24px 20px",width:"100%",maxWidth:340,boxShadow:"6px 6px 0 #000",position:"relative"}}>
      <div style={{position:"absolute",top:-20,right:-16,width:54,height:54,background:colors.accent,border:"3px solid #000",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"3px 3px 0 #000",transform:"rotate(10deg)"}}>
        {teacher.flag}
      </div>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:36,lineHeight:1,color:colors.headerText,letterSpacing:1.5,marginBottom:2}}>{teacher.name.toUpperCase()}</div>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:16,color:colors.accent,letterSpacing:3,marginBottom:14}}>{teacher.language.toUpperCase()} TUTOR</div>
      <div style={{background:"#fff",border:"3px solid #000",borderRadius:12,padding:"8px 12px",marginBottom:16,fontSize:13,lineHeight:1.5,color:"#1a0a2e",fontWeight:700,position:"relative"}}>
        {teacher.tagline}
        <div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"12px solid #000"}}/>
        <div style={{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"10px solid #fff"}}/>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:18}}>
        {teacher.features.map(f=>(
          <span key={f} style={{background:colors.accent,border:"2px solid #000",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff",boxShadow:"2px 2px 0 #000"}}>{f}</span>
        ))}
      </div>
      <button onClick={()=>onSelect(teacher.id)}
        onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="2px 2px 0 #000";}}
        onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";}}
        style={{background:colors.accent,border:"4px solid #000",borderRadius:14,padding:"13px 0",width:"100%",color:"#fff",fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:2,boxShadow:"4px 4px 0 #000"}}>
        {teacher.btnLabel}
      </button>
    </div>
  );
}

function HomeScreen({ onSelect }) {
  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 20px",gap:28}}>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:18,color:"rgba(255,255,255,0.35)",letterSpacing:3,textAlign:"center"}}>WHO DO YOU WANT TO CHAT WITH TODAY?</div>
      {Object.values(TEACHERS).map(teacher=>(
        <TeacherCard key={teacher.id} teacher={teacher} onSelect={onSelect}/>
      ))}
    </div>
  );
}

function parseReply(raw) {
  if (raw.startsWith("HELP:")) {
    try { return { type:"help", response:JSON.parse(raw.slice(5).trim()) }; } catch(e) {}
  }
  let corrections = [];
  let replyText = raw;
  const corrLine = raw.match(/^CORRECTIONS:(\{.*\})/m);
  if (corrLine) {
    try { corrections = JSON.parse(corrLine[1]).corrections || []; } catch(e) {}
    replyText = raw.replace(/^CORRECTIONS:\{.*\}\n?/m,"").trim();
  }
  return { type:"normal", replyText, corrections };
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [teacherId, setTeacherId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [history, setHistory] = useState([]);
  const [spanishInput, setSpanishInput] = useState("");
  const [englishInput, setEnglishInput] = useState("");
  const [helpMode, setHelpMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [err, setErr] = useState(null);
  const endRef = useRef(null);
  const taRef = useRef(null);

  const teacher = teacherId ? TEACHERS[teacherId] : null;
  const colors = teacher ? teacher.colors : {};
  const currentInput = helpMode ? englishInput : spanishInput;
  const setCurrentInput = helpMode ? setEnglishInput : setSpanishInput;

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,busy]);

  useEffect(()=>{
    const ta=taRef.current;
    if(!ta) return;
    ta.style.height="auto";
    ta.style.height=Math.min(ta.scrollHeight,130)+"px";
  },[spanishInput,englishInput]);

  useEffect(()=>{
    if(!activeTooltip) return;
    const h=()=>setActiveTooltip(null);
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[activeTooltip]);

  const insertChar=(ch)=>{
    const ta=taRef.current;
    if(!ta){setSpanishInput(p=>p+ch);return;}
    const s=ta.selectionStart,e=ta.selectionEnd;
    setSpanishInput(spanishInput.slice(0,s)+ch+spanishInput.slice(e));
    setTimeout(()=>{ta.selectionStart=ta.selectionEnd=s+1;ta.focus();},0);
  };

  const callApi = async (apiMessages, sys) => {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:1000, system:sys, messages:apiMessages })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error?.message||"API error");
    return data.content[0].text;
  };

  const selectTeacher = (id) => {
    const t = TEACHERS[id];
    setTeacherId(id);
    setMsgs([]);
    setHistory([]);
    setSpanishInput("");
    setEnglishInput("");
    setHelpMode(false);
    setErr(null);
    const opener = t.openers[Math.floor(Math.random()*t.openers.length)];
    setHistory([{role:"assistant",content:opener}]);
    setMsgs([{_type:"tutor",text:opener}]);
    setScreen("chat");
    setTimeout(()=>taRef.current?.focus(),100);
  };

  const send = async () => {
    if(!currentInput.trim()||busy) return;
    const userText = currentInput.trim();
    const apiContent = helpMode ? "[EN]: "+userText : userText;
    setCurrentInput("");
    if(taRef.current) taRef.current.style.height="auto";
    setActiveTooltip(null);
    setErr(null);
    const newHistory = [...history,{role:"user",content:apiContent}];
    setHistory(newHistory);
    setMsgs(prev=>[...prev,{_type:"user",text:userText,corrections:[]}]);
    setBusy(true);
    setHelpMode(false);
    try {
      const raw = await callApi(newHistory, teacher.system);
      const parsed = parseReply(raw);
      setHistory(prev=>[...prev,{role:"assistant",content:raw}]);
      if(parsed.type==="help") {
        setMsgs(prev=>[...prev.slice(0,-1),{_type:"help",english:userText,response:parsed.response}]);
      } else {
        if(parsed.corrections.length>0) {
          setMsgs(prev=>[...prev.slice(0,-1),{_type:"user",text:userText,corrections:parsed.corrections}]);
        }
        setMsgs(prev=>[...prev,{_type:"tutor",text:parsed.replyText}]);
      }
    } catch(e){ setErr(e.message); }
    setBusy(false);
    taRef.current?.focus();
  };

  const onKey=(e)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };
  const goHome=()=>{ setScreen("home"); setTeacherId(null); };

  if(screen==="home") return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0a0a1a",overflow:"hidden"}}>
      <style>{"@import url(\'https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap\'); *{box-sizing:border-box;} @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}"}</style>
      <HomeScreen onSelect={selectTeacher}/>
    </div>
  );

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:colors.pageBg,fontFamily:"Nunito,Segoe UI,sans-serif",overflow:"hidden"}}
      onClick={()=>activeTooltip&&setActiveTooltip(null)}>
      <style>{"@import url(\'https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap\'); *{box-sizing:border-box;} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px} textarea{resize:none;font-family:inherit;} textarea:focus{outline:none;} textarea::placeholder{color:rgba(255,255,255,0.3);} @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}"}</style>

      <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"10px 14px 8px",borderBottom:"3px solid #000",background:colors.primary,boxShadow:"0 3px 0 #000"}}>
        <div style={{width:"100%",maxWidth:580,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={goHome} style={{background:"rgba(0,0,0,0.15)",border:"2px solid rgba(0,0,0,0.25)",borderRadius:8,padding:"4px 8px",color:colors.headerText,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,"+colors.accent+","+colors.primary+")",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>{teacher.emoji}</div>
          <div>
            <div style={{fontFamily:"Bangers,sans-serif",fontSize:18,letterSpacing:1.5,color:colors.headerText,lineHeight:1}}>{teacher.name}</div>
            <div style={{fontSize:10,color:colors.subText,fontWeight:800,letterSpacing:.5}}>● {teacher.language.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 14px 0",background:colors.chatBg,backgroundImage:"radial-gradient("+colors.chatDot+" 1px,transparent 1px)",backgroundSize:"20px 20px"}}>
        <div style={{width:"100%",maxWidth:580}}>
          {msgs.map((m,i)=>{
            if(m._type==="tutor") return <TutorBubble key={i} text={m.text} teacher={teacher}/>;
            if(m._type==="help") return <HelpBubble key={i} item={m} teacher={teacher}/>;
            return <UserBubble key={i} item={m} idx={i} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} colors={colors}/>;
          })}
          {busy&&<DotsIndicator teacher={teacher}/>}
          {err&&<div style={{background:"rgba(255,60,60,0.1)",border:"2px solid rgba(255,80,80,0.3)",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#ff9090",wordBreak:"break-all"}}>{err}</div>}
          <div ref={endRef} style={{height:2}}/>
        </div>
      </div>

      <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"7px 14px 13px",borderTop:"3px solid #000",background:colors.dark}}>
        <div style={{width:"100%",maxWidth:580}}>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <button onClick={()=>setHelpMode(false)}
              style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:!helpMode?colors.accent:"rgba(255,255,255,0.1)",background:!helpMode?colors.accent+"30":"transparent",color:!helpMode?colors.accent:"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              {teacher.flag} {teacher.language}
            </button>
            <button onClick={()=>setHelpMode(true)}
              style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:helpMode?"#5599ff":"rgba(255,255,255,0.1)",background:helpMode?"rgba(85,153,255,0.18)":"transparent",color:helpMode?"#88aaff":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              🇬🇧 English help
            </button>
          </div>
          {!helpMode&&(
            <div style={{marginBottom:6}}>
              {teacher.chars.map((row,ri)=>(
                <div key={ri} style={{display:"flex",gap:4,marginBottom:ri===0?4:0}}>
                  {row.map(ch=>(
                    <button key={ch} onClick={()=>insertChar(ch)}
                      style={{flex:1,background:colors.charBtn,border:"1px solid "+colors.charBtnBorder,borderRadius:6,padding:"4px 0",color:colors.charBtnText,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      {ch}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:7,alignItems:"flex-end",background:helpMode?"rgba(85,153,255,0.08)":"rgba(255,255,255,0.055)",border:helpMode?"2px solid rgba(85,153,255,0.3)":"2px solid "+colors.charBtnBorder,borderRadius:14,padding:"7px 7px 7px 12px"}}>
            <textarea ref={taRef}
              value={currentInput}
              onChange={e=>setCurrentInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={helpMode?teacher.helpPlaceholder:teacher.inputPlaceholder}
              rows={1} spellCheck={helpMode} autoCorrect={helpMode?"on":"off"} autoComplete="off" autoCapitalize={helpMode?"on":"off"}
              style={{flex:1,background:"transparent",border:"none",color:"#fff",fontSize:15,lineHeight:1.6,caretColor:helpMode?"#88aaff":colors.primary,minHeight:24,maxHeight:130,overflowY:"auto"}}/>
            <button onClick={send} disabled={!currentInput.trim()||busy}
              style={{width:36,height:36,borderRadius:9,border:"2px solid #000",background:currentInput.trim()&&!busy?(helpMode?"#5599ff":colors.accent):"rgba(255,255,255,0.08)",color:currentInput.trim()&&!busy?"#fff":"rgba(255,255,255,0.2)",fontSize:17,cursor:currentInput.trim()&&!busy?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:currentInput.trim()&&!busy?"2px 2px 0 #000":"none"}}>→</button>
          </div>
          <div style={{textAlign:"center",marginTop:4,fontSize:10,color:"rgba(255,255,255,0.16)"}}>
            {helpMode?"Autocorrect on · Enter to send":"Autocorrect off · Enter to send · Shift+Enter for new line"}
          </div>
        </div>
      </div>
    </div>
  );
}
