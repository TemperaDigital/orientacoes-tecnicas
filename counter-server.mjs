import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.pdf':'application/pdf'};
const allowedOrigins=new Set(['https://orientacoes-tecnicas.fguerra.ia.br','https://assessoria-tecnica-com.alexandre-guerra51.chatgpt.site']);
const publicFile=/^(?:[a-z0-9-]+\.html|(?:style\.css|app\.js|theme\.js|visits\.js|search-data\.js|catalog\.json|brasaoarmas1\.jpg)|(?:assets|paginas|originais)\/[a-zA-Z0-9_./% -]+)$/;

export function createApp({env=process.env,fetchImpl=fetch,staticRoot=root}={}){
 const limits=new Map();
 const timer=setInterval(()=>limits.clear(),60000);timer.unref();
 const server=http.createServer(async(req,res)=>{
  const json=(status,body,extra={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(JSON.stringify(body))};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok')}
   if(url.pathname==='/api/visits'){
    const origin=req.headers.origin;
    if(origin&&!allowedOrigins.has(origin))return json(403,{error:'Origem não permitida'});
    const cors=origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{};
    if(req.method==='OPTIONS'){res.writeHead(204,{...cors,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'});return res.end()}
    if(!['GET','POST'].includes(req.method))return json(405,{error:'Método não permitido'},cors);
    if(req.method==='POST'&&(!origin||!req.headers['content-type']?.startsWith('application/json')))return json(403,{error:'Requisição inválida'},cors);
    const ip=req.socket.remoteAddress||'local';
    const count=(limits.get(ip)||0)+1;limits.set(ip,count);
    if(count>600)return json(429,{error:'Tente novamente mais tarde'},{...cors,'Retry-After':'60'});
    let size=0;for await(const chunk of req){size+=chunk.length;if(size>1024)return json(413,{error:'Requisição muito grande'},cors)}
    if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return json(503,{error:'Contador em configuração'},cors);
    const upstream=new URL('/rest/v1/rpc/assessoria_contador',env.SUPABASE_URL);
    if(!['https:','http:'].includes(upstream.protocol)||upstream.username||upstream.password)throw new Error('Invalid configuration');
    const response=await fetchImpl(upstream,{method:'POST',redirect:'error',signal:AbortSignal.timeout(7000),headers:{'Content-Type':'application/json',apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`},body:JSON.stringify({registrar:req.method==='POST'})});
    if(!response.ok)return json(502,{error:'Contador temporariamente indisponível'},cors);
    const data=await response.json();const result={};
    for(const key of ['total','hoje','semana','mes','ano']){if(!Number.isSafeInteger(data[key])||data[key]<0)return json(502,{error:'Resposta inválida do contador'},cors);result[key]=data[key]}
    return json(200,result,cors);
   }
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
   let name=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
   if(name.includes('..')||!publicFile.test(name)){res.writeHead(404);return res.end('Não encontrado')}
   const file=path.resolve(staticRoot,name);if(!file.startsWith(path.resolve(staticRoot)+path.sep)){res.writeHead(404);return res.end()}
   let info;try{info=await stat(file)}catch{res.writeHead(404);return res.end('Não encontrado')}
   if(!info.isFile()){res.writeHead(404);return res.end()}
   const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':name.endsWith('.html')?'no-cache':'public, max-age=3600','Accept-Ranges':'bytes'};
   let start=0,end=info.size-1,status=200;
   if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end()}
    if(!m[1])start=Math.max(0,info.size-Number(m[2]));else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]))}
    if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end()}
    status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
   }
   headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
   if(req.method==='HEAD'||!info.size)return res.end();
   const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)json(503,{error:'Serviço temporariamente indisponível'},allowedOrigins.has(req.headers.origin)?{'Access-Control-Allow-Origin':req.headers.origin,'Vary':'Origin'}:{});else res.destroy()}
 });
 server.on('close',()=>clearInterval(timer));return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))createApp().listen(Number(process.env.PORT)||80,()=>console.log('Servidor iniciado'));
