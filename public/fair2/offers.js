(function(root){
 const discounts={quiet:20,normal:15,busy:10},quoteLife=10*60*1000,offerLife=5*60*1000;
 function price(a){
  if(!Number.isInteger(a.competitorCents)||a.competitorCents<=0||!(a.demand in discounts))throw Error('Enter a valid competitor total and demand scenario.');
  for(const k of ['insuranceCents','chargesCents'])if(!Number.isInteger(a[k])||a[k]<0)throw Error('Cost allowances must be non-negative amounts.');
  const discount=discounts[a.demand],suggestedCents=Math.floor(a.competitorCents*(100-discount)/100);
  const totalCents=a.offerCents==null?suggestedCents:a.offerCents;
  if(!Number.isInteger(totalCents)||totalCents<=0||totalCents>suggestedCents)throw Error('Your offer must be positive and no higher than the suggested discounted price.');
  const processingCents=Math.round(totalCents*.029)+30,platformCents=200;
  const driverCents=totalCents-platformCents-a.insuranceCents-a.chargesCents-processingCents;
  return{discount,suggestedCents,totalCents,processingCents,platformCents,insuranceCents:a.insuranceCents,chargesCents:a.chargesCents,driverCents,savedCents:a.competitorCents-totalCents,savingPercent:100*(a.competitorCents-totalCents)/a.competitorCents,affordable:driverCents>0};
 }
 function validate(a,now){
  if(!a.pickup?.trim()||!a.destination?.trim())throw Error('Enter both ends of the ride.');
  if(!['Uber','Lyft','Waymo','Tesla Robotaxi','Other'].includes(a.provider)||!['comfort','xl','xxl'].includes(a.car))throw Error('Choose a provider and comparable ride capacity.');
  if(!Number.isFinite(a.quoteAt)||a.quoteAt>now+60000||now-a.quoteAt>=quoteLife)throw Error('Use a quote captured within the last 10 minutes. Request a fresh quote if needed.');
  if(!a.sameRide||!a.totalConfirmed)throw Error('Confirm matching route, capacity and all-in pricing before sending.');
  const p=price(a);if(!p.affordable)throw Error('This offer does not cover the disclosed charges and a positive driver payout. It has not been increased.');
  return p;
 }
 function create(a,now,id){return{...a,...validate(a,now),id,createdAt:now,expiresAt:Math.min(now+offerLife,a.quoteAt+quoteLife),status:'review',reviewChecks:{},acceptedAt:null}}
 function refresh(o,now){if(['review','open'].includes(o.status)&&now>=o.expiresAt)o.status='expired';return o.status}
 function review(o,checks,now){refresh(o,now);if(o.status!=='review')throw Error('This offer is no longer awaiting review.');if(!['route','fare','fresh'].every(k=>checks[k]))throw Error('Check the route/capacity, total and freshness against the screenshot.');o.reviewChecks={...checks};o.status='open'}
 function accept(o,now){refresh(o,now);if(o.status!=='open')throw Error('Only a reviewed, open offer can be accepted.');o.status='accepted';o.acceptedAt=now;return o}
 function decline(o,now){refresh(o,now);if(o.status!=='open')throw Error('Only an open offer can be declined.');o.status='declined'}
 function fileError(f){return !f?'Choose a competitor quote screenshot.':!['image/jpeg','image/png','image/webp'].includes(f.type)?'Use a JPEG, PNG or WebP screenshot.':f.size<=0||f.size>10*1024*1024?'Choose an image no larger than 10 MB.':null}
 function driverEstimate(payoutCents,minutes,miles,costPerMile){if(![minutes,miles,costPerMile].every(Number.isFinite)||minutes<=0||miles<0||costPerMile<0)throw Error('Enter valid total minutes, miles and vehicle cost.');const cost=miles*costPerMile;return{cost,netHourly:(payoutCents/100-cost)*60/minutes}}
 const api={discounts,price,validate,create,refresh,review,accept,decline,fileError,driverEstimate};root.Keep2Offers=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
