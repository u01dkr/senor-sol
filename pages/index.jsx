import { useState, useRef, useEffect } from "react";

// ── Teacher / chat config ─────────────────────────────────────────────────────
const SOL_SYSTEM = `You are Senor Sol, a cool and friendly Spanish tutor for teenagers aged 12-15. Like a knowledgeable older friend who speaks Spanish fluently. Warm and encouraging, never babyish.

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
HELP:{"type":"translate","spanish":"the Spanish translation here","notes":"key word = meaning · key word = meaning"}
or HELP:{"type":"explain","answer":"the Spanish phrase here","breakdown":"word = meaning · word = meaning"}
Then nothing else.`;

const CHAT_OPENERS = [
  "¡Hola! ¿Qué hiciste el fin de semana? Cuéntame algo interesante.",
  "¡Hola! Si pudieras visitar cualquier país del mundo, ¿cuál elegirías?",
  "¡Hola! ¿Cuál es tu película o serie favorita ahora mismo?",
  "¡Hola! ¿Prefieres la música en español o en inglés? ¿Por qué?",
  "¡Hola! ¿Qué es lo mejor que has comido últimamente?",
  "¡Hola! ¿Qué te gusta hacer cuando no estás en el cole?",
  "¡Hola! ¿Has viajado a algún sitio interesante últimamente?",
  "¡Hola! ¿Cuál es tu canción favorita ahora mismo?",
];

const SPECIAL_CHARS = [
  ["á","é","í","ó","ú","ü","ñ","¿","¡"],
  ["Á","É","Í","Ó","Ú","Ñ"]
];

const TENSE_KEYS = ["presente","indefinido","imperfecto","futuro"];

// ── Shared helpers ────────────────────────────────────────────────────────────
function parseReply(raw) {
  if (raw.startsWith("HELP:")) {
    try { return { type:"help", response:JSON.parse(raw.slice(5).trim()) }; } catch(e) {}
  }
  let corrections = [], replyText = raw;
  const m = raw.match(/^CORRECTIONS:(\{.*\})/m);
  if (m) {
    try { corrections = JSON.parse(m[1]).corrections || []; } catch(e) {}
    replyText = raw.replace(/^CORRECTIONS:\{.*\}\n?/m,"").trim();
  }
  return { type:"normal", replyText, corrections };
}

// ── Chat components ───────────────────────────────────────────────────────────
function Tail({ side, color }) {
  if (side==="right") return (
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
    <div style={{position:"fixed",bottom:110,left:"50%",transform:"translateX(-50%)",background:"#1a0a2e",border:"3px solid #FFE566",borderRadius:14,padding:"11px 15px",fontSize:13.5,color:"#FFE566",zIndex:200,boxShadow:"4px 4px 0 #000",maxWidth:"min(310px,86vw)",lineHeight:1.55,textAlign:"center",fontWeight:600}}>
      ✏️ {reason}
      <div style={{marginTop:5,fontSize:11,color:"rgba(255,229,102,0.45)",fontWeight:400,fontStyle:"italic"}}>tap anywhere to close</div>
    </div>
  );
}

