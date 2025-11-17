import{r as c,j as e}from"./index-jQJV2EFP.js";const m=({isOpen:a,onClose:t,title:i,children:n,size:r="lg",disableContentPadding:o=!1})=>{if(c.useEffect(()=>{const s=d=>{d.key==="Escape"&&t()};return window.addEventListener("keydown",s),()=>{window.removeEventListener("keydown",s)}},[t]),!a)return null;const l={md:"max-w-md",lg:"max-w-2xl",xl:"max-w-4xl","2xl":"max-w-6xl"};return e.jsxs("div",{className:"fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4 transition-opacity duration-300",onClick:t,children:[e.jsxs("div",{className:`bg-sidebar rounded-xl shadow-2xl w-full ${l[r]} max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale`,onClick:s=>s.stopPropagation(),style:{animationFillMode:"forwards"},children:[e.jsxs("div",{className:"p-5 border-b border-border flex justify-between items-center sticky top-0 bg-sidebar rounded-t-xl z-10",children:[e.jsx("h3",{className:"text-lg font-semibold text-text-main",children:i}),e.jsx("button",{onClick:t,className:"text-text-secondary hover:text-text-main rounded-full p-1 hover:bg-sidebar-accent",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),e.jsx("div",{className:`overflow-y-auto ${o?"":"p-6"}`,children:n})]}),e.jsx("style",{children:`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out;
        }
      `})]})};export{m as M};
