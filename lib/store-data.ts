import {defaults,demoProducts} from '@/lib/catalog';
import {readSettings,readProducts} from '@/lib/server';
export async function loadStore(){try{const [settings,actual]=await Promise.all([readSettings(),readProducts()]);return{initialSettings:settings,initialProducts:actual.length?actual:(!settings.checkoutEnabled?demoProducts:[]),unavailable:false};}catch(e){console.error('Store unavailable',e);return{initialSettings:defaults,initialProducts:demoProducts,unavailable:true};}}
