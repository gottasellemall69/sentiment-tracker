(()=>{var e={};e.id=636,e.ids=[636],e.modules={6:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{r.d(t,{A:()=>h});var s=r(8732),i=r(2015);r(1106);var n=r(6715),c=r(2398),o=r(6580),l=r(4511),d=r(7900),u=r(6958),m=e([d,u]);[d,u]=m.then?(await m)():m;let p=process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL,h=()=>{let e=(0,n.useRouter)(),[t,r]=(0,i.useState)(null);(0,i.useEffect)(()=>{let e=(0,u.onAuthStateChanged)(d.j,e=>{e&&e.email===p?r(e):r(null)});return()=>e()},[]);let a=async()=>{try{await (0,u.signOut)(d.j),e.push("/login")}catch(e){console.error("Error logging out:",e)}},m=t=>e.pathname===t?"bg-blue-800":"";return(0,s.jsx)("nav",{className:"bg-blue-600 shadow-lg",children:(0,s.jsx)("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:(0,s.jsxs)("div",{className:"flex items-center justify-between h-16",children:[(0,s.jsx)("div",{className:"flex items-center",children:(0,s.jsxs)("a",{href:"/",rel:"noopener noreferrer",className:"flex items-center text-white",children:[(0,s.jsx)(c.A,{className:"h-8 w-8"}),(0,s.jsx)("span",{className:"ml-2 text-xl font-bold",children:"Sentiment Tracker"})]})}),(0,s.jsxs)("div",{className:"flex space-x-4",children:[(0,s.jsxs)("a",{href:"/",rel:"noopener noreferrer",className:`flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${m("/")}`,children:[(0,s.jsx)(o.A,{className:"h-4 w-4 mr-2"}),"Submit Opinion"]}),(0,s.jsxs)("span",{children:[(0,s.jsxs)("a",{href:"/dashboard",rel:"noopener noreferrer",className:`flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${m("/dashboard")}`,children:[(0,s.jsx)(l.A,{className:"h-4 w-4 mr-2"}),"Admin Dashboard"]}),t&&(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("button",{onClick:a,className:"bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md",children:"Logout"})})]})]})]})})})};a()}catch(e){a(e)}})},6312:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{default:()=>u});var s=r(8732);r(9361);var i=r(4062),n=r(7590),c=r(6110),o=r(4391),l=r(6);r(4467);var d=e([i,n,o,l]);function u({Component:e,pageProps:t}){let r=(0,n.P)(t.initialReduxState);return(0,s.jsx)(i.Provider,{store:r,children:(0,s.jsxs)(c.FacebookProvider,{appId:"your_facebook_app_id",children:[(0,s.jsxs)("div",{className:"min-h-screen bg-gray-100",children:[(0,s.jsx)(l.A,{}),(0,s.jsx)("main",{className:"max-w-7xl mx-auto py-6 sm:px-6 lg:px-8",children:(0,s.jsx)(e,{...t})})]}),(0,s.jsx)(o.ToastContainer,{position:"bottom-right"})]})})}[i,n,o,l]=d.then?(await d)():d,a()}catch(e){a(e)}})},9361:()=>{},6075:e=>{"use strict";e.exports=require("@tensorflow/tfjs")},361:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},2015:e=>{"use strict";e.exports=require("react")},2326:e=>{"use strict";e.exports=require("react-dom")},6110:e=>{"use strict";e.exports=require("react-facebook")},8732:e=>{"use strict";e.exports=require("react/jsx-runtime")},7021:e=>{"use strict";e.exports=require("sentiment")},9021:e=>{"use strict";e.exports=require("fs")},7910:e=>{"use strict";e.exports=require("stream")},4075:e=>{"use strict";e.exports=require("zlib")},9198:e=>{"use strict";e.exports=import("@reduxjs/toolkit")},4216:e=>{"use strict";e.exports=import("@xenova/transformers")},6551:e=>{"use strict";e.exports=import("firebase/app")},6958:e=>{"use strict";e.exports=import("firebase/auth")},6718:e=>{"use strict";e.exports=import("firebase/firestore")},4062:e=>{"use strict";e.exports=import("react-redux")},4391:e=>{"use strict";e.exports=import("react-toastify")},7900:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{r.d(t,{j:()=>l});var s=r(6551),i=r(6958),n=r(6718),c=e([s,i,n]);[s,i,n]=c.then?(await c)():c;let o=(0,s.initializeApp)({apiKey:"AIzaSyDh2ztJiyRUB-wgJeYFrdf5NhE-LHiVy70",authDomain:"sentiment-tracking-c9a95.firebaseapp.com",projectId:"sentiment-tracking-c9a95",storageBucket:"sentiment-tracking-c9a95.firebasestorage.app",messagingSenderId:"38978031824",appId:"1:38978031824:web:bc2b0f006d009954314ed5"}),l=(0,i.getAuth)(o);(0,n.getFirestore)(o),a()}catch(e){a(e)}})},192:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{r.d(t,{Ay:()=>m,CJ:()=>u,iq:()=>l,oN:()=>c});var s=r(9198),i=r(769),n=e([s,i]);[s,i]=n.then?(await n)():n;let c=(0,s.createAsyncThunk)("feedback/addFeedbackWithSentiment",async(e,{rejectWithValue:t})=>{try{let t=await (0,i.Gu)(e.feedback),r=void 0!==t.confidence?t.confidence:0;return{...e,predictedSpectrum:t.politicalSpectrum,sentiment:{score:t.score,magnitude:t.magnitude,confidence:r},timestamp:Date.now()}}catch(e){return t(e.message||"Failed to analyze sentiment")}}),o=(0,s.createSlice)({name:"feedback",initialState:{entries:[],loading:!1,error:null},reducers:{setFeedback(e,t){e.entries=t.payload},clearFeedback:e=>{e.entries=[]}},extraReducers:e=>{e.addCase(c.pending,e=>{e.loading=!0}).addCase(c.fulfilled,(e,t)=>{e.entries.push(t.payload),e.loading=!1}).addCase(c.rejected,(e,t)=>{e.error=t.payload||"An error occurred",e.loading=!1})}}),{setFeedback:l,clearFeedback:d}=o.actions,u=e=>e.feedback.entries,m=o.reducer;a()}catch(e){a(e)}})},7590:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{let c;r.d(t,{P:()=>d});var s=r(9198),i=r(192),n=e([s,i]);[s,i]=n.then?(await n)():n;let o=e=>(0,s.configureStore)({reducer:{feedback:i.Ay},preloadedState:e}),l=e=>{let t=c??o(e);return e&&c&&(t=o({...c.getState(),...e}),c=void 0),c||(c=t),t},d=e=>l(e);a()}catch(e){a(e)}})},769:(e,t,r)=>{"use strict";r.a(e,async(e,a)=>{try{r.d(t,{ES:()=>d,Gu:()=>l});var s=r(6075),i=r(4216),n=r(7021),c=e([i]);i=(c.then?(await c)():c)[0];let u=new n,m=null,p=null,h=!1;async function o(){if(!m&&!p&&!h){h=!0;try{await s.ready(),"cpu"!==s.getBackend()&&await s.setBackend("cpu"),m=await (0,i.pipeline)("text-classification","Xenova/distilbert-base-uncased-finetuned-sst-2-english"),p=await (0,i.pipeline)("sentiment-analysis","Xenova/distilbert-base-uncased-finetuned-sst-2-english"),console.log("NLP models initialized successfully")}catch(e){console.error("Error initializing NLP models:",e),m=null,p=null}finally{h=!1}}}async function l(e){if(!e?.trim())return{score:0,magnitude:0,topWords:[],confidence:0,sentimentLabel:"neutral"};try{m&&p||await o();let t=u.analyze(e),r=t.score/Math.max(t.tokens.length,1),a=t.words.slice(0,5);0===a.length&&(a=e.split(" ").slice(0,3));let s=0,i=0,n="neutral";if(p)try{let t=await p(e,{truncation:!0});s="POSITIVE"===t[0].label?t[0].score:-t[0].score,i=t[0].score,n=t[0].label.toLowerCase()}catch(e){console.warn("Transformer sentiment analysis failed:",e)}let c=.3*r+.7*s,l=Math.max(Math.min(c,1),-1);return .1>Math.abs(l)&&(n="neutral"),{score:l,magnitude:Math.abs(l),topWords:a,confidence:Math.max(i,.1),sentimentLabel:n}}catch(e){return console.error("Sentiment analysis failed:",e),{score:{},magnitude:{},topWords:[],confidence:{},sentimentLabel:"neutral"}}}async function d(e){let t=e.toLowerCase();if(m)try{let t=await m(e,{topk:1,truncation:!0}),r=t[0].label,a=t[0].score;return{spectrum:"POSITIVE"===r?"center-right":"center-left",confidence:a}}catch(e){console.warn("Transformer classification failed:",e)}let r=Object.entries({"far-left":{keywords:["revolution","socialism","communist","abolish","collective","undocumented immigrant","immigration","MAGA","nazi"],weight:1},left:{keywords:["progressive","welfare","regulation","equality","reform","undocumented immigrant","immigration"],weight:.6},"center-left":{keywords:["liberal","public","social","healthcare","education","undocumented immigrant","immigration"],weight:.3},center:{keywords:["moderate","compromise","balance","bipartisan","pragmatic"],weight:0},"center-right":{keywords:["conservative","tradition","market","fiscal","values","illegal alien","invasion","border war"],weight:-.3},right:{keywords:["freedom","liberty","deregulation","privatize","tax cuts","illegal alien","invasion","border war"],weight:-.6},"far-right":{keywords:["nationalist","sovereignty","patriot","traditional","strong","illegal alien","invasion","border war","the Libs","Dems","MAGA","fascist"],weight:-1}}).map(([e,r])=>{let a=r.keywords.reduce((e,a)=>{let s=t.split(a.toLowerCase()).length-1;return e+s*r.weight},0);return{category:e,score:a}});r.sort((e,t)=>t.score-e.score);let a=r[0],s=Math.min(Math.max(.5*Math.abs(a.score),.1),1);return{spectrum:0!==a.score?a.category:"center",confidence:s}}(async()=>{await o()})(),a()}catch(e){a(e)}})}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[585,4],()=>r(6312));module.exports=a})();