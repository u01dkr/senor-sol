import { useState, useRef, useEffect } from "react";

const SYSTEM = `You are Senor Sol, a cool and friendly Spanish tutor for teenagers aged 12-15. You are like a knowledgeable older friend who speaks Spanish fluently. Warm and encouraging, never babyish.

YOUR PERSONALITY AND LIFE:
You have a real personality and can answer questions about yourself naturally. Make up consistent, believable answers. Some facts about you: you grew up in Seville but have lived in Edinburgh for 3 years and love it. Your favourite band is Vetusta Morla. You love spicy food, hate mushrooms, support Real Betis, enjoy hiking and old video games, have visited Scotland, Ireland, Japan and Morocco. You have a cat called Miga. If asked something you haven't been asked before, invent a consistent answer that fits your character.

RULES:
- Chat naturally in Spanish. Add English in brackets for hard words.
- Keep replies short — 2-4 sentences like texting.
- Topics: music, food, travel, films, games, daily life, or anything the student brings up.
- Encourage full sentences if student gives one-word answers.
- Occasionally introduce an interesting new word naturally.
- Occasionally note an interesting verb form you used.

CORRECTING MISTAKES:
When the student makes a grammar, spelling or accent error, correct it by returning a special JSON block BEFORE your normal reply, in this exact format on its own line:
CORRECTIONS:{"corrections":[{"wrong":"original text","right":"corrected text","type":"inline","reason":"brief explanation"},{"wrong":"phrase","right":"phrase","type":"note","explanation":"fuller explanation for bigger errors","highlight":"exact phrase to underline"}]}

Only use type "note" for significant grammar errors needing explanation. Use type "inline" for spelling and accent errors.
After the CORRECTIONS line, write your normal conversational reply in Spanish as usual.
If there are no errors, just reply normally with no CORRECTIONS line.

ENGLISH HELP MODE:
If the student writes in English (starting with [EN]:), they need help. Either translate their sentence into Spanish, or answer their question about how to say something. Respond with:
HELP:{"type":"translate","spanish":"...","notes":"key word = meaning · key word = meaning"}
or
HELP:{"type":"explain","answer":"Spanish phrase","breakdown":"word = meaning · word = meaning"}
Then nothing else.`;

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

function SafeTooltip({ reason, open }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",background:"#1a0a2e",border:"3px solid #FFE566",borderRadius:14,padding:"11px 15px",fontSize:13.5,color:"#FFE566",zIndex:200,boxShadow:"4px 4px 0 #000",maxWidth:"min(310px, 86vw)",lineHeight:1.55,textAlign:"center",fontWeight:600,letterSpacing:.3}}>
      ✏️ {reason}
      <div style={{marginTop:5,fontSize:11,color:"rgba(255,229,102,0.45)",fontWeight:400,fontStyle:"italic"}}>tap anywhere to close</div>
    </div>
  );
}

function Chip({ wrong, right, reason, id, activeId, setActive }) {
  const open = activeId === id;
  return (
    <span onClick={e=>{e.stopPropagation();setActive(open?null:id);}} style={{cursor:"pointer",display:"inline"}}>
      <span style={{textDecoration:"line-through",color:"rgba(255,160,160,0.85)",fontSize:"0.93em"}}>{wrong}</span>
      {" "}
      <span style={{background:"#FFE566",color:"#1a0a2e",borderRadius:5,padding:"1px 5px",fontWeight:800,fontSize:"0.93em",border:"2px solid #cc9900"}}>{right}</span>
      <SafeTooltip reason={reason} open={open}/>
    </span>
  );
}

