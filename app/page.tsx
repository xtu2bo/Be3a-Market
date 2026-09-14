import Storefront from './storefront';
import {loadStore} from '@/lib/store-data';
export const dynamic='force-dynamic';
export default async function Home(){return <Storefront {...await loadStore()} view={{kind:'home'}}/>;}
