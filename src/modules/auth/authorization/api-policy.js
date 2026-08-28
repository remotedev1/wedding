import { NextResponse } from "next/server";
import { POLICY_REGISTRY, evaluateAccessRule } from "@/modules/auth/authorization/policy-registry";

export function authorizeApiAction(action,user,{failClosed=false}={}){
  const rule=POLICY_REGISTRY.api[action];
  if(!rule){
    if(!failClosed) return {ok:true,user};
    return {ok:false,response:NextResponse.json({error:"API policy is not registered"},{status:403})};
  }
  if(!evaluateAccessRule(user,rule)){
    return {ok:false,response:NextResponse.json({error:"Forbidden"},{status:403})};
  }
  return {ok:true,user};
}