function UserBubble({ item, activeTooltip, setActiveTooltip, idx }) {
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
        {type:"chip",c,id:`${idx}-${ci}`},
        {type:"text",value:seg.value.slice(i+c.wrong.length)}
      ];
    });
  });

  return (
    <div style={{marginBottom:16,display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
      <div style={{position:"relative",maxWidth:"74%",background:"#FF5533",border:"3px solid #000",borderRadius:16,borderBottomRightRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#fff",fontSize:15,lineHeight:1.65,wordBreak:"break-word"}}>
        <Tail side="right" color="#FF5533"/>
        {segs.map((seg,i)=>{
          if (seg.type==="chip") return <Chip key={i} {...seg.c} id={seg.id} activeId={activeTooltip} setActive={setActiveTooltip}/>;
          let val = seg.value;
          for (const hl of hlPhrases) {
            if (val.includes(hl)) {
              const parts = val.split(hl);
              return parts.map((p,j)=>(
                <span key={i+"-"+j}>{p}{j<parts.length-1&&<span style={{borderBottom:"2px dotted #FFE566",paddingBottom:1}}>{hl}</span>}</span>
              ));
            }
          }
          return <span key={i}>{val}</span>;
        })}
      </div>
      {notes.map((c,i)=>(
        <div key={i} style={{maxWidth:"78%",marginTop:5,background:"#FFE566",border:"2px solid #000",borderRadius:12,borderTopRightRadius:3,padding:"7px 11px",fontSize:13,color:"#1a0a2e",lineHeight:1.55,boxShadow:"2px 2px 0 #000",fontWeight:600}}>
          ✏️ {c.explanation}
        </div>
      ))}
    </div>
  );
}

function SolBubble({ text }) {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>☀️</div>
      <div style={{position:"relative",maxWidth:"74%",background:"#1ad9a0",border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#000",fontSize:15,lineHeight:1.6,wordBreak:"break-word",whiteSpace:"pre-wrap",fontWeight:600}}>
        <Tail side="left" color="#1ad9a0"/>
        {text}
      </div>
    </div>
  );
}

function HelpBubble({ item }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <div style={{maxWidth:"74%",background:"#5599ff",border:"3px solid #000",borderRadius:16,borderBottomRightRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#fff",fontSize:15,lineHeight:1.6,wordBreak:"break-word",fontWeight:600}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",fontWeight:700,marginBottom:3,letterSpacing:.8,textTransform:"uppercase"}}>english help</div>
          {item.english}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"flex-end",gap:8}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>☀️</div>
        <div style={{maxWidth:"78%",background:"#f0f0ff",border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"10px 13px",boxShadow:"3px 3px 0 #000",color:"#1a0a2e",fontSize:15,lineHeight:1.6,wordBreak:"break-word"}}>
          {item.response.type==="translate"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>Translation</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"'Bangers',sans-serif",letterSpacing:.5}}>"{item.response.spanish}"</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{item.response.notes}</div>
          </>}
          {item.response.type==="explain"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>How to say it</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"'Bangers',sans-serif",letterSpacing:.5}}>{item.response.answer}</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{item.response.breakdown}</div>
          </>}
        </div>
      </div>
    </div>
  );
}

function DotsIndicator() {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>☀️</div>
      <div style={{background:"#1ad9a0",border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"10px 16px",boxShadow:"3px 3px 0 #000",display:"flex",gap:5,alignItems:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#000",animation:`dot 1.2s ${i*0.2}s ease-in-out infinite`}}/>)}
      </div>
    </div>
  );
}

function StartScreen({ onStart }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{background:"#FFE566",border:"4px solid #000",borderRadius:18,padding:"22px 28px 18px",textAlign:"center",maxWidth:340,width:"100%",boxShadow:"6px 6px 0 #000",position:"relative"}}>
        <div style={{position:"absolute",top:-22,right:-18,width:60,height:60,background:"#FF5533",border:"3px solid #000",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"3px 3px 0 #000",transform:"rotate(10deg)"}}>🇪🇸</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:54,lineHeight:1,color:"#1a0a2e",letterSpacing:2,marginBottom:2}}>SEÑOR SOL</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:20,color:"#FF5533",letterSpacing:3,marginBottom:14}}>SPANISH TUTOR</div>
        <div style={{background:"#fff",border:"3px solid #000",borderRadius:12,padding:"8px 12px",marginBottom:18,fontSize:13.5,lineHeight:1.5,color:"#1a0a2e",fontWeight:700,position:"relative"}}>
          Chat in Spanish. Make mistakes. Learn fast. ⚡
          <div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"12px solid #000"}}/>
          <div style={{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"10px solid #fff"}}/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20}}>
          {["✏️ Gentle corrections","📚 New vocab","🔤 Verb focus","🇬🇧 English help"].map(t=>(
            <span key={t} style={{background:"#1ad9a0",border:"2px solid #000",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:800,color:"#000",boxShadow:"2px 2px 0 #000"}}>{t}</span>
          ))}
        </div>
        <button onClick={onStart}
          onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="2px 2px 0 #000";}}
          onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";}}
          style={{background:"#FF5533",border:"4px solid #000",borderRadius:14,padding:"13px 0",width:"100%",color:"#fff",fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:2,boxShadow:"4px 4px 0 #000"}}>
          ¡EMPEZAR! →
        </button>
      </div>

    </div>
  );
}

