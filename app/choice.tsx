'use client';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
export function Choice({value,onChange,options,label}:{value:string;onChange:(v:string)=>void;options:string[];label:string}){return <Select dir="rtl" value={value||undefined} onValueChange={onChange}><SelectTrigger className="choice" aria-label={label}><SelectValue placeholder={label}/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>;}
