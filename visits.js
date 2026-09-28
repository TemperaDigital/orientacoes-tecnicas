(()=>{const box=document.querySelector('.footer-counter');if(!box)return;
const endpoint='https://orientacoes-tecnicas.fguerra.ia.br/api/visits';
if(!['orientacoes-tecnicas.fguerra.ia.br','assessoria-tecnica-com.alexandre-guerra51.chatgpt.site'].includes(location.hostname))return;
fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(10000)})
.then(async response=>{if(!response.ok)throw new Error();return response.json()})
.then(data=>{const keys=['total','hoje','semana','mes','ano'];if(keys.some(k=>!Number.isSafeInteger(data[k])||data[k]<0))throw new Error();const status=box.querySelector('.counter-status');status.hidden=true;const totals=box.querySelector('.counter-values');totals.hidden=false;keys.forEach(k=>{box.querySelector(`[data-count="${k}"]`).textContent=data[k].toLocaleString('pt-BR')})})
.catch(()=>{box.querySelector('.counter-status').textContent='Contador temporariamente indisponível';});})();