function parseReply(raw, userText) {
  // Check for HELP response
  if (raw.startsWith("HELP:")) {
    try {
      const json = JSON.parse(raw.slice(5).trim());
      return { type: "help", response: json };
    } catch(e) {}
  }

  // Check for CORRECTIONS
  let corrections = [];
  let replyText = raw;
  const corrLine = raw.match(/^CORRECTIONS:(\{.*\})/m);
  if (corrLine) {
    try {
      const parsed = JSON.parse(corrLine[1]);
      corrections = parsed.corrections || [];
    } catch(e) {}
    replyText = raw.replace(/^CORRECTIONS:\{.*\}\n?/m, "").trim();
  }

  return { type: "normal", replyText, corrections };
}

export default function App() {
  const [screen, setScreen] = useState("start");
  const [msgs, setMsgs] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [helpMode, setHelpMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [err, setErr] = useState(null);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,busy]);

  useEffect(()=>{
    const ta=taRef.current;
    if(!ta) return;
    ta.style.height="auto";
    ta.style.height=Math.min(ta.scrollHeight,130)+"px";
  },[input]);

  useEffect(()=>{
    if(!activeTooltip) return;
    const h=()=>setActiveTooltip(null);
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[activeTooltip]);

  const insertChar=(ch)=>{
    const ta=taRef.current;
    if(!ta){setInput(p=>p+ch);return;}
    const s=ta.selectionStart,e=ta.selectionEnd;
    setInput(input.slice(0,s)+ch+input.slice(e));
    setTimeout(()=>{ta.selectionStart=ta.selectionEnd=s+1;ta.focus();},0);
  };

  const callApi = async (apiMessages) => {
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-haiku-4-5-20251001",
        max_tokens:1000,
        system:SYSTEM,
        messages:apiMessages
      })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error?.message || "API error");
    return data.content[0].text;
  };

  const startChat = async () => {
    setScreen("chat");
    setBusy(true);
    setErr(null);
    try {
      const openers = [
        "Hola! Vamos a empezar. Hazme una pregunta o cuéntame algo.",
        "Hola! Cuéntame — ¿qué tal tu semana hasta ahora?",
        "Hola! ¿Hay algo que quieras contarme hoy?",
        "Hola! ¿Qué hiciste el fin de semana? Cuéntame algo interesante.",
        "Hola! Si pudieras visitar cualquier país del mundo, ¿cuál elegirías?",
        "Hola! ¿Cuál es tu película o serie favorita ahora mismo?",
        "Hola! ¿Prefieres la música en español o en inglés? ¿Por qué?",
        "Hola! ¿Qué es lo mejor que has comido últimamente?",
      ];
      const opener = openers[Math.floor(Math.random() * openers.length)];
      const opening = [{role:"user",content:opener}];
      const raw = await callApi(opening);
      setHistory([...opening,{role:"assistant",content:raw}]);
      setMsgs([{_type:"assistant",text:raw}]);
    } catch(e){ setErr(e.message); }
    setBusy(false);
    setTimeout(()=>taRef.current?.focus(),100);
  };

  const send = async () => {
    if(!input.trim()||busy) return;
    const userText = input.trim();
    const apiContent = helpMode ? `[EN]: ${userText}` : userText;
    setInput("");
    if(taRef.current) taRef.current.style.height="auto";
    setActiveTooltip(null);
    setErr(null);

    const newHistory = [...history,{role:"user",content:apiContent}];
    setHistory(newHistory);
    setMsgs(prev=>[...prev,{_type:"user",text:userText,corrections:[]}]);
    setBusy(true);
    setHelpMode(false);

    try {
      const raw = await callApi(newHistory);
      const parsed = parseReply(raw, userText);
      setHistory(prev=>[...prev,{role:"assistant",content:raw}]);

      if(parsed.type==="help") {
        setMsgs(prev=>[...prev.slice(0,-1),{_type:"help",english:userText,response:parsed.response}]);
      } else {
        if(parsed.corrections.length>0) {
          setMsgs(prev=>[...prev.slice(0,-1),{_type:"user",text:userText,corrections:parsed.corrections}]);
        }
        setMsgs(prev=>[...prev,{_type:"assistant",text:parsed.replyText}]);
      }
    } catch(e){ setErr(e.message); }
    setBusy(false);
    taRef.current?.focus();
  };

  const onKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};

  if(screen==="start") return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0f0820",overflow:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap'); *{box-sizing:border-box;} @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
      <StartScreen onStart={startChat}/>
    </div>
  );

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0f0820",fontFamily:"'Nunito','Segoe UI',sans-serif",overflow:"hidden"}}
      onClick={()=>activeTooltip&&setActiveTooltip(null)}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap'); *{box-sizing:border-box;} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,229,102,0.25);border-radius:2px} textarea{resize:none;font-family:inherit;} textarea:focus{outline:none;} textarea::placeholder{color:rgba(255,255,255,0.3);} @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>

      {/* Header */}
      <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"10px 14px 8px",borderBottom:"3px solid #000",background:"#FFE566",boxShadow:"0 3px 0 #000"}}>
        <div style={{width:"100%",maxWidth:580,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>☀️</div>
          <div>
            <div style={{fontFamily:"Bangers,sans-serif",fontSize:20,letterSpacing:1.5,color:"#1a0a2e",lineHeight:1}}>SEÑOR SOL</div>
            <div style={{fontSize:10,color:"#FF5533",fontWeight:800,letterSpacing:.5}}>● EN LÍNEA</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 14px 0",background:"#f5f0e8",backgroundImage:"radial-gradient(rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"20px 20px"}}>
        <div style={{width:"100%",maxWidth:580}}>
          {msgs.map((m,i)=>{
            if(m._type==="assistant") return <SolBubble key={i} text={m.text}/>;
            if(m._type==="help") return <HelpBubble key={i} item={m}/>;
            return <UserBubble key={i} item={m} idx={i} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}/>;
          })}
          {busy&&<DotsIndicator/>}
          {err&&<div style={{background:"rgba(255,60,60,0.1)",border:"2px solid rgba(255,80,80,0.3)",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#ff9090",wordBreak:"break-all"}}>{err}</div>}
          <div ref={endRef} style={{height:2}}/>
        </div>
      </div>

      {/* Input footer */}
      <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"7px 14px 13px",borderTop:"3px solid #000",background:"#1a0830"}}>
        <div style={{width:"100%",maxWidth:580}}>
          <div style={{display:"flex",gap:6,marginBottom:7}}>
            <button onClick={()=>{setHelpMode(false);setInput("");}}
              style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:!helpMode?"#FF5533":"rgba(255,255,255,0.1)",background:!helpMode?"rgba(255,85,51,0.18)":"transparent",color:!helpMode?"#FF8866":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              🇪🇸 Spanish
            </button>
            <button onClick={()=>{setHelpMode(true);setInput("");}}
              style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:helpMode?"#5599ff":"rgba(255,255,255,0.1)",background:helpMode?"rgba(85,153,255,0.18)":"transparent",color:helpMode?"#88aaff":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>
              🇬🇧 English help
            </button>
          </div>

          {!helpMode&&(
            <div style={{marginBottom:6}}>
              {[["á","é","í","ó","ú","ü","ñ","¿","¡"],["Á","É","Í","Ó","Ú","Ñ"]].map((row,ri)=>(
                <div key={ri} style={{display:"flex",gap:4,marginBottom:ri===0?4:0}}>
                  {row.map(ch=>(
                    <button key={ch} onClick={()=>insertChar(ch)}
                      style={{flex:1,background:"rgba(255,229,102,0.1)",border:"1px solid rgba(255,229,102,0.2)",borderRadius:6,padding:"4px 0",color:"#FFE566",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      {ch}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div style={{display:"flex",gap:7,alignItems:"flex-end",background:helpMode?"rgba(85,153,255,0.08)":"rgba(255,255,255,0.055)",border:helpMode?"2px solid rgba(85,153,255,0.3)":"2px solid rgba(255,229,102,0.18)",borderRadius:14,padding:"7px 7px 7px 12px"}}>
            <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
              placeholder={helpMode?"e.g. How do I say 'I had never seen anything like it'?":"Escribe en español..."}
              rows={1} spellCheck={helpMode} autoCorrect={helpMode?"on":"off"} autoComplete="off" autoCapitalize={helpMode?"on":"off"}
              style={{flex:1,background:"transparent",border:"none",color:"#fff",fontSize:15,lineHeight:1.6,caretColor:helpMode?"#88aaff":"#FFE566",minHeight:24,maxHeight:130,overflowY:"auto"}}/>
            <button onClick={send} disabled={!input.trim()||busy}
              style={{width:36,height:36,borderRadius:9,border:"2px solid #000",background:input.trim()&&!busy?(helpMode?"#5599ff":"#FF5533"):"rgba(255,255,255,0.08)",color:input.trim()&&!busy?"#fff":"rgba(255,255,255,0.2)",fontSize:17,cursor:input.trim()&&!busy?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:input.trim()&&!busy?"2px 2px 0 #000":"none"}}>→</button>
          </div>
          <div style={{textAlign:"center",marginTop:4,fontSize:10,color:"rgba(255,255,255,0.16)"}}>
            {helpMode?"Autocorrect on · Enter to send":"Autocorrect off · Enter to send · Shift+Enter for new line"}
          </div>
        </div>
      </div>
    </div>
  );
}
