function normalizeContext(context) {
  if (context === undefined) return undefined;
  if (context instanceof Error) return { name: context.name, message: context.message, stack: context.stack };
  if (context && typeof context === "object") return context;
  return { value: context };
}
function write(level,message,context){
  const payload={level,message,timestamp:new Date().toISOString(),...(context?{context}:{})};
  const out=JSON.stringify(payload);
  if(level==="error") return console.error(out);
  if(level==="warn") return console.warn(out);
  console.info(out);
}
export const logger={
  info(message,context){write("info",message,normalizeContext(context))},
  warn(message,context){write("warn",message,normalizeContext(context))},
  error(message,context){write("error",message,normalizeContext(context))},
};
