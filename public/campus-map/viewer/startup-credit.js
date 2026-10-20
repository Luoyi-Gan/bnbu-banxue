// Show the source notice on entry; full licence remains in Data & Offline.
const credit = document.getElementById('map-startup-credit');
if (credit) {
  Object.assign(credit.style, {position:'fixed',top:'72px',bottom:'auto',left:'50%',right:'auto',transform:'translateX(-50%)',zIndex:'100',display:'block'});
  const notice=credit.querySelector('.attribution');
  Object.assign(notice.style,{fontSize:'12px',lineHeight:'1.5',padding:'6px 10px',background:'#fffefa',borderRadius:'8px',whiteSpace:'nowrap'});
  window.setTimeout(() => credit.remove(), 5000);
}
