export class PayloadTooLargeError extends Error{
  constructor(limitBytes){super(`Request body exceeds ${limitBytes} bytes.`);this.name="PayloadTooLargeError";this.limitBytes=limitBytes}
}
export async function readTextWithLimit(request,limitBytes){
  const declared=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(declared)&&declared>limitBytes) throw new PayloadTooLargeError(limitBytes);
  if(!request.body) return "";
  const reader=request.body.getReader(); const chunks=[]; let total=0;
  try{
    while(true){
      const {done,value}=await reader.read(); if(done)break; if(!value)continue;
      total+=value.byteLength;
      if(total>limitBytes){await reader.cancel("payload too large").catch(()=>undefined);throw new PayloadTooLargeError(limitBytes)}
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const merged=new Uint8Array(total); let offset=0;
  for(const chunk of chunks){merged.set(chunk,offset);offset+=chunk.byteLength}
  return new TextDecoder().decode(merged);
}
export async function readJsonWithLimit(request,limitBytes=64*1024){
  const text=await readTextWithLimit(request,limitBytes);
  return text?JSON.parse(text):{};
}
