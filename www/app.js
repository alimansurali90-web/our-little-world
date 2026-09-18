const $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];
let state={diary:null,section:null,items:[],pendingRecovery:[]};
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3000)}
function show(id){$(id).classList.remove("hidden")}function hide(id){$(id).classList.add("hidden")}
function errorText(e){return e?.message||e?.details||e?.hint||"Unknown database error"}
async function ensureAuth(){let {data:{session}}=await supabaseClient.auth.getSession();if(!session){const r=await supabaseClient.auth.signInAnonymously();if(r.error)throw r.error;session=r.data.session}return session}
function saveLocal(){if(state.diary)localStorage.setItem("owl_diary_context",JSON.stringify({diaryId:state.diary.diary_id,coupleId:state.diary.couple_id}))}
function clearLocal(){localStorage.removeItem("owl_diary_context")}
async function rpc(name,params){const r=await supabaseClient.rpc(name,params);if(r.error)throw r.error;return r.data}
async function loadDiaryContext(diaryId){const data=await rpc("open_diary_by_id",{p_diary_id:diaryId});if(!data?.success)throw new Error(data?.message||"Unable to open diary");state.diary=data.diary;saveLocal();return data.diary}

qsa(".tab").forEach(b=>b.onclick=()=>{qsa(".tab").forEach(x=>x.classList.remove("active"));qsa(".panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$(b.dataset.tab+"-form").classList.add("active")});
$("show-recovery").onclick=()=>{qsa(".tab").forEach(x=>x.classList.remove("active"));qsa(".panel").forEach(x=>x.classList.remove("active"));$("recovery-form").classList.add("active")};qsa("[data-back-auth]").forEach(b=>b.onclick=()=>{qsa(".panel").forEach(x=>x.classList.remove("active"));$("login-form").classList.add("active")});

$("create-form").onsubmit=async e=>{e.preventDefault();try{await ensureAuth();const d=await rpc("create_our_world",{p_diary_name:$("c-diary-name").value.trim(),p1_name:$("c-p1").value.trim(),p2_name:$("c-p2").value.trim(),p1_phone:$("c-p1-phone").value.trim()||null,p2_phone:$("c-p2-phone").value.trim()||null,p_pin:$("c-pin").value});if(!d?.success)throw new Error(d?.message||"Could not create diary");state.diary=d.diary;saveLocal();showWorld();toast("Our Little World has been created â¤ï¸") }catch(err){toast(errorText(err))}};
$("login-form").onsubmit=async e=>{e.preventDefault();try{await ensureAuth();const d=await rpc("login_our_world",{p_diary_id:$("login-diary").value.trim(),p_pin:$("login-pin").value});if(!d?.success)throw new Error(d?.message||"Invalid Diary ID or PIN");state.diary=d.diary;saveLocal();showWorld();toast("Welcome back â¤ï¸")}catch(err){toast(errorText(err))}};
$("join-form").onsubmit=async e=>{e.preventDefault();try{await ensureAuth();const d=await rpc("join_our_world",{p_diary_id:$("j-diary").value.trim(),p_invite_code:$("j-code").value.trim()});if(!d?.success)throw new Error(d?.message||"Could not join");state.diary=d.diary;saveLocal();showWorld();toast("You are together in your world ðŸ’•")}catch(err){toast(errorText(err))}};
$("recovery-form").onsubmit=async e=>{e.preventDefault();toast("Recovery setup is part of the secure database configuration.")};

async function showWorld(){hide("auth");show("world");hide("content");if(!state.diary)return;$("world-title").textContent=state.diary.diary_name||"Our Little World â¤ï¸";$("partner-names").textContent=[state.diary.person1_name,state.diary.person2_name].filter(Boolean).join(" + ")||"Just us two â¤ï¸";$("couple-code").textContent=state.diary.couple_code?`Our world: ${state.diary.couple_code}`:"";renderAvatar("avatar1",state.diary.person1_name,state.diary.person1_dp);renderAvatar("avatar2",state.diary.person2_name,state.diary.person2_dp);} 
function renderAvatar(id,name,dp){const el=$(id);if(dp){el.innerHTML=`<img class="avatar-img" src="${escapeAttr(dp)}" alt="${escapeAttr(name||"Profile")}">`}else{el.textContent=(name||"â¤")[0].toUpperCase()}}
function mySlot(){return Number(state.diary?.my_slot||0)}
function otherSlot(){return mySlot()===1?2:1}
qsa("[data-section]").forEach(b=>b.onclick=()=>openSection(b.dataset.section));$("back-world").onclick=()=>{hide("content");show("world")};$("logout").onclick=async()=>{await supabaseClient.auth.signOut();clearLocal();state={diary:null,section:null,items:[]};hide("world");hide("content");show("auth");toast("You have left your little world â¤ï¸")};

const cfg={memories:{title:"Our Memories",kicker:"MOMENTS WORTH KEEPING",table:"memories",icon:"ðŸ“¸",fields:["title","date","content","photo"]},dates:{title:"Our Special Dates",kicker:"DAYS TO REMEMBER",table:"special_dates",icon:"ðŸ“…",fields:["title","date","description","photo"]},notes:{title:"Our Notes",kicker:"LITTLE THINGS",table:"notes",icon:"ðŸ“",fields:["title","content"]},letters:{title:"Love Letters",kicker:"WORDS FROM THE HEART",table:"love_letters",icon:"ðŸ’Œ",fields:["title","recipient","date","content","photo"]}};
async function openSection(sec){state.section=sec;if(sec==="invite")return invite();if(sec==="security")return security();if(sec==="profiles")return profiles();if(sec==="story")return story();const c=cfg[sec];$("section-title").textContent=c.title;$("section-kicker").textContent=c.kicker;hide("world");show("content");$("add-item").style.display="block";await loadItems()}
async function loadItems(){const c=cfg[state.section];$("content-body").innerHTML='<div class="empty"><b>â³</b>Openingâ€¦</div>';try{const {data,error}=await supabaseClient.from(c.table).select("*").eq("couple_id",state.diary.couple_id).order("created_at",{ascending:false});if(error)throw error;state.items=data||[];renderItems()}catch(e){$("content-body").innerHTML=`<div class="empty"><b>âš ï¸</b><p>Could not load this section.</p><small>${errorText(e)}</small></div>`}}
function renderItems(){
  const c=cfg[state.section];

  if(!state.items.length){
    $("content-body").innerHTML=`<div class="empty">
      <b>${c.icon}</b>
      <p>No ${c.title.toLowerCase()} yet.</p>
      <small>Create your first beautiful one together.</small>
    </div>`;
    return;
  }

  if(state.section==="memories"){
    $("content-body").innerHTML=
      '<div class="memory-intro">'+
  '<span class="memory-intro-heart">♡</span>'+
  '<div>'+
    '<div class="memory-intro-kicker">THE MOMENTS WE KEEP</div>'+
    '<h2>Little moments, forever ours. ❤️</h2>'+
    '<p>Some days become memories. Some memories become our little world.</p>'+
  '</div>'+
'</div>'+
'<div class="memory-counter">'+
  '<span class="memory-counter-heart">♡</span>'+
  '<span class="memory-counter-text">'+
    '<strong>Our little moments</strong>'+
    '<small>Every memory is another piece of our story. ❤️</small>'+
  '</span>'+
  '<span class="memory-counter-number">'+state.items.length+'</span>'+
'</div>'+'<div class="memory-toolbar">'+
      '<input id="memory-search" class="memory-search" placeholder="Search our memories...">'+
      '<button class="primary memory-add-btn" onclick="editItem(null)">+ Add Memory</button>'+
      '</div>'+
      '<div class="memory-grid">'+
      state.items.map(x=>{
        const body=x.content??"";
        const photo=x.photo
          ? `<img class="memory-photo" src="${escapeAttr(x.photo)}" alt="Memory photo">`
          : `<div class="memory-photo memory-placeholder">Photo</div>`;
        const date=x.date?formatDate(x.date):formatDate(x.created_at);

        return `<article class="memory-card">
          <div class="memory-visual">
            ${photo}
            <div class="memory-tag">Our memory</div>
          </div>
          <div class="memory-info">
            <div class="date">${escapeHtml(date||"")}</div>
            <h3>${escapeHtml(x.title||"Untitled")}</h3>
            <p>${escapeHtml(body)}</p>
            <div class="card-actions">
              <button onclick="editItem('${x.id}')">Edit</button>
              <button onclick="deleteItem('${x.id}')">Delete</button>
            </div>
          </div>
        </article>`;
      }).join("")+
      '</div>';

    const loveMessages = [
      "You are my favorite memory. ❤️",
      "Some moments are worth keeping forever. 💕",
      "Every picture holds a little piece of us. 🫶",
      "Our little moments are my favorite ones. ❤️",
      "If I could relive one day, I would choose one with you. 💗",
      "Just you, me & our memories. ❤️",
      "Our story is made of little moments like these. 💞",
      "I hope we make a million more memories together. ✨"
    ];

    const loveMessage =
      '<div class="memory-love-message">'+
        '<span class="love-message-heart">♡</span>'+
        '<span class="love-message-text">'+
          loveMessages[Math.floor(Math.random()*loveMessages.length)]+
        '</span>'+
      '</div>';

    $("content-body").insertAdjacentHTML("afterbegin",loveMessage);

    function createMemoryHeartBurst(card){
      const rect=card.getBoundingClientRect();
      const burst=document.createElement("div");
      burst.className="memory-heart-burst";
      burst.style.left=(rect.left+rect.width/2)+"px";
      burst.style.top=(rect.top+rect.height/2)+"px";

      burst.innerHTML=
        "<span>♥</span>"+
        "<span>♡</span>"+
        "<span>💕</span>"+
        "<span>♥</span>"+
        "<span>♡</span>"+
        "<span>💗</span>"+
        "<span>✦</span>";

      document.body.appendChild(burst);

      card.classList.remove("memory-loved");
      void card.offsetWidth;
      card.classList.add("memory-loved");

      setTimeout(()=>burst.remove(),1200);
    }

    $("content-body").addEventListener("click",e=>{
      const card=e.target.closest(".memory-card");
      if(!card)return;
      if(e.target.closest("button"))return;
      createMemoryHeartBurst(card);
    });
    const search=$("memory-search");
    search.oninput=()=>{
      const q=search.value.toLowerCase();
      qsa(".memory-card").forEach(card=>{
        card.style.display=card.textContent.toLowerCase().includes(q)?"":"none";
      });
    };
    return;
  }

  const sectionClass=state.section==="dates"
    ?"date-card"
    :state.section==="notes"
    ?"note-card"
    :"letter-card";

  $("content-body").innerHTML=
    `<div class="item-grid ${sectionClass}-grid">`+
    state.items.map(x=>{
      const body=x.content??x.description??"";
      const date=x.date?formatDate(x.date):formatDate(x.created_at);
      const photo=x.photo
        ? `<img class="item-photo" src="${escapeAttr(x.photo)}" alt="">`
        : "";

      let extra="";

      if(state.section==="dates"){
        extra=`<div class="section-label">Special date</div>`;
      }

      if(state.section==="notes"){
        extra=`<div class="section-label">Our note</div>`;
      }

      if(state.section==="letters"){
        extra=`<div class="section-label">Love letter</div>`+
          (x.recipient?`<div class="date">For ${escapeHtml(x.recipient)}</div>`:"");
      }

      return `<article class="item-card ${sectionClass}">
        ${extra}
        <h3>${escapeHtml(x.title||"Untitled")}</h3>
        <div class="date">${escapeHtml(date||"")}</div>
        ${photo}
        <p>${escapeHtml(body)}</p>
        <div class="card-actions">
          <button onclick="editItem('${x.id}')">Edit</button>
          <button onclick="deleteItem('${x.id}')">Delete</button>
        </div>
      </article>`;
    }).join("")+
    `</div>`;
}

function formatDate(v){if(!v)return"";const d=new Date(v);return isNaN(d)?String(v):d.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"})}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function escapeAttr(v){return escapeHtml(v)}
async function imageToDataUrl(file,maxSide=1200,quality=.78){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error);reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error("Could not read image"));img.onload=()=>{const scale=Math.min(1,maxSide/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext("2d");ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",quality))};img.src=reader.result};reader.readAsDataURL(file)})}
$("add-item").onclick=()=>editItem(null);window.editItem=editItem;window.deleteItem=deleteItem;
function editItem(id){const c=cfg[state.section],x=id?state.items.find(a=>String(a.id)===String(id)):null;let html=`<h2>${x?"Edit":"Add"} ${c.title}</h2><form id="item-form" class="form-card"><label>Title<input id="f-title" required value="${escapeAttr(x?.title||"")}"></label>`;if(c.fields.includes("recipient"))html+=`<label>Recipient<input id="f-recipient" value="${escapeAttr(x?.recipient||"")}"></label>`;if(c.fields.includes("date"))html+=`<label>Date<input id="f-date" type="date" value="${escapeAttr(x?.date||"")}"></label>`;if(c.fields.includes("content"))html+=`<label>${state.section==='memories'?'Description':'Content'}<textarea id="f-content">${escapeHtml(x?.content||"")}</textarea></label>`;if(c.fields.includes("description"))html+=`<label>Description<textarea id="f-content">${escapeHtml(x?.description||"")}</textarea></label>`;if(c.fields.includes("photo"))html+=`<label>Photo <small>(optional)</small><input id="f-photo-file" type="file" accept="image/*"><div id="photo-preview-wrap">${x?.photo?`<img class="photo-preview" src="${escapeAttr(x.photo)}" alt="Photo">`:""}</div><small>Choose a photo from your gallery. It will be resized for the shared diary.</small></label>`;html+=`<button class="primary" type="submit">${x?'Save Changes':'Save to Our Shared Diary â¤ï¸'}</button></form>`;$("modal-body").innerHTML=html;show("modal");$("item-form").onsubmit=async e=>{e.preventDefault();try{const payload={couple_id:state.diary.couple_id,title:$("f-title").value.trim()};if(c.fields.includes("recipient"))payload.recipient=$("f-recipient").value.trim();if(c.fields.includes("date"))payload.date=$("f-date").value||null;if(c.fields.includes("content"))payload.content=$("f-content").value.trim();if(c.fields.includes("description"))payload.description=$("f-content").value.trim();if(c.fields.includes("photo")){const file=$("f-photo-file")?.files?.[0];if(file)payload.photo=await imageToDataUrl(file,1200,0.78);else payload.photo=x?.photo||null;}let r=x?await supabaseClient.from(c.table).update(payload).eq("id",x.id).eq("couple_id",state.diary.couple_id):await supabaseClient.from(c.table).insert(payload);if(r.error)throw r.error;hide("modal");toast(x?'Saved â¤ï¸':'Saved to your shared diary â¤ï¸');await loadItems()}catch(e){toast(`Save failed: ${errorText(e)}`)}}}
async function deleteItem(id){if(!confirm("Delete this from your shared diary?"))return;const c=cfg[state.section];try{const r=await supabaseClient.from(c.table).delete().eq("id",id).eq("couple_id",state.diary.couple_id);if(r.error)throw r.error;toast("Deleted â¤ï¸");await loadItems()}catch(e){toast(`Delete failed: ${errorText(e)}`)}}
function invite(){hide("world");show("content");$("section-title").textContent="Share Invitation";$("section-kicker").textContent="BRING YOUR PARTNER IN";$("add-item").style.display="none";$("content-body").innerHTML=`<div class="form-card"><h2>Come into Our Little World â¤ï¸</h2><p>Diary ID</p><input id="copy-diary" readonly value="${escapeAttr(state.diary.diary_id)}"><p>Invitation code</p><input id="copy-code" readonly value="${escapeAttr(state.diary.invite_code||"")}"><button class="primary" id="copy-invite">Copy Invitation</button></div>`;$("copy-invite").onclick=async()=>{const text=`Come into Our Little World â¤ï¸\n\nDiary ID: ${state.diary.diary_id}\nInvitation Code: ${state.diary.invite_code||""}\n\nJoin our private world.`;await navigator.clipboard?.writeText(text);toast("Invitation copied â¤ï¸")}}
function security(){hide("world");show("content");$("section-title").textContent="Security";$("section-kicker").textContent="KEEP OUR WORLD PRIVATE";$("add-item").style.display="none";$("content-body").innerHTML=`<div class="form-card"><h2>ðŸ” We are each other's key</h2><p>Lost your device? Ask your partner to approve this device. Your partner's approval restores access without changing your shared diary.</p><p><b>Diary ID:</b> ${escapeHtml(state.diary.diary_id)}</p><button class="primary" id="request-recovery">Ask My Partner to Approve This Device</button><hr><h3>Pending requests</h3><div id="recovery-list"><div class="empty"><b>â³</b>Checkingâ€¦</div></div><p class="hint">Only your partner can approve a recovery request.</p></div>`;$("request-recovery").onclick=async()=>{try{await rpc("request_recovery",{p_diary_id:state.diary.diary_id});toast("Request sent to your partner â¤ï¸");await loadRecoveryRequests()}catch(e){toast(errorText(e))}};loadRecoveryRequests()}
async function loadRecoveryRequests(){const box=$("recovery-list");if(!box)return;try{const rows=await rpc("get_pending_recovery");state.pendingRecovery=rows||[];if(!state.pendingRecovery.length){box.innerHTML='<p class="hint">No pending requests.</p>';return}box.innerHTML=state.pendingRecovery.map(r=>`<div class="form-card"><b>New device wants access</b><p>Request: ${escapeHtml(formatDate(r.created_at))}</p><button class="primary" onclick="approveRecovery('${r.id}')">Approve â¤ï¸</button><button onclick="rejectRecovery('${r.id}')">Reject</button></div>`).join("")}catch(e){box.innerHTML=`<p class="hint">Recovery requests are unavailable until the new recovery SQL is installed.</p>`}}
window.approveRecovery=async id=>{try{await rpc("approve_recovery",{p_request_id:id});toast("Recovery approved â¤ï¸");await loadRecoveryRequests()}catch(e){toast(errorText(e))}};
window.rejectRecovery=async id=>{try{await rpc("reject_recovery",{p_request_id:id});toast("Recovery request rejected");await loadRecoveryRequests()}catch(e){toast(errorText(e))}};
function profiles(){hide("world");show("content");$("section-title").textContent="Our Profiles";$("section-kicker").textContent="JUST US TWO";$("add-item").style.display="none";const slot=mySlot();$("content-body").innerHTML=`<div class="form-card"><h2>ðŸ‘¤ Profile Pictures</h2><p>Choose a picture for each partner. Your partner will see it too.</p><div class="photo-upload"><h3>${escapeHtml(slot===2?state.diary.person2_name:state.diary.person1_name)||"Partner 1"}</h3><img class="photo-preview" src="${escapeAttr(slot===2?state.diary.person2_dp||"":state.diary.person1_dp||"")}" ${slot===2&&!state.diary.person2_dp||slot!==2&&!state.diary.person1_dp?'style="display:none"':""} id="my-dp-preview" alt=""><input id="my-dp-file" type="file" accept="image/*"><button class="primary" id="save-my-dp">Save My DP â¤ï¸</button></div><div class="photo-upload"><h3>${escapeHtml(slot===1?state.diary.person2_name:state.diary.person1_name)||"Partner 2"}</h3><img class="photo-preview" src="${escapeAttr(slot===1?state.diary.person2_dp||"":state.diary.person1_dp||"")}" ${slot===1&&!state.diary.person2_dp||slot!==1&&!state.diary.person1_dp?'style="display:none"':""} alt="Partner DP"><p class="hint">Your partner controls their own picture.</p></div></div>`;$("my-dp-file").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;$("my-dp-preview").src=await imageToDataUrl(f,700,.8);$("my-dp-preview").style.display="block"};$("save-my-dp").onclick=async()=>{const f=$("my-dp-file").files?.[0];if(!f){toast("Choose a picture first");return}try{const dp=await imageToDataUrl(f,700,.8);const d=await rpc("save_my_dp",{p_dp:dp});state.diary={...state.diary,...d.diary};renderAvatar("avatar1",state.diary.person1_name,state.diary.person1_dp);renderAvatar("avatar2",state.diary.person2_name,state.diary.person2_dp);toast("Profile picture saved â¤ï¸")}catch(e){toast(errorText(e))}}}
function story(){hide("world");show("content");$("section-title").textContent="Our Story";$("section-kicker").textContent="FROM THEN TO NOW";$("add-item").style.display="none";$("content-body").innerHTML='<div class="empty"><b>â¤ï¸</b><p>Your story grows with every memory and special date.</p><small>As you add moments, this space can become your relationship timeline.</small></div>'}
$("modal-close").onclick=()=>hide("modal");$("modal").onclick=e=>{if(e.target.id==="modal")hide("modal")};
(async()=>{try{const {data:{session}}=await supabaseClient.auth.getSession();if(session){const raw=localStorage.getItem("owl_diary_context");if(raw){const x=JSON.parse(raw);try{await loadDiaryContext(x.diaryId);showWorld()}catch{clearLocal()}}}}catch(e){console.error(e)}finally{hide("loading")}})();