function Chip({ wrong, right, reason, id, activeId, setActive }) {
  const open = activeId===id;
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
  const inlines=(item.corrections||[]).filter(c=>c.type==="inline");
  const notes=(item.corrections||[]).filter(c=>c.type==="note");
  const hlPhrases=notes.map(c=>c.highlight);
  let segs=[{type:"text",value:item.text}];
  inlines.forEach((c,ci)=>{
    segs=segs.flatMap(seg=>{
      if(seg.type!=="text") return [seg];
      const i=seg.value.indexOf(c.wrong);
      if(i===-1) return [seg];
      return [{type:"text",value:seg.value.slice(0,i)},{type:"chip",c,id:idx+"-"+ci},{type:"text",value:seg.value.slice(i+c.wrong.length)}];
    });
  });
  return (
    <div style={{marginBottom:16,display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
      <div style={{position:"relative",maxWidth:"74%",background:"#FF5533",border:"3px solid #000",borderRadius:16,borderBottomRightRadius:3,padding:"9px 13px",boxShadow:"3px 3px 0 #000",color:"#fff",fontSize:15,lineHeight:1.65,wordBreak:"break-word"}}>
        <Tail side="right" color="#FF5533"/>
        {segs.map((seg,i)=>{
          if(seg.type==="chip") return <Chip key={i} {...seg.c} id={seg.id} activeId={activeTooltip} setActive={setActiveTooltip}/>;
          let val=seg.value;
          for(const hl of hlPhrases){
            if(val.includes(hl)){
              const parts=val.split(hl);
              return parts.map((p,j)=><span key={i+"-"+j}>{p}{j<parts.length-1&&<span style={{borderBottom:"2px dotted #FFE566",paddingBottom:1}}>{hl}</span>}</span>);
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

function TutorBubble({ text }) {
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
  const r=item.response;
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
          {r.type==="translate"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>In Spanish</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"Bangers,sans-serif",letterSpacing:.5}}>"{r.spanish||r.irish}"</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{r.notes}</div>
          </>}
          {r.type==="explain"&&<>
            <div style={{fontSize:10,fontWeight:800,color:"#7755aa",marginBottom:4,letterSpacing:.8,textTransform:"uppercase"}}>How to say it</div>
            <div style={{fontSize:16,color:"#1a0a2e",fontWeight:800,marginBottom:6,fontFamily:"Bangers,sans-serif",letterSpacing:.5}}>{r.answer}</div>
            <div style={{fontSize:12.5,color:"#555",fontStyle:"italic",lineHeight:1.5}}>{r.breakdown}</div>
          </>}
        </div>
      </div>
    </div>
  );
}

function ChatDots() {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,boxShadow:"2px 2px 0 #000"}}>☀️</div>
      <div style={{background:"#1ad9a0",border:"3px solid #000",borderRadius:16,borderBottomLeftRadius:3,padding:"10px 16px",boxShadow:"3px 3px 0 #000",display:"flex",gap:5,alignItems:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#000",animation:"dot 1.2s "+(i*0.2)+"s ease-in-out infinite"}}/>)}
      </div>
    </div>
  );
}

// ── Noticias components ───────────────────────────────────────────────────────
function AudioBar({ speaking, onPlay, onStop }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(255,229,102,0.08)",border:"2px solid rgba(255,229,102,0.2)",borderRadius:12,padding:"8px 14px"}}>
      <button onClick={speaking?onStop:onPlay} style={{width:36,height:36,borderRadius:"50%",background:speaking?"#FF5533":"#FFE566",border:"2px solid #000",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"2px 2px 0 #000",flexShrink:0}}>
        {speaking?"⏹":"▶"}
      </button>
      <div>
        <div style={{fontSize:12,fontWeight:800,color:"#FFE566",letterSpacing:.5}}>{speaking?"REPRODUCIENDO...":"ESCUCHAR EN ESPAÑOL"}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>{speaking?"tap to stop":"tap to hear the article read aloud"}</div>
      </div>
      {speaking&&(
        <div style={{marginLeft:"auto",display:"flex",gap:3,alignItems:"center"}}>
          {[1,1.4,0.8,1.2,0.6].map((h,i)=>(
            <div key={i} style={{width:3,borderRadius:2,background:"#FF5533",height:16*h,animation:"wave 0.8s "+(i*0.1)+"s ease-in-out infinite alternate"}}/>
          ))}
        </div>
      )}
    </div>
  );
}

function VocabCard({ item }) {
  const [open,setOpen]=useState(false);
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{background:open?"#FFE566":"rgba(255,255,255,0.06)",border:"2px solid "+(open?"#000":"rgba(255,255,255,0.12)"),borderRadius:12,padding:"10px 13px",cursor:"pointer",boxShadow:open?"3px 3px 0 #000":"none",transition:"all 0.18s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"Bangers,sans-serif",fontSize:18,letterSpacing:.5,color:open?"#1a0a2e":"#fff"}}>{item.word}</span>
        <span style={{fontSize:11,color:open?"#1a0a2e":"rgba(255,255,255,0.3)",fontWeight:700}}>{open?"▲":"▼"}</span>
      </div>
      {open&&<div style={{marginTop:6,borderTop:"1px solid rgba(0,0,0,0.15)",paddingTop:6}}>
        <div style={{fontSize:14,fontWeight:800,color:"#1a0a2e",marginBottom:3}}>{item.translation}</div>
        <div style={{fontSize:12.5,color:"#444",fontStyle:"italic"}}>"{item.example}"</div>
      </div>}
    </div>
  );
}

function VerbPage({ verb, onBack }) {
  const [tense,setTense]=useState("presente");
  const [tipOpen,setTipOpen]=useState(null);
  const td=verb.tenses[tense];
  const hasIrr=td.rows.some(r=>r.irregular);
  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
      <button onClick={onBack} style={{background:"transparent",border:"2px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"5px 12px",color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>← Vocabulario</button>
      <div style={{background:"#FFE566",border:"3px solid #000",borderRadius:16,padding:"14px 18px",boxShadow:"4px 4px 0 #000",marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:800,color:"#FF5533",letterSpacing:1,marginBottom:2}}>VERBO DEL ARTÍCULO</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:40,color:"#1a0a2e",letterSpacing:1,lineHeight:1,marginBottom:3}}>{verb.infinitive}</div>
        <div style={{fontSize:14,fontWeight:700,color:"#1a0a2e",marginBottom:2}}>{verb.meaning}</div>
        <div style={{fontSize:11.5,color:"rgba(0,0,0,0.45)",fontStyle:"italic"}}>{verb.type}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:10}}>
        {TENSE_KEYS.map(k=>{
          const hasI=verb.tenses[k].rows.some(r=>r.irregular);
          return (
            <button key={k} onClick={()=>{setTense(k);setTipOpen(null);}} style={{padding:"7px 6px",borderRadius:8,border:"2px solid",borderColor:tense===k?"#FFE566":"rgba(255,255,255,0.1)",background:tense===k?"rgba(255,229,102,0.12)":"transparent",color:tense===k?"#FFE566":"rgba(255,255,255,0.35)",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              {verb.tenses[k].label}
              {hasI&&<span style={{background:"#FF5533",color:"#fff",fontSize:9,fontWeight:800,borderRadius:10,padding:"1px 5px"}}>!</span>}
            </button>
          );
        })}
      </div>
      <div style={{background:hasIrr?"rgba(255,85,51,0.1)":"rgba(26,217,160,0.08)",border:"1px solid "+(hasIrr?"rgba(255,85,51,0.3)":"rgba(26,217,160,0.2)"),borderRadius:9,padding:"6px 11px",marginBottom:10,fontSize:12,color:hasIrr?"#FF8866":"#1ad9a0",fontWeight:700}}>
        {hasIrr?"⚠ "+td.note:"✓ "+td.note}
      </div>
      <div style={{background:"#fff",border:"3px solid #000",borderRadius:14,overflow:"hidden",boxShadow:"3px 3px 0 #000",marginBottom:12}}>
        {td.rows.map((row,i)=>(
          <div key={i} style={{borderBottom:i<5?"1px solid rgba(0,0,0,0.07)":"none",background:i%2===0?"#fff":"#fafafa"}}>
            <div style={{display:"flex",alignItems:"center",padding:"9px 14px"}}>
              <span style={{width:88,fontSize:12.5,fontWeight:800,color:"#999",flexShrink:0}}>{row.pronoun}</span>
              <span style={{fontFamily:"Bangers,sans-serif",fontSize:21,color:"#1a0a2e",letterSpacing:.5,flex:1}}>{row.form}</span>
              {row.irregular&&<button onClick={()=>setTipOpen(tipOpen===i?null:i)} style={{background:"#FF5533",border:"none",borderRadius:10,padding:"2px 7px",fontSize:10,fontWeight:800,color:"#fff",cursor:"pointer",flexShrink:0}}>{tipOpen===i?"▲":"⚠"}</button>}
            </div>
            {row.irregular&&tipOpen===i&&(
              <div style={{background:"rgba(255,85,51,0.08)",borderTop:"1px solid rgba(255,85,51,0.2)",padding:"7px 14px 9px",fontSize:12.5,color:"#FF8866",lineHeight:1.5}}>💡 {row.reason}</div>
            )}
          </div>
        ))}
      </div>
      <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"9px 13px",marginBottom:12,fontSize:14,color:"rgba(255,255,255,0.7)",fontStyle:"italic",lineHeight:1.55}}>"{td.example}"</div>
      <div style={{background:"rgba(255,107,53,0.12)",border:"2px solid rgba(255,107,53,0.3)",borderRadius:12,padding:"10px 13px",marginBottom:verb.relatedVerbs?.length?12:0}}>
        <div style={{fontSize:11,fontWeight:800,color:"#FF8866",marginBottom:4,letterSpacing:.5}}>💡 SOL'S TIP</div>
        <div style={{fontSize:13.5,color:"rgba(255,255,255,0.7)",lineHeight:1.55}}>{verb.tip}</div>
      </div>
      {verb.relatedVerbs?.length>0&&(
        <div style={{background:"rgba(255,229,102,0.06)",border:"1px solid rgba(255,229,102,0.2)",borderRadius:12,padding:"10px 13px"}}>
          <div style={{fontSize:11,fontWeight:800,color:"#FFE566",marginBottom:6,letterSpacing:.5}}>VERBOS RELACIONADOS</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {verb.relatedVerbs.map(v=><span key={v} style={{background:"rgba(255,229,102,0.1)",border:"1px solid rgba(255,229,102,0.25)",borderRadius:8,padding:"3px 9px",fontSize:12.5,color:"#FFE566",fontWeight:700}}>{v}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function QuizView({ quiz, onBack, categoryColor }) {
  const [current,setCurrent]=useState(0);
  const [selected,setSelected]=useState(null);
  const [answers,setAnswers]=useState([]);
  const [done,setDone]=useState(false);
  const q=quiz[current];
  const score=answers.filter((a,i)=>a===quiz[i].answer).length;

  const next=()=>{
    const na=[...answers,selected];
    setAnswers(na);
    if(current<quiz.length-1){setCurrent(c=>c+1);setSelected(null);}
    else setDone(true);
  };

  if(done){
    const pct=Math.round((score/quiz.length)*100);
    const medal=pct===100?"🏆":pct>=80?"🥈":pct>=60?"🥉":"📚";
    return (
      <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
        <button onClick={onBack} style={{background:"transparent",border:"2px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"5px 12px",color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:16}}>← Artículo</button>
        <div style={{background:categoryColor,border:"3px solid #000",borderRadius:16,padding:"20px",textAlign:"center",boxShadow:"4px 4px 0 #000",marginBottom:16}}>
          <div style={{fontSize:48,marginBottom:8}}>{medal}</div>
          <div style={{fontFamily:"Bangers,sans-serif",fontSize:36,color:"#fff",letterSpacing:1}}>{score}/{quiz.length} CORRECTAS</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.8)",marginTop:4,fontWeight:700}}>{pct===100?"¡Perfecto!":pct>=80?"¡Muy bien!":pct>=60?"¡Bien!":"¡Sigue practicando!"}</div>
        </div>
        {quiz.map((q,i)=>(
          <div key={i} style={{background:answers[i]===q.answer?"rgba(26,217,160,0.1)":"rgba(255,85,51,0.1)",border:"2px solid "+(answers[i]===q.answer?"rgba(26,217,160,0.3)":"rgba(255,85,51,0.3)"),borderRadius:12,padding:"10px 13px",marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:800,color:answers[i]===q.answer?"#1ad9a0":"#FF5533",marginBottom:4}}>{answers[i]===q.answer?"✓ CORRECTA":"✗ INCORRECTA"}</div>
            <div style={{fontSize:13.5,color:"#fff",marginBottom:4,lineHeight:1.5}}>{q.question}</div>
            <div style={{fontSize:12.5,color:"rgba(255,255,255,0.5)",fontStyle:"italic",lineHeight:1.5}}>{q.explanation}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 24px"}}>
      <button onClick={onBack} style={{background:"transparent",border:"2px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"5px 12px",color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>← Artículo</button>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.4)",letterSpacing:.5}}>PREGUNTA {current+1} DE {quiz.length}</span>
          <span style={{fontSize:11,fontWeight:800,color:categoryColor}}>{q.type==="truefalse"?"VERDADERO/FALSO":q.type==="vocab"?"VOCABULARIO":"COMPRENSIÓN"}</span>
        </div>
        <div style={{height:6,background:"rgba(255,255,255,0.1)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",background:categoryColor,borderRadius:3,width:((current+1)/quiz.length*100)+"%",transition:"width 0.3s"}}/>
        </div>
      </div>
      <div style={{background:"#fff",border:"3px solid #000",borderRadius:14,padding:"16px",boxShadow:"3px 3px 0 #000",marginBottom:14}}>
        <div style={{fontSize:16,fontWeight:800,color:"#1a0a2e",lineHeight:1.5}}>{q.question}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
        {q.options.map((opt,i)=>{
          let bg="rgba(255,255,255,0.06)",border="rgba(255,255,255,0.12)",color="#fff";
          if(selected!==null){
            if(i===q.answer){bg="rgba(26,217,160,0.15)";border="#1ad9a0";color="#1ad9a0";}
            else if(i===selected){bg="rgba(255,85,51,0.15)";border="#FF5533";color="#FF5533";}
          } else if(i===selected){bg="rgba(255,229,102,0.12)";border="#FFE566";color="#FFE566";}
          return (
            <button key={i} onClick={()=>selected===null&&setSelected(i)} style={{background:bg,border:"2px solid "+border,borderRadius:11,padding:"10px 14px",color,fontSize:14,fontWeight:700,cursor:selected===null?"pointer":"default",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s",lineHeight:1.4}}>
              <span style={{fontFamily:"Bangers,sans-serif",fontSize:16,marginRight:8,opacity:.6}}>{["A","B","C","D"][i]}</span>{opt}
            </button>
          );
        })}
      </div>
      {selected!==null&&(
        <div>
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 13px",marginBottom:12,fontSize:13.5,color:"rgba(255,255,255,0.6)",lineHeight:1.55,fontStyle:"italic"}}>💡 {q.explanation}</div>
          <button onClick={next} style={{width:"100%",background:categoryColor,border:"3px solid #000",borderRadius:12,padding:"12px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:1.5,boxShadow:"3px 3px 0 #000"}}>
            {current<quiz.length-1?"SIGUIENTE →":"VER RESULTADOS →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Tappable article text ─────────────────────────────────────────────────────
function WordPopup({ popup, onClose }) {
  if (!popup) return null;
  const { word, def, rect } = popup;
  // Position above the word if possible, otherwise below
  const topPos = rect.top > 160 ? rect.top - 10 : rect.bottom + 10;
  const fromTop = rect.top > 160;
  return (
    <div onClick={e=>e.stopPropagation()} style={{
      position:"fixed",
      top: fromTop ? "auto" : topPos,
      bottom: fromTop ? (window.innerHeight - rect.top + 10) : "auto",
      left:"50%", transform:"translateX(-50%)",
      background:"#1a0a2e", border:"3px solid #FFE566",
      borderRadius:14, padding:"12px 15px",
      zIndex:300, boxShadow:"4px 4px 0 #000",
      maxWidth:"min(300px,88vw)", width:"88vw"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
        <div>
          <span style={{fontFamily:"Bangers,sans-serif",fontSize:22,color:"#FFE566",letterSpacing:.5}}>{word}</span>
          {def&&<span style={{fontSize:11,color:"rgba(255,229,102,0.5)",marginLeft:8,fontStyle:"italic"}}>{def.partOfSpeech}</span>}
        </div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",fontSize:18,cursor:"pointer",lineHeight:1,padding:"0 0 0 8px"}}>×</button>
      </div>
      {def ? (
        <>
          <div style={{fontSize:13.5,color:"#fff",lineHeight:1.5,marginBottom:6}}>{def.definition}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",fontStyle:"italic",lineHeight:1.5}}>"{def.example}"</div>
        </>
      ) : (
        <div style={{fontSize:13,color:"rgba(255,229,102,0.6)"}}>Looking up...</div>
      )}
    </div>
  );
}

function TappableParagraph({ text, onWordTap, tappedWord }) {
  // Split into words keeping punctuation attached
  const tokens = text.split(/(\s+)/);
  return (
    <p style={{fontSize:15,lineHeight:1.85,color:"#1a0a2e",margin:0,fontFamily:"Nunito,sans-serif",wordBreak:"break-word"}}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
        // Strip punctuation to get the core word
        const clean = token.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, "");
        if (!clean || clean.length < 2) return <span key={i}>{token}</span>;
        const isActive = tappedWord === clean.toLowerCase();
        return (
          <span key={i}
            onClick={e=>{e.stopPropagation();onWordTap(clean, text, e);}}
            style={{
              cursor:"pointer",
              background: isActive ? "rgba(255,229,102,0.25)" : "transparent",
              borderRadius:3,
              padding:"1px 0",
              transition:"background 0.15s"
            }}>
            {token}
          </span>
        );
      })}
    </p>
  );
}

function StoryView({ story, onBack }) {
  const [speaking,setSpeaking]=useState(false);
  const [showEnglish,setShowEnglish]=useState(false);
  const [activeTab,setActiveTab]=useState("article");
  const [showVerb,setShowVerb]=useState(false);
  const [showQuiz,setShowQuiz]=useState(false);
  const [wordPopup,setWordPopup]=useState(null);
  const defCache=useRef({});

  const handleWordTap=async(word, sentence, e)=>{
    const rect=e.target.getBoundingClientRect();
    const lw=word.toLowerCase();
    if(wordPopup?.word===word){setWordPopup(null);return;}
    // Show loading popup immediately
    setWordPopup({word,def:null,rect:{top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right}});
    // Check cache
    if(defCache.current[lw]){
      setWordPopup({word,def:defCache.current[lw],rect:{top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right}});
      return;
    }
    try {
      const res=await fetch("/api/define",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({word,sentence})});
      const def=await res.json();
      defCache.current[lw]=def;
      setWordPopup(prev=>prev?.word===word?{...prev,def}:prev);
    } catch(err){
      setWordPopup(prev=>prev?.word===word?{...prev,def:{partOfSpeech:"",definition:"Could not load definition.",example:""}}:prev);
    }
  };

  const speak=()=>{
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const sentences=story.body.split(/(?<=[.!?])\s+/);
    let i=0;
    const next=()=>{
      if(i>=sentences.length){setSpeaking(false);return;}
      const utt=new SpeechSynthesisUtterance(sentences[i]);
      utt.lang="es-ES";utt.rate=0.70;utt.pitch=1.05;
      const voices=window.speechSynthesis.getVoices();
      const v=voices.find(v=>v.lang.startsWith("es")&&v.name.toLowerCase().includes("google"))||voices.find(v=>v.lang.startsWith("es"));
      if(v) utt.voice=v;
      utt.onend=()=>{i++;setTimeout(next,220);};
      utt.onerror=()=>setSpeaking(false);
      window.speechSynthesis.speak(utt);
    };
    setSpeaking(true);next();
  };

  const stop=()=>{window.speechSynthesis?.cancel();setSpeaking(false);};

  if(showVerb) return <VerbPage verb={story.verb} onBack={()=>setShowVerb(false)}/>;
  if(showQuiz) return <QuizView quiz={story.quiz} onBack={()=>setShowQuiz(false)} categoryColor={story.categoryColor}/>;

  return (
    <div style={{flex:1,overflowY:"auto",padding:"14px 14px 20px"}}>
      <button onClick={()=>{stop();onBack();}} style={{background:"transparent",border:"2px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"5px 12px",color:"rgba(255,255,255,0.5)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>← Noticias</button>
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <span style={{background:story.categoryColor,border:"2px solid #000",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:800,color:"#fff",fontFamily:"Bangers,sans-serif",letterSpacing:1}}>{story.category}</span>
        <span style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.5)"}}>Nivel {story.level}</span>
        {story.source&&<span style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"2px 10px",fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600}}>{story.source}</span>}
      </div>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:26,letterSpacing:.5,color:"#fff",lineHeight:1.2,marginBottom:12}}>{story.headline}</div>
      <div style={{marginBottom:12}}><AudioBar speaking={speaking} onPlay={speak} onStop={stop}/></div>
      <div style={{display:"flex",gap:4,marginBottom:14}}>
        {[["article","📰 Artículo"],["vocab","📚 Vocabulario"]].map(([id,label])=>(
          <button key={id} onClick={()=>{setActiveTab(id);setWordPopup(null);}} style={{flex:1,padding:"7px 0",borderRadius:8,border:"2px solid",borderColor:activeTab===id?"#FFE566":"rgba(255,255,255,0.1)",background:activeTab===id?"rgba(255,229,102,0.12)":"transparent",color:activeTab===id?"#FFE566":"rgba(255,255,255,0.35)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>{label}</button>
        ))}
      </div>

      {activeTab==="article"&&(
        <div>
          <div onClick={()=>setWordPopup(null)} style={{background:"#fff",border:"3px solid #000",borderRadius:14,padding:"16px",boxShadow:"3px 3px 0 #000",marginBottom:12,position:"relative"}}>
            <div style={{fontSize:11,fontWeight:800,color:"rgba(0,0,0,0.25)",marginBottom:8,letterSpacing:.5}}>TAP ANY WORD FOR A DEFINITION</div>
            {story.body.split("\n\n").map((para,i)=>(
              <div key={i} style={{marginTop:i===0?0:12}}>
                <TappableParagraph text={para} onWordTap={handleWordTap} tappedWord={wordPopup?.word?.toLowerCase()}/>
              </div>
            ))}
            <WordPopup popup={wordPopup} onClose={()=>setWordPopup(null)}/>
          </div>
          <button onClick={()=>setShowEnglish(e=>!e)} style={{width:"100%",background:showEnglish?"rgba(255,255,255,0.08)":"transparent",border:"2px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"8px 14px",color:"rgba(255,255,255,0.45)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",marginBottom:showEnglish?8:12}}>
            {showEnglish?"▲ Hide English translation":"▼ Show English translation"}
          </button>
          {showEnglish&&(
            <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"14px",marginBottom:12}}>
              {story.english.split("\n\n").map((para,i)=>(
                <p key={i} style={{fontSize:14,lineHeight:1.7,color:"rgba(255,255,255,0.5)",margin:i===0?0:"10px 0 0",fontFamily:"Nunito,sans-serif",fontStyle:"italic"}}>{para}</p>
              ))}
            </div>
          )}
          <div onClick={()=>setShowQuiz(true)} style={{background:"linear-gradient(135deg,#7B5EA7,#9B7EC8)",border:"3px solid #000",borderRadius:14,padding:"12px 16px",cursor:"pointer",boxShadow:"3px 3px 0 #000",display:"flex",alignItems:"center",gap:12}}
            onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="1px 1px 0 #000";}}
            onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="3px 3px 0 #000";}}>
            <div style={{fontSize:26}}>🧠</div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.7)",letterSpacing:.8}}>COMPRENSIÓN</div>
              <div style={{fontFamily:"Bangers,sans-serif",fontSize:20,color:"#fff",letterSpacing:1,lineHeight:1}}>Test yourself</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{story.quiz?.length||5} preguntas sobre el artículo</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:20,color:"rgba(255,255,255,0.6)"}}>→</div>
          </div>
        </div>
      )}

      {activeTab==="vocab"&&(
        <div>
          <div onClick={()=>setShowVerb(true)} style={{background:"linear-gradient(135deg,#FF5533,#FF8C5A)",border:"3px solid #000",borderRadius:14,padding:"12px 16px",marginBottom:14,cursor:"pointer",boxShadow:"3px 3px 0 #000",display:"flex",alignItems:"center",gap:12}}
            onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="1px 1px 0 #000";}}
            onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="3px 3px 0 #000";}}>
            <div style={{fontSize:26}}>🔤</div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.7)",letterSpacing:.8}}>VERBO DEL ARTÍCULO</div>
              <div style={{fontFamily:"Bangers,sans-serif",fontSize:22,color:"#fff",letterSpacing:1,lineHeight:1}}>{story.verb?.infinitive}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>{story.verb?.meaning} · 4 tenses</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:20,color:"rgba(255,255,255,0.6)"}}>→</div>
          </div>
          <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.35)",letterSpacing:.5,marginBottom:8}}>VOCABULARIO CLAVE · TAP TO REVEAL</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {(story.vocab||[]).map((item,i)=><VocabCard key={i} item={item}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

function NoticiasSpinner() {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:24}}>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:48,animation:"spin 2s linear infinite"}}>📰</div>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:20,color:"#FFE566",letterSpacing:1}}>CARGANDO NOTICIAS...</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>Fetching and translating today's news</div>
    </div>
  );
}

