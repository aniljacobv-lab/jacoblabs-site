const test=require('node:test'),assert=require('node:assert/strict'),L=require('../../public/fair2/location.js'),fs=require('node:fs'),vm=require('node:vm');
const houston={lat:29.7604,lon:-95.3698};
const point=(lat,lon,label)=>({lat,lon,label,kind:'street',entrance:'Street-side',confirmed:true,matched:true});
const initial={pickup:point(29.76,-95.36,'Pickup'),destination:point(29.78,-95.38,'Destination'),stops:[],estimate:{miles:10,minutes:30}};
const clone=x=>JSON.parse(JSON.stringify(x));
const trip=()=>({routePlan:clone(initial),routeBaseline:{miles:10,minutes:30},routeBaseFareCents:5000,fareCents:5000,routeExtraCents:0});
test('map projections round-trip accurately and distance filters use real miles',()=>{
 for(const p of [houston,{lat:0,lon:0},{lat:40.75,lon:-73.98},{lat:-33.86,lon:151.2}])for(const z of [3,15,19]){const q=L.unproject(L.project(p,z),z);assert.ok(Math.abs(q.lat-p.lat)<1e-8);assert.ok(Math.abs(q.lon-p.lon)<1e-8)}
 assert.equal(L.miles(houston,houston),0);assert.ok(L.miles(houston,{lat:houston.lat+1,lon:houston.lon})>69);assert.equal(L.validPoint({lat:100,lon:0}),false);assert.throws(()=>L.miles({},houston));
});
test('nearby suggestions exclude over-50-mile matches and identify hotels and airports',()=>{
 const f=(id,lat,name)=>({geometry:{coordinates:[houston.lon,lat]},properties:{osm_id:id,osm_type:'N',name,street:'Main St',housenumber:'10',city:'Houston'}});
 const near=f(1,houston.lat+.1,'Residence Inn'),far=f(2,houston.lat+1,'Residence Inn'),closer=f(3,houston.lat+.01,'Residence Inn');
 const r=L.results([far,near,closer,near,{properties:{name:'Bad'}}],houston);assert.equal(r.length,2);assert.ok(r[0].distance<r[1].distance);assert.ok(r.every(p=>p.distance<=50));assert.equal(r[0].kind,'hotel');assert.match(r[0].label,/10 Main St/);assert.equal(L.kind({osm_value:'terminal'}),'airport');assert.deepEqual(L.results([near],null),[]);
});
test('minor adjustments are free; only the excess over either allowance is priced',()=>{
 const base={miles:10,minutes:30};assert.equal(L.change(base,{miles:11,minutes:35}).cents,0);assert.equal(L.change(base,{miles:12,minutes:38}).cents,205);assert.equal(L.change(base,{miles:10,minutes:40}).cents,175);assert.equal(L.change(base,{miles:8,minutes:20}).cents,0);assert.throws(()=>L.change(base,{miles:NaN,minutes:30}));
});
test('route change needs approval, never double-charges, and preserves original allowance',()=>{
 const t=trip(),p=clone(initial);p.stops.push(point(29.8,-95.4,'Extra pickup'));
 const q=L.propose(t,p,{miles:12,minutes:38});assert.equal(q.totalCents,5205);assert.throws(()=>L.apply(t,q));q.riderApproved=true;assert.throws(()=>L.apply(t,q));q.driverApproved=true;L.apply(t,q);assert.equal(t.fareCents,5205);assert.deepEqual(t.routeBaseline,{miles:10,minutes:30});assert.throws(()=>L.apply(t,q));
 const p2=clone(p);p2.destination.lon-=.01;const q2=L.propose(t,p2,{miles:13,minutes:39});assert.equal(q2.cents,340);assert.equal(q2.differenceCents,135);q2.riderApproved=q2.driverApproved=true;L.apply(t,q2);assert.equal(t.fareCents,5340);
 const q3=L.propose(t,clone(initial),{miles:10,minutes:30});q3.riderApproved=true;L.apply(t,q3);assert.equal(t.fareCents,5000);
});
test('unchanged pins or traffic-only changes do not reprice; stale quotes are blocked',()=>{
 const t=trip(),p=clone(initial);p.destination.note='Meet beside the lobby';const q=L.propose(t,p,{miles:10,minutes:50});assert.equal(q.cents,0);q.riderApproved=true;L.apply(t,q);assert.equal(t.fareCents,5000);
 const detour=clone(initial);detour.destination.lon-=.1;const a=L.propose(t,detour,{miles:20,minutes:60}),b=L.propose(t,detour,{miles:20,minutes:60});a.riderApproved=a.driverApproved=true;L.apply(t,a);b.riderApproved=b.driverApproved=true;assert.throws(()=>L.apply(t,b),/fresh quote/);
 const traffic=L.propose(t,detour,{miles:20,minutes:90},'traffic');assert.equal(traffic.differenceCents,0);
});
test('location editor runtime confirms both endpoints, retains stops, and applies free edits',async()=>{
 const nodes={};const node=s=>nodes[s]??={id:s.slice(1),value:'',innerHTML:'',textContent:'',checked:false,hidden:false,open:false,children:[],selectedOptions:[{text:'Demo destination'}],listeners:{},addEventListener(k,fn){(this.listeners[k]??=[]).push(fn)},setAttribute(){},insertAdjacentElement(){},querySelectorAll:()=>[],querySelector:()=>null,showModal(){this.open=true},close(){this.open=false},focus(){},setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:600,height:360})};
 node('#pickup').value='Pickup';node('#pointrole').value='pickup';node('#dropoff').value='downtown';
 const sandbox={$:node,document:{querySelector:node,querySelectorAll:()=>[],createElement:()=>node('#created'+Object.keys(nodes).length)},Keep2Location:L,fetch:async()=>({ok:true,json:async()=>({})}),navigator:{},money:n=>'$'+n.toFixed(2),escapeHTML:s=>String(s).replaceAll('<','&lt;'),stage:0,currentTrip:null,tripDraft:null,renderTrip(){},URL,AbortController,DOMException,Date,JSON,Math,Number,Map,setTimeout,clearTimeout,console};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require.resolve('../../public/fair2/location-ui.js'),'utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
 node('#bookinglocations').onclick();assert.equal(node('#locationdialog').open,true);node('#savelocations').onclick();assert.match(node('#locationfinal').textContent,/Confirm/);
 run("workingPlan="+JSON.stringify(initial));run("pointRole='pickup';loadPoint()");node('#pointconfirm').checked=true;assert.equal(sandbox.savePoint(),true);node('#routemiles').value='10';node('#routeminutes').value='30';node('#savelocations').onclick();assert.equal(node('#locationdialog').open,false);assert.match(node('#bookinglocationstatus').textContent,/confirmed/);
 const t={pickup:'x',destination:'y',fareCents:5000};assert.equal(sandbox.attachBookingRoute(t),true);assert.equal(t.pickup,'Pickup');assert.equal(t.routeBaseline.miles,10);sandbox.tripDraft=t;sandbox.stage=2;sandbox.openLocations('trip');node('#addstop').onclick();assert.equal(run('workingPlan.stops.length'),1);node('#pointlabel').value='Friend pickup';node('#pointkind').value='street';node('#pinlat').value='29.79';node('#pinlon').value='-95.39';node('#pointentrance').value='Street-side';node('#pointconfirm').checked=true;assert.equal(sandbox.savePoint(),true);node('#routemiles').value='10.5';node('#routeminutes').value='34';node('#previewchange').onclick();assert.match(node('#changequote').innerHTML,/No extra charge/);node('#changeapprove').checked=true;node('#applyroutechange').onclick();assert.equal(t.fareCents,5000);assert.equal(t.routePlan.stops.length,1);
});
