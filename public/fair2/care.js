(function(root){
function quote({mode,drive,cost,wait,assist}){if(!['return','wait','assist'].includes(mode))throw Error('Choose a service');for(const x of [drive,cost,wait,assist])if(!Number.isFinite(x)||x<0)throw Error('Enter valid non-negative amounts');const w=mode==='return'?0:wait,a=mode==='assist'?assist:0;if(w>240||a>120)throw Error('Time exceeds this demo’s booking limit');const driver=Math.round(drive*100)+Math.round(w*40)+Math.round(a*50),external=Math.round(cost*100),fee=200,total=Math.ceil((driver+external+fee+30)/.971),processing=total-driver-external-fee;return{driver,external,fee,total,processing,wait:w,assist:a};}
function compatible(driver,gender){return driver==='any'||gender==='any'||(driver==='maya'&&gender==='woman')||(driver==='james'&&gender==='man');}
function validDates(start,end,now){return Number.isFinite(start)&&Number.isFinite(end)&&start>now&&end>start;}
const api={quote,compatible,validDates};root.Fair2Care=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
