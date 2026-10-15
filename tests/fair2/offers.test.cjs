const test=require('node:test'),assert=require('node:assert/strict'),O=require('../../public/fair2/offers.js'),fs=require('node:fs'),vm=require('node:vm');
const now=1800000000000,base={pickup:'HOU',destination:'Katy',provider:'Lyft',car:'comfort',competitorCents:6361,demand:'normal',offerCents:null,insuranceCents:400,chargesCents:325,quoteAt:now,sameRide:true,totalConfirmed:true};
test('discount suggestions round down; totals balance without extra markup',()=>{
 for(const [demand,total] of [['quiet',5088],['normal',5406],['busy',5724]]){const p=O.price({...base,demand});assert.equal(p.totalCents,total);assert.equal(p.driverCents+p.processingCents+p.insuranceCents+p.chargesCents+p.platformCents,total);assert.equal(p.platformCents,200);assert.ok(p.savingPercent>=p.discount)}
 const p=O.price({...base,offerCents:5000});assert.equal(p.totalCents,5000);assert.throws(()=>O.price({...base,offerCents:6000}));assert.throws(()=>O.validate({...base,offerCents:200},now));assert.throws(()=>O.price({...base,chargesCents:-1}));
});
test('evidence eligibility and freshness block incomplete or stale offers',()=>{
 for(const extra of [{pickup:''},{destination:''},{provider:'Invalid'},{car:'unknown'},{sameRide:false},{totalConfirmed:false},{quoteAt:now-600000},{quoteAt:now+120000}])assert.throws(()=>O.create({...base,...extra},now,1));
 assert.ok(O.fileError(null));assert.ok(O.fileError({type:'image/svg+xml',size:200}));assert.ok(O.fileError({type:'image/png',size:11*1024*1024}));assert.equal(O.fileError({type:'image/png',size:200}),null);
});
test('review precedes acceptance, driver target is advisory, accepted price stays fixed',()=>{
 const o=O.create({...base,offerCents:5000},now,1);assert.throws(()=>O.accept(o,now));assert.throws(()=>O.review(o,{route:true,fare:true},now));
 O.review(o,{route:true,fare:true,fresh:true},now);assert.ok(O.driverEstimate(o.driverCents,75,48,.45).netHourly<20);O.accept(o,now+1000);assert.equal(o.status,'accepted');assert.equal(o.totalCents,5000);O.price({...base,demand:'busy'});O.refresh(o,now+900000);assert.equal(o.status,'accepted');assert.equal(o.totalCents,5000);assert.throws(()=>O.accept(o,now+2000));assert.throws(()=>O.decline(o,now+2000));
});
test('offers expire and decline without charging or raising the price',()=>{
 const o=O.create({...base,quoteAt:now-500000},now,1);assert.equal(o.expiresAt,now+100000);O.review(o,{route:true,fare:true,fresh:true},now);assert.throws(()=>O.accept(o,o.expiresAt));assert.equal(o.status,'expired');
 const d=O.create(base,now,2);O.review(d,{route:true,fare:true,fresh:true},now);O.decline(d,now);assert.equal(d.status,'declined');assert.equal(d.totalCents,5406);assert.throws(()=>O.accept(d,now));
});
test('UI supports screenshot preview, reviewed offer and voluntary driver acceptance',()=>{
 const nodes={},actions=[];const node=s=>nodes[s]??={value:'',checked:false,files:[],textContent:'',innerHTML:'',addEventListener(){},getAttribute(k){return this.attrs?.[k]}};
 Object.entries({offerpickup:'HOU',offerdestination:'Katy',offerprovider:'Lyft',offercar:'comfort',offercompetitor:'63.61',offerdemand:'normal',offeramount:'',offerinsurance:'4',offercharges:'3.25'}).forEach(([k,v])=>node('#'+k).value=v);
 const queryAll=s=>{const attr=s.slice(1,-1);if(!attr.startsWith('data-offer-'))return[];const re=new RegExp(attr+'="(\\d+)"','g');return [...node('#offerinbox').innerHTML.matchAll(re)].map(m=>{const n={attrs:{[attr]:m[1]},getAttribute(k){return this.attrs[k]}};actions.push({attr,id:m[1],n});return n})};
 const sandbox={document:{querySelector:node,querySelectorAll:queryAll},$:node,money:n=>'$'+n.toFixed(2),escapeHTML:s=>String(s).replaceAll('<','&lt;'),Keep2Offers:O,Keep2Economics:require('../../public/fair2/economics.js'),tripHistory:[],demoNow:()=>now,removed:false,policy:{penaltyPercent:20},vehicles:{comfort:{label:'Comfort'}},URL:{createObjectURL:()=> 'blob:screenshot',revokeObjectURL(){}},Image:class{set src(v){this.onload()}},setTimeout:()=>1,clearTimeout(){},setInterval(){},Date,console};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require.resolve('../../public/fair2/offers-ui.js'),'utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
 const click=attr=>actions.filter(a=>a.attr==='data-offer-'+attr&&a.id==='1').at(-1).n.onclick();
 node('#offersameride').checked=node('#offertotalconfirmed').checked=true;node('#offerquoteat').value=new Date().toISOString();
 node('#offerform').onsubmit({preventDefault(){}});assert.match(node('#offerstatus').textContent,/screenshot/);assert.equal(run('riderOffers.length'),0);
 node('#offerscreenshot').files=[{type:'image/png',size:1000,name:'quote.png'}];node('#offerscreenshot').onchange();assert.match(node('#offerimagepreview').innerHTML,/blob:screenshot/);
 node('#offerform').onsubmit({preventDefault(){}});assert.equal(run('riderOffers[0].status'),'review');click('review');assert.equal(run('riderOffers[0].status'),'review');
 for(const k of ['route','fare','fresh'])node('#review'+k+'-1').checked=true;click('review');assert.equal(run('riderOffers[0].status'),'open');
 node('#drivermin-1').value='75';node('#drivermiles-1').value='48';node('#drivercost-1').value='.45';node('#driverconsent-1').checked=true;
 sandbox.removed=true;click('accept');assert.equal(run('riderOffers[0].status'),'open');sandbox.removed=false;click('accept');assert.equal(run('riderOffers[0].status'),'accepted');assert.match(node('#offerinbox').innerHTML,/No actual booking or payment/);assert.equal(run('riderOffers[0].totalCents'),5406);
 node('#offerdemand').value='busy';sandbox.renderOfferPreview();assert.equal(run('riderOffers[0].totalCents'),5406);
});
