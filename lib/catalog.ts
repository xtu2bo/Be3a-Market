export type Product = { images?: string[]; revision?: number; id: string; name: string; category: string; price: number; image: string; description: string; sizes: string[]; colors: string[]; stock: number; active: boolean; demo: boolean; featured: boolean };
export type Settings = { editorialTitle?: string; editorialText?: string; editorialImage?: string; categoryImages?: Record<string,string>; name: string; tagline: string; announcement: string; heroTitle: string; heroText: string; heroImage: string; logo: string; phone: string; email: string; instagram: string; facebook: string; telegram: string; tiktok: string; categories: string[]; shipping: {name: string; price: number}[]; privacy: string; returns: string; about: string; checkoutEnabled: boolean; accent: string };
export const defaults: Settings = {
 editorialTitle:'اللوك الحلو\nفي تفاصيله.',editorialText:'قطعة بسيطة، شنطة مميزة، ولمستك إنتِ. اختاري الحاجات اللي تحبي تلبسيها بطريقتك.',editorialImage:'/images/collection.png',categoryImages:{}, name:'بيعة', tagline:'حاجات على ذوقك', announcement:'ستايل يشبهك، وتفاصيل تكمّلك', heroTitle:'على ذوقك.\nعلى طبيعتك.', heroText:'هدوم تحبيها، وشنطة تكمّل الحكاية. اكتشفي اختيارات بيعة لكل يوم ولكل خروجة.', heroImage:'/images/editorial.png', logo:'/images/brand-reference.png',
 phone:'+201039396897', email:'be3amarket@gmail.com', instagram:'https://www.instagram.com/be3a.market?stkn=MTZ3MGc4eGVjZ3hmaA==', facebook:'https://www.facebook.com/share/1DK54i6GAB/?mibextid=wwXIfr', telegram:'https://t.me/be3a_market', tiktok:'https://www.tiktok.com/@be3a.market?is_from_webapp=1&sender_device=pc',
 categories:['ملابس','شنط'], shipping:[], privacy:'نستخدم الاسم ورقم الموبايل والعنوان لتجهيز طلبك والتواصل بخصوصه. للاستفسار أو طلب حذف بياناتك تواصلي معنا على بريد المتجر.', returns:'تواصلي مع بيعة لمعرفة تفاصيل الاستبدال والاسترجاع قبل تأكيد الطلب.', about:'بيعة براند مصري أونلاين للهدوم البناتي والشنط الحريمي. بنختار تفاصيل عملية وأنيقة تكمّل ستايلك بطريقتك.', checkoutEnabled:false, accent:'#FF6B3D'
};
export const demoProducts: Product[] = [
 {id:'demo-1',name:'قميص لينن أوفر سايز',category:'ملابس',price:650,image:'/images/collection.png',description:'نموذج توضيحي لشكل عرض المنتجات. أضيفي صور ومواصفات منتجاتك الفعلية من لوحة الإدارة.',sizes:['S','M','L','XL'],colors:['أوف وايت','أسود'],stock:0,active:true,demo:true,featured:true},
 {id:'demo-2',name:'شنطة يومك المفضلة',category:'شنط',price:790,image:'/images/collection.png',description:'نموذج توضيحي غير متاح للبيع.',sizes:['مقاس واحد'],colors:['أسود'],stock:0,active:true,demo:true,featured:true},
 {id:'demo-3',name:'لوك بسيط لكل خروجة',category:'ملابس',price:950,image:'/images/editorial.png',description:'نموذج توضيحي غير متاح للبيع.',sizes:['S','M','L'],colors:['أوف وايت'],stock:0,active:true,demo:true,featured:true},
 {id:'demo-4',name:'شنطة بتفاصيل مميزة',category:'شنط',price:850,image:'/images/collection.png',description:'نموذج توضيحي غير متاح للبيع.',sizes:['مقاس واحد'],colors:['أسود'],stock:0,active:true,demo:true,featured:false}
];
export const money = (v:number) => new Intl.NumberFormat('ar-EG',{maximumFractionDigits:2}).format(v)+' ج.م';