function StoryCard({ story, onOpen }) {
  return (
    <div onClick={()=>onOpen(story)} style={{background:"#fff",border:"3px solid #000",borderRadius:16,overflow:"hidden",boxShadow:"4px 4px 0 #000",cursor:"pointer",marginBottom:16}}
      onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="2px 2px 0 #000";}}
      onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";}}>
      <div style={{background:story.categoryColor||"#555",padding:"5px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"Bangers,sans-serif",fontSize:13,letterSpacing:1.5,color:"#fff"}}>{story.category||"MUNDO"}</span>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {story.source&&<span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.6)"}}>{story.source}</span>}
          <span style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.7)",background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"1px 7px"}}>{story.level||"B1"}</span>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:19,letterSpacing:.5,color:"#1a0a2e",lineHeight:1.2,marginBottom:6}}>{story.headline}</div>
        <div style={{fontSize:13.5,color:"#444",lineHeight:1.55}}>{story.intro}</div>
        <div style={{marginTop:8,fontSize:11,fontWeight:800,color:story.categoryColor||"#555"}}>LEER MÁS →</div>
      </div>
    </div>
  );
}

// ── Home screen ───────────────────────────────────────────────────────────────
function HomeScreen({ onChat, onNoticias }) {
  return (
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"30px 20px",gap:24}}>
      <div style={{fontFamily:"Bangers,sans-serif",fontSize:18,color:"rgba(255,255,255,0.35)",letterSpacing:3,textAlign:"center"}}>¿QUÉ QUIERES HACER HOY?</div>

      {/* Chat card */}
      <div style={{background:"#FFE566",border:"4px solid #000",borderRadius:18,padding:"22px 24px 20px",width:"100%",maxWidth:340,boxShadow:"6px 6px 0 #000",position:"relative"}}>
        <div style={{position:"absolute",top:-20,right:-16,width:54,height:54,background:"#FF5533",border:"3px solid #000",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"3px 3px 0 #000",transform:"rotate(10deg)"}}>🇪🇸</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:38,lineHeight:1,color:"#1a0a2e",letterSpacing:1.5,marginBottom:2}}>SEÑOR SOL</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:16,color:"#FF5533",letterSpacing:3,marginBottom:14}}>CHAT TUTOR</div>
        <div style={{background:"#fff",border:"3px solid #000",borderRadius:12,padding:"8px 12px",marginBottom:16,fontSize:13,lineHeight:1.5,color:"#1a0a2e",fontWeight:700,position:"relative"}}>
          Chat in Spanish. Make mistakes. Learn fast! ⚡
          <div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"12px solid #000"}}/>
          <div style={{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"10px solid #fff"}}/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:18}}>
          {["✏️ Corrections","📚 New vocab","🔤 Verb focus","🇬🇧 English help"].map(f=>(
            <span key={f} style={{background:"#FF5533",border:"2px solid #000",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#fff",boxShadow:"2px 2px 0 #000"}}>{f}</span>
          ))}
        </div>
        <button onClick={onChat}
          onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="2px 2px 0 #000";}}
          onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #000";}}
          style={{background:"#FF5533",border:"4px solid #000",borderRadius:14,padding:"13px 0",width:"100%",color:"#fff",fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:2,boxShadow:"4px 4px 0 #000"}}>
          ¡EMPEZAR! →
        </button>
      </div>

      {/* Noticias card */}
      <div style={{background:"#1a0830",border:"4px solid #FFE566",borderRadius:18,padding:"22px 24px 20px",width:"100%",maxWidth:340,boxShadow:"6px 6px 0 #FFE566",position:"relative"}}>
        <div style={{position:"absolute",top:-20,right:-16,width:54,height:54,background:"#FFE566",border:"3px solid #000",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"3px 3px 0 #000",transform:"rotate(-8deg)"}}>📰</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:38,lineHeight:1,color:"#FFE566",letterSpacing:1.5,marginBottom:2}}>NOTICIAS</div>
        <div style={{fontFamily:"Bangers,sans-serif",fontSize:16,color:"rgba(255,229,102,0.6)",letterSpacing:3,marginBottom:14}}>NEWS IN SPANISH</div>
        <div style={{background:"rgba(255,229,102,0.1)",border:"2px solid rgba(255,229,102,0.3)",borderRadius:12,padding:"8px 12px",marginBottom:16,fontSize:13,lineHeight:1.5,color:"rgba(255,255,255,0.7)",fontWeight:600,position:"relative"}}>
          Real news. Translated. With vocab, verbs and quizzes. ⚡
          <div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"10px solid transparent",borderRight:"10px solid transparent",borderTop:"12px solid rgba(255,229,102,0.3)"}}/>
          <div style={{position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"10px solid #1a0830"}}/>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:18}}>
          {["🌍 Real news","🔊 Audio","🧠 Quiz","🔤 Verbs"].map(f=>(
            <span key={f} style={{background:"rgba(255,229,102,0.15)",border:"2px solid rgba(255,229,102,0.4)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:800,color:"#FFE566",boxShadow:"2px 2px 0 rgba(0,0,0,0.3)"}}>{f}</span>
          ))}
        </div>
        <button onClick={onNoticias}
          onMouseDown={e=>{e.currentTarget.style.transform="translate(2px,2px)";e.currentTarget.style.boxShadow="2px 2px 0 rgba(255,229,102,0.5)";}}
          onMouseUp={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="4px 4px 0 #FFE566";}}
          style={{background:"#FFE566",border:"4px solid #000",borderRadius:14,padding:"13px 0",width:"100%",color:"#1a0a2e",fontWeight:800,fontSize:20,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:2,boxShadow:"4px 4px 0 #FFE566"}}>
          LEER NOTICIAS →
        </button>
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home"); // home | chat | noticias
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [spanishInput, setSpanishInput] = useState("");
  const [englishInput, setEnglishInput] = useState("");
  const [helpMode, setHelpMode] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [chatErr, setChatErr] = useState(null);

  // Noticias state
  const [articles, setArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsErr, setNewsErr] = useState(null);
  const [openStory, setOpenStory] = useState(null);
  const [translating, setTranslating] = useState(null); // article id being translated

  const endRef = useRef(null);
  const taRef = useRef(null);

  const currentInput = helpMode ? englishInput : spanishInput;
  const setCurrentInput = helpMode ? setEnglishInput : setSpanishInput;

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[chatMsgs,chatBusy]);

  useEffect(()=>{
    const ta=taRef.current; if(!ta) return;
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

  // ── Chat API ────────────────────────────────────────────────────────────────
  const callChat = async (msgs) => {
    const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1000,system:SOL_SYSTEM,messages:msgs})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error?.message||"API error");
    return data.content[0].text;
  };

  const startChat = () => {
    const opener = CHAT_OPENERS[Math.floor(Math.random()*CHAT_OPENERS.length)];
    setChatHistory([{role:"assistant",content:opener}]);
    setChatMsgs([{_type:"tutor",text:opener}]);
    setSpanishInput(""); setEnglishInput("");
    setHelpMode(false); setChatErr(null);
    setScreen("chat");
    setTimeout(()=>taRef.current?.focus(),100);
  };

  const sendChat = async () => {
    if(!currentInput.trim()||chatBusy) return;
    const userText=currentInput.trim();
    const apiContent=helpMode?"[EN]: "+userText:userText;
    setCurrentInput("");
    if(taRef.current) taRef.current.style.height="auto";
    setActiveTooltip(null); setChatErr(null);
    const newHistory=[...chatHistory,{role:"user",content:apiContent}];
    setChatHistory(newHistory);
    setChatMsgs(prev=>[...prev,{_type:"user",text:userText,corrections:[]}]);
    setChatBusy(true); setHelpMode(false);
    try {
      const raw=await callChat(newHistory);
      const parsed=parseReply(raw);
      setChatHistory(prev=>[...prev,{role:"assistant",content:raw}]);
      if(parsed.type==="help"){
        setChatMsgs(prev=>[...prev.slice(0,-1),{_type:"help",english:userText,response:parsed.response}]);
      } else {
        if(parsed.corrections.length>0){
          setChatMsgs(prev=>[...prev.slice(0,-1),{_type:"user",text:userText,corrections:parsed.corrections}]);
        }
        setChatMsgs(prev=>[...prev,{_type:"tutor",text:parsed.replyText}]);
      }
    } catch(e){ setChatErr(e.message); }
    setChatBusy(false); taRef.current?.focus();
  };

  // ── Noticias API ────────────────────────────────────────────────────────────
  const loadNoticias = async () => {
    setScreen("noticias"); setNewsLoading(true); setNewsErr(null); setOpenStory(null);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"News fetch failed");
      // Show raw articles immediately, translate on demand
      setArticles(data.articles.map(a=>({...a,translated:false})));
    } catch(e){ setNewsErr(e.message); }
    setNewsLoading(false);
  };

  const openArticle = async (article) => {
    if(article.translated){ setOpenStory(article); return; }
    setTranslating(article.id);
    try {
      const res = await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:article.title,description:article.description,content:article.content,source:article.source})});
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"Translation failed");
      const translated = {...article,...data,translated:true};
      setArticles(prev=>prev.map(a=>a.id===article.id?translated:a));
      setOpenStory(translated);
    } catch(e){ setNewsErr(e.message); }
    setTranslating(null);
  };

  const onChatKey=(e)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();} };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:"#0f0820",fontFamily:"Nunito,sans-serif",overflow:"hidden"}}
      onClick={()=>activeTooltip&&setActiveTooltip(null)}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,229,102,0.2);border-radius:2px}
        textarea{resize:none;font-family:inherit;}
        textarea:focus{outline:none;}
        textarea::placeholder{color:rgba(255,255,255,0.3);}
        @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        @keyframes wave{from{transform:scaleY(0.5)}to{transform:scaleY(1.5)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"10px 14px 8px",borderBottom:"3px solid #000",background:screen==="noticias"?"#0a0520":"#FFE566",boxShadow:"0 3px 0 #000"}}>
        <div style={{width:"100%",maxWidth:580,display:"flex",alignItems:"center",gap:10}}>
          {screen!=="home"&&(
            <button onClick={()=>setScreen("home")} style={{background:"rgba(0,0,0,0.15)",border:"2px solid rgba(0,0,0,0.25)",borderRadius:8,padding:"4px 8px",color:screen==="noticias"?"#FFE566":"#1a0a2e",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>← Home</button>
          )}
          {screen==="home"&&(
            <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#FF9500,#FFE566)",border:"3px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"2px 2px 0 #000"}}>☀️</div>
          )}
          <div>
            <div style={{fontFamily:"Bangers,sans-serif",fontSize:screen==="home"?20:18,letterSpacing:1.5,color:screen==="noticias"?"#FFE566":"#1a0a2e",lineHeight:1}}>
              {screen==="home"?"SEÑOR SOL":screen==="chat"?"SEÑOR SOL":"NOTICIAS"}
            </div>
            <div style={{fontSize:10,fontWeight:800,color:screen==="noticias"?"rgba(255,229,102,0.6)":"#FF5533",letterSpacing:.5}}>
              {screen==="home"?"SPANISH LEARNING APP":screen==="chat"?"● EN LÍNEA":"NOTICIAS EN ESPAÑOL"}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOME ── */}
      {screen==="home"&&<HomeScreen onChat={startChat} onNoticias={loadNoticias}/>}

      {/* ── CHAT ── */}
      {screen==="chat"&&<>
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 14px 0",background:"#f5f0e8",backgroundImage:"radial-gradient(rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"20px 20px"}}>
          <div style={{width:"100%",maxWidth:580}}>
            {chatMsgs.map((m,i)=>{
              if(m._type==="tutor") return <TutorBubble key={i} text={m.text}/>;
              if(m._type==="help") return <HelpBubble key={i} item={m}/>;
              return <UserBubble key={i} item={m} idx={i} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip}/>;
            })}
            {chatBusy&&<ChatDots/>}
            {chatErr&&<div style={{background:"rgba(255,60,60,0.1)",border:"2px solid rgba(255,80,80,0.3)",borderRadius:10,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#ff9090",wordBreak:"break-all"}}>{chatErr}</div>}
            <div ref={endRef} style={{height:2}}/>
          </div>
        </div>
        <div style={{flexShrink:0,display:"flex",justifyContent:"center",padding:"7px 14px 13px",borderTop:"3px solid #000",background:"#1a0830"}}>
          <div style={{width:"100%",maxWidth:580}}>
            <div style={{display:"flex",gap:6,marginBottom:7}}>
              <button onClick={()=>setHelpMode(false)} style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:!helpMode?"#FF5533":"rgba(255,255,255,0.1)",background:!helpMode?"rgba(255,85,51,0.18)":"transparent",color:!helpMode?"#FF8866":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🇪🇸 Spanish</button>
              <button onClick={()=>setHelpMode(true)} style={{flex:1,padding:"5px 0",borderRadius:8,border:"2px solid",borderColor:helpMode?"#5599ff":"rgba(255,255,255,0.1)",background:helpMode?"rgba(85,153,255,0.18)":"transparent",color:helpMode?"#88aaff":"rgba(255,255,255,0.3)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🇬🇧 English help</button>
            </div>
            {!helpMode&&(
              <div style={{marginBottom:6}}>
                {SPECIAL_CHARS.map((row,ri)=>(
                  <div key={ri} style={{display:"flex",gap:4,marginBottom:ri===0?4:0}}>
                    {row.map(ch=>(
                      <button key={ch} onClick={()=>insertChar(ch)} style={{flex:1,background:"rgba(255,229,102,0.1)",border:"1px solid rgba(255,229,102,0.2)",borderRadius:6,padding:"4px 0",color:"#FFE566",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>{ch}</button>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:7,alignItems:"flex-end",background:helpMode?"rgba(85,153,255,0.08)":"rgba(255,255,255,0.055)",border:helpMode?"2px solid rgba(85,153,255,0.3)":"2px solid rgba(255,229,102,0.18)",borderRadius:14,padding:"7px 7px 7px 12px"}}>
              <textarea ref={taRef} value={currentInput} onChange={e=>setCurrentInput(e.target.value)} onKeyDown={onChatKey}
                placeholder={helpMode?"e.g. How do I say 'I had never seen anything like it'?":"Escribe en español..."}
                rows={1} spellCheck={helpMode} autoCorrect={helpMode?"on":"off"} autoComplete="off" autoCapitalize={helpMode?"on":"off"}
                style={{flex:1,background:"transparent",border:"none",color:"#fff",fontSize:15,lineHeight:1.6,caretColor:helpMode?"#88aaff":"#FFE566",minHeight:24,maxHeight:130,overflowY:"auto"}}/>
              <button onClick={sendChat} disabled={!currentInput.trim()||chatBusy}
                style={{width:36,height:36,borderRadius:9,border:"2px solid #000",background:currentInput.trim()&&!chatBusy?(helpMode?"#5599ff":"#FF5533"):"rgba(255,255,255,0.08)",color:currentInput.trim()&&!chatBusy?"#fff":"rgba(255,255,255,0.2)",fontSize:17,cursor:currentInput.trim()&&!chatBusy?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:currentInput.trim()&&!chatBusy?"2px 2px 0 #000":"none"}}>→</button>
            </div>
            <div style={{textAlign:"center",marginTop:4,fontSize:10,color:"rgba(255,255,255,0.16)"}}>
              {helpMode?"Autocorrect on · Enter to send":"Autocorrect off · Enter to send · Shift+Enter for new line"}
            </div>
          </div>
        </div>
      </>}

      {/* ── NOTICIAS ── */}
      {screen==="noticias"&&(
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:"100%",maxWidth:580,display:"flex",flexDirection:"column",flex:1}}>
            {newsLoading&&<NoticiasSpinner/>}
            {newsErr&&!newsLoading&&(
              <div style={{padding:24,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
                <div style={{fontFamily:"Bangers,sans-serif",fontSize:20,color:"#FF5533",marginBottom:8}}>ERROR CARGANDO NOTICIAS</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:16}}>{newsErr}</div>
                <button onClick={loadNoticias} style={{background:"#FF5533",border:"3px solid #000",borderRadius:12,padding:"10px 24px",color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"Bangers,sans-serif",letterSpacing:1,boxShadow:"3px 3px 0 #000"}}>REINTENTAR</button>
              </div>
            )}
            {!newsLoading&&!newsErr&&!openStory&&(
              <div style={{padding:"14px 14px 0"}}>
                <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.25)",letterSpacing:.5,marginBottom:12}}>{articles.length} ARTÍCULOS · TAP TO READ</div>
                {articles.map(a=>(
                  <div key={a.id} style={{position:"relative"}}>
                    {translating===a.id&&(
                      <div style={{position:"absolute",inset:0,background:"rgba(15,8,32,0.85)",borderRadius:16,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                        <div style={{fontFamily:"Bangers,sans-serif",fontSize:16,color:"#FFE566",letterSpacing:1}}>TRADUCIENDO...</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Generating vocab, verb & quiz</div>
                      </div>
                    )}
                    {a.translated?(
                      <StoryCard story={a} onOpen={setOpenStory}/>
                    ):(
                      <div onClick={()=>openArticle(a)} style={{background:"rgba(255,255,255,0.04)",border:"2px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"14px",marginBottom:16,cursor:"pointer"}}
                        onMouseDown={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";}}
                        onMouseUp={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
                        <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.3)",letterSpacing:.5,marginBottom:4}}>{a.source?.toUpperCase()}</div>
                        <div style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.7)",lineHeight:1.4,marginBottom:4}}>{a.title}</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",lineHeight:1.5,marginBottom:8}}>{a.description}</div>
                        <div style={{fontSize:11,fontWeight:800,color:"#FFE566"}}>TAP TO TRANSLATE INTO SPANISH →</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!newsLoading&&openStory&&(
              <StoryView story={openStory} onBack={()=>setOpenStory(null)}/>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
