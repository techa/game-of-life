function k(){}function rt(t,e){for(const n in e)t[n]=e[n];return t}function Q(t){return t()}function G(){return Object.create(null)}function $(t){t.forEach(Q)}function H(t){return typeof t=="function"}function Et(t,e){return t!=t?e==e:t!==e||t&&typeof t=="object"||typeof t=="function"}function st(t){return Object.keys(t).length===0}function ot(t,...e){if(t==null)return k;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function kt(t,e,n){t.$$.on_destroy.push(ot(e,n))}function Nt(t,e,n,i){if(t){const r=U(t,e,n,i);return t[0](r)}}function U(t,e,n,i){return t[1]&&i?rt(n.ctx.slice(),t[1](i(e))):n.ctx}function At(t,e,n,i){if(t[2]&&i){const r=t[2](i(n));if(e.dirty===void 0)return r;if(typeof r=="object"){const o=[],s=Math.max(e.dirty.length,r.length);for(let a=0;a<s;a+=1)o[a]=e.dirty[a]|r[a];return o}return e.dirty|r}return e.dirty}function St(t,e,n,i,r,o){if(r){const s=U(e,n,i,o);t.p(s,r)}}function Ct(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let i=0;i<n;i++)e[i]=-1;return e}return-1}function Mt(t){const e={};for(const n in t)n[0]!=="$"&&(e[n]=t[n]);return e}function jt(t){return t==null?"":t}function Dt(t,e,n){return t.set(n),e}function Tt(t){return t&&H(t.destroy)?t.destroy:k}let j=!1;function ct(){j=!0}function ut(){j=!1}function at(t,e,n,i){for(;t<e;){const r=t+(e-t>>1);n(r)<=i?t=r+1:e=r}return t}function lt(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const c=[];for(let u=0;u<e.length;u++){const f=e[u];f.claim_order!==void 0&&c.push(f)}e=c}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let r=0;for(let c=0;c<e.length;c++){const u=e[c].claim_order,f=(r>0&&e[n[r]].claim_order<=u?r+1:at(1,r,d=>e[n[d]].claim_order,u))-1;i[c]=n[f]+1;const _=f+1;n[_]=c,r=Math.max(_,r)}const o=[],s=[];let a=e.length-1;for(let c=n[r]+1;c!=0;c=i[c-1]){for(o.push(e[c-1]);a>=c;a--)s.push(e[a]);a--}for(;a>=0;a--)s.push(e[a]);o.reverse(),s.sort((c,u)=>c.claim_order-u.claim_order);for(let c=0,u=0;c<s.length;c++){for(;u<o.length&&s[c].claim_order>=o[u].claim_order;)u++;const f=u<o.length?o[u]:null;t.insertBefore(s[c],f)}}function ft(t,e){t.appendChild(e)}function dt(t,e){if(j){for(lt(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function zt(t,e,n){j&&!n?dt(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function V(t){t.parentNode&&t.parentNode.removeChild(t)}function Lt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function X(t){return document.createElement(t)}function _t(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function q(t){return document.createTextNode(t)}function Ot(){return q(" ")}function Pt(){return q("")}function J(t,e,n,i){return t.addEventListener(e,n,i),()=>t.removeEventListener(e,n,i)}function Wt(t){return function(e){return e.preventDefault(),t.call(this,e)}}function Bt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Ht(t){return t===""?null:+t}function ht(t){return Array.from(t.childNodes)}function mt(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function Y(t,e,n,i,r=!1){mt(t);const o=(()=>{for(let s=t.claim_info.last_index;s<t.length;s++){const a=t[s];if(e(a)){const c=n(a);return c===void 0?t.splice(s,1):t[s]=c,r||(t.claim_info.last_index=s),a}}for(let s=t.claim_info.last_index-1;s>=0;s--){const a=t[s];if(e(a)){const c=n(a);return c===void 0?t.splice(s,1):t[s]=c,r?c===void 0&&t.claim_info.last_index--:t.claim_info.last_index=s,a}}return i()})();return o.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,o}function Z(t,e,n,i){return Y(t,r=>r.nodeName===e,r=>{const o=[];for(let s=0;s<r.attributes.length;s++){const a=r.attributes[s];n[a.name]||o.push(a.name)}o.forEach(s=>r.removeAttribute(s))},()=>i(e))}function qt(t,e,n){return Z(t,e,n,X)}function Ft(t,e,n){return Z(t,e,n,_t)}function pt(t,e){return Y(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>q(e),!0)}function It(t){return pt(t," ")}function Rt(t,e){e=""+e,t.data!==e&&(t.data=e)}function Gt(t,e){t.value=e==null?"":e}function Jt(t,e,n,i){n==null?t.style.removeProperty(e):t.style.setProperty(e,n,i?"important":"")}let C;function yt(){if(C===void 0){C=!1;try{typeof window<"u"&&window.parent&&window.parent.document}catch{C=!0}}return C}function Kt(t,e){getComputedStyle(t).position==="static"&&(t.style.position="relative");const i=X("iframe");i.setAttribute("style","display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"),i.setAttribute("aria-hidden","true"),i.tabIndex=-1;const r=yt();let o;return r?(i.src="data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}<\/script>",o=J(window,"message",s=>{s.source===i.contentWindow&&e()})):(i.src="about:blank",i.onload=()=>{o=J(i.contentWindow,"resize",e),e()}),ft(t,i),()=>{(r||o&&i.contentWindow)&&o(),V(i)}}function Qt(t,e,n){t.classList[n?"add":"remove"](e)}function gt(t,e,{bubbles:n=!1,cancelable:i=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,i,e),r}function Ut(t,e){const n=[];let i=0;for(const r of e.childNodes)if(r.nodeType===8){const o=r.textContent.trim();o===`HEAD_${t}_END`?(i-=1,n.push(r)):o===`HEAD_${t}_START`&&(i+=1,n.push(r))}else i>0&&n.push(r);return n}function Vt(t,e){return new t(e)}let N;function E(t){N=t}function v(){if(!N)throw new Error("Function called outside component initialization");return N}function Xt(t){v().$$.on_mount.push(t)}function Yt(t){v().$$.after_update.push(t)}function Zt(t){v().$$.on_destroy.push(t)}function te(){const t=v();return(e,n,{cancelable:i=!1}={})=>{const r=t.$$.callbacks[e];if(r){const o=gt(e,n,{cancelable:i});return r.slice().forEach(s=>{s.call(t,o)}),!o.defaultPrevented}return!0}}function ee(t,e){return v().$$.context.set(t,e),e}function ne(t){return v().$$.context.get(t)}const x=[],K=[];let w=[];const P=[],tt=Promise.resolve();let W=!1;function et(){W||(W=!0,tt.then(nt))}function ie(){return et(),tt}function B(t){w.push(t)}function re(t){P.push(t)}const O=new Set;let b=0;function nt(){if(b!==0)return;const t=N;do{try{for(;b<x.length;){const e=x[b];b++,E(e),bt(e.$$)}}catch(e){throw x.length=0,b=0,e}for(E(null),x.length=0,b=0;K.length;)K.pop()();for(let e=0;e<w.length;e+=1){const n=w[e];O.has(n)||(O.add(n),n())}w.length=0}while(x.length);for(;P.length;)P.pop()();W=!1,O.clear(),E(t)}function bt(t){if(t.fragment!==null){t.update(),$(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(B)}}function xt(t){const e=[],n=[];w.forEach(i=>t.indexOf(i)===-1?e.push(i):n.push(i)),n.forEach(i=>i()),w=e}const M=new Set;let g;function se(){g={r:0,c:[],p:g}}function oe(){g.r||$(g.c),g=g.p}function it(t,e){t&&t.i&&(M.delete(t),t.i(e))}function ce(t,e,n,i){if(t&&t.o){if(M.has(t))return;M.add(t),g.c.push(()=>{M.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}function ue(t,e){t.d(1),e.delete(t.key)}function ae(t,e,n,i,r,o,s,a,c,u,f,_){let d=t.length,m=o.length,h=d;const D={};for(;h--;)D[t[h].key]=h;const A=[],T=new Map,z=new Map,F=[];for(h=m;h--;){const l=_(r,o,h),p=n(l);let y=s.get(p);y?i&&F.push(()=>y.p(l,e)):(y=u(p,l),y.c()),T.set(p,A[h]=y),p in D&&z.set(p,Math.abs(h-D[p]))}const I=new Set,R=new Set;function L(l){it(l,1),l.m(a,f),s.set(l.key,l),f=l.first,m--}for(;d&&m;){const l=A[m-1],p=t[d-1],y=l.key,S=p.key;l===p?(f=l.first,d--,m--):T.has(S)?!s.has(y)||I.has(y)?L(l):R.has(S)?d--:z.get(y)>z.get(S)?(R.add(y),L(l)):(I.add(S),d--):(c(p,s),d--)}for(;d--;){const l=t[d];T.has(l.key)||c(l,s)}for(;m;)L(A[m-1]);return $(F),A}function le(t,e,n){const i=t.$$.props[e];i!==void 0&&(t.$$.bound[i]=n,n(t.$$.ctx[i]))}function fe(t){t&&t.c()}function de(t,e){t&&t.l(e)}function wt(t,e,n,i){const{fragment:r,after_update:o}=t.$$;r&&r.m(e,n),i||B(()=>{const s=t.$$.on_mount.map(Q).filter(H);t.$$.on_destroy?t.$$.on_destroy.push(...s):$(s),t.$$.on_mount=[]}),o.forEach(B)}function $t(t,e){const n=t.$$;n.fragment!==null&&(xt(n.after_update),$(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function vt(t,e){t.$$.dirty[0]===-1&&(x.push(t),et(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function _e(t,e,n,i,r,o,s,a=[-1]){const c=N;E(t);const u=t.$$={fragment:null,ctx:[],props:o,update:k,not_equal:r,bound:G(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:G(),dirty:a,skip_bound:!1,root:e.target||c.$$.root};s&&s(u.root);let f=!1;if(u.ctx=n?n(t,e.props||{},(_,d,...m)=>{const h=m.length?m[0]:d;return u.ctx&&r(u.ctx[_],u.ctx[_]=h)&&(!u.skip_bound&&u.bound[_]&&u.bound[_](h),f&&vt(t,_)),d}):[],u.update(),f=!0,$(u.before_update),u.fragment=i?i(u.ctx):!1,e.target){if(e.hydrate){ct();const _=ht(e.target);u.fragment&&u.fragment.l(_),_.forEach(V)}else u.fragment&&u.fragment.c();e.intro&&it(t.$$.fragment),wt(t,e.target,e.anchor,e.customElement),ut(),nt()}E(c)}class he{$destroy(){$t(this,1),this.$destroy=k}$on(e,n){if(!H(n))return k;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const r=i.indexOf(n);r!==-1&&i.splice(r,1)}}$set(e){this.$$set&&!st(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}export{Gt as $,ie as A,k as B,Nt as C,St as D,Ct as E,At as F,dt as G,kt as H,Qt as I,J,Wt as K,Lt as L,$ as M,Dt as N,K as O,jt as P,H as Q,rt as R,he as S,Mt as T,ot as U,B as V,Kt as W,Tt as X,te as Y,_t as Z,Ft as _,Ot as a,Ht as a0,le as a1,re as a2,ae as a3,ne as a4,ue as a5,ee as a6,Zt as a7,Ut as a8,zt as b,It as c,oe as d,Pt as e,it as f,se as g,V as h,_e as i,Yt as j,X as k,qt as l,ht as m,Bt as n,Xt as o,Jt as p,q,pt as r,Et as s,ce as t,Rt as u,Vt as v,fe as w,de as x,wt as y,$t as z};