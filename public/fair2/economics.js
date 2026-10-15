(function(root){
 const defaults={fare:20,minutes:30,miles:9,costPerMile:.45,netHourly:20,insurance:2,charges:0,processingPercent:2.9,processingFixed:.30,operations:1.35,overhead:50000,volume:100000,benchmark:20,discount:10,mode:'recovery'};
 function calculate(a){
  for(const k of Object.keys(defaults).filter(k=>k!=='mode'))if(!Number.isFinite(a[k])||a[k]<0)throw new Error('Enter a non-negative number in every field.');
  if(a.minutes<=0||a.volume<=0||a.processingPercent>=100||a.discount>=100||a.benchmark<=0||!['recovery','allin'].includes(a.mode))throw new Error('Duration, volume and benchmark must be positive; percentages must be below 100.');
  const rate=a.processingPercent/100,payment=a.fare*rate+a.processingFixed,vehicle=a.miles*a.costPerMile,driverTarget=a.netHourly*a.minutes/60+vehicle;
  const recovered=a.mode==='recovery'?a.insurance+a.charges+payment:0,driver=a.fare-2-recovered,contribution=2-a.operations-(a.mode==='allin'?a.insurance+a.charges+payment:0);
  const fareFloor=a.mode==='recovery'?(driverTarget+2+a.insurance+a.charges+a.processingFixed)/(1-rate):driverTarget+2;
  const requiredPlatform=a.operations+a.overhead/a.volume;
  const fullyCostedFloor=(driverTarget+a.insurance+a.charges+a.processingFixed+Math.max(2,requiredPlatform))/(1-rate);
  const cap=a.benchmark*(1-a.discount/100),netHourly=(driver-vehicle)*60/a.minutes;
  return {payment,vehicle,driverTarget,driver,contribution,fareFloor,fullyCostedFloor,requiredPlatform,cap,netHourly,monthlyProfit:contribution*a.volume-a.overhead,breakEven:contribution>0?Math.ceil(a.overhead/contribution):null,driverPass:driver>=driverTarget,marginPass:contribution*a.volume>=a.overhead,pricePass:a.fare<=cap};
 }
 function riderStatus(trips,now){const pending=trips.filter(t=>t.rating===null&&!t.riderIssue);const overdue=pending.filter(t=>Number.isFinite(t.completedAt)&&now-t.completedAt>=24*60*60*1000);return{pending,overdue,blocked:overdue.length>0}}
 const api={defaults,calculate,riderStatus};root.Keep2Economics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
