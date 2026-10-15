(function(root){
  'use strict';
  const defaults={penaltyPercent:20,strikeLimit:3,windowSize:10};
  function validate(policy){
    if(!Number.isInteger(policy.penaltyPercent)||policy.penaltyPercent<1||policy.penaltyPercent>100)throw new Error('Percentage must be a whole number from 1 to 100.');
    if(!Number.isInteger(policy.windowSize)||policy.windowSize<1||policy.windowSize>100)throw new Error('Rating window must be between 1 and 100.');
    if(!Number.isInteger(policy.strikeLimit)||policy.strikeLimit<1||policy.strikeLimit>policy.windowSize)throw new Error('Removal threshold must be between 1 and the rating window.');
    return true;
  }
  function split(fareCents,rating,policy){
    validate(policy);
    if(!Number.isInteger(fareCents)||fareCents<200)throw new Error('Ride fare must be at least $2.');
    if(rating!==null&&(!Number.isInteger(rating)||rating<1||rating>5))throw new Error('Rating must be 1–5 stars or unrated.');
    const feeCents=rating===null||rating===5?200:Math.min(fareCents,Math.max(200,Math.round(fareCents*policy.penaltyPercent/100)));
    return {feeCents,driverCents:fareCents-feeCents,penaltyCents:feeCents-200,pending:rating===null};
  }
  function standing(trips,policy){
    validate(policy);
    const rated=trips.filter(t=>Number.isInteger(t.rating)&&t.rating>=1&&t.rating<=5).slice(-policy.windowSize);
    const strikes=rated.filter(t=>t.rating<5).length;
    return {strikes,ratedCount:rated.length,status:strikes>=policy.strikeLimit?'Removed':strikes?'Warning':'Active'};
  }
  const api={defaults,validate,split,standing};root.Keep2Policy=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
