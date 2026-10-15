(function(root){
 const items=[
 {id:'clean',label:'Clean seats, floors & surfaces',short:'Clean cabin',core:true},
 {id:'air',label:'Pleasant, fresh air',short:'Fresh air',core:true,help:'Comfortable scent, without overpowering fragrance.'},
 {id:'safe',label:'I feel safe during this ride',short:'Feeling safe',core:true,critical:true},
 {id:'climate',label:'AC / heat feels comfortable',short:'Comfortable temperature',core:true},
 {id:'privacy',label:'My privacy & conversation preference are respected',short:'Privacy respected',core:true,critical:true},
 {id:'charging',label:'A reachable charging port works',short:'Charging access',promised:true},
 {id:'water',label:'Drinking water is available',short:'Water',promised:false},
 {id:'extras',label:'Other advertised amenities are available',short:'Other amenities',promised:false}
 ];
 function suggest(answers={},promises={charging:true,water:false,extras:false}){
  const core=items.filter(i=>i.core),answered=core.filter(i=>['good','issue'].includes(answers[i.id]));
  const critical=core.filter(i=>i.critical&&answers[i.id]==='issue');
  const missing=core.length-answered.length;
  const concerns=items.filter(i=>answers[i.id]==='issue'&&(i.core||promises[i.id]===true)).map(i=>i.short);
  if(critical.length)return{rating:null,missing,concerns,review:true,reason:'A safety or privacy concern needs attention. Choose your own rating and report the issue; no score is suggested.'};
  if(missing)return{rating:null,missing,concerns,review:false,reason:`Answer ${missing} more core check(s) to get a suggestion. Unknown is not a positive rating.`};
  const rating=concerns.length===0?5:concerns.length===1?4:3;
  return{rating,missing:0,concerns,review:false,reason:concerns.length===0?'All five core checks are positive and no promised amenity was reported missing.':`${concerns.length} concern(s): ${concerns.join(', ')}. You can choose any final rating.`};
 }
 function validateMedia(file){
  const allowed=['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'];
  if(!allowed.includes(file.type))return'Use JPEG, PNG, WebP, MP4, WebM or MOV.';
  if(file.size<=0||file.size>20*1024*1024)return'Each file must be non-empty and no larger than 20 MB.';
  return null;
 }
 function passport(entries,now=Date.now()){
  const latest={};entries.forEach(e=>latest[e.area]=e);
  const issues=Object.values(latest).filter(e=>e.review==='Needs attention');
  const complete=['interior','exterior'].every(k=>latest[k]?.review==='Looks clean'&&Number.isFinite(latest[k].reviewedAt)&&now-latest[k].reviewedAt<86400000);
  return{status:issues.length?'Attention needed':complete?'Interior & exterior visually reviewed':'Fresh visual checks needed',issues:issues.length,complete:complete&&!issues.length};
 }
 function preparePrompt(trip,inRide){
  trip.promptState??='pending';
  if(trip.meetingMode&&['pending','shown'].includes(trip.promptState))trip.promptState='deferred';
  if(inRide&&trip.promptState==='pending')trip.promptState='shown';
  return inRide&&trip.promptState==='shown';
 }
 function answerPrompt(trip,action){
  if(trip.promptState!=='shown'||!['good','attention','later'].includes(action))return false;
  trip.promptState=action==='later'?'deferred':'answered';
  if(action!=='later')trip.pulse=action;
  if(action==='attention')trip.detailsOpen=true;
  return true;
 }
 function setMeetingMode(trip,enabled){
  trip.meetingMode=Boolean(enabled);
  if(enabled&&['pending','shown'].includes(trip.promptState??'pending'))trip.promptState='deferred';
 }
 const api={items,suggest,validateMedia,passport,preparePrompt,answerPrompt,setMeetingMode};root.Keep2Experience=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
