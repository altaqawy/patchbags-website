import {db,publicJson} from '../../../lib/server';
export const runtime='nodejs';
export async function GET(){
 const [p,c,m,s]=await Promise.all([
  db().query("SELECT id,title,title_ar,description,description_ar,price_minor,badge_ar,compare_at_minor,stock,active,image_url,category_slug,media,badge,featured,position FROM products WHERE active=true AND price_minor>0 AND stock>0 ORDER BY position,id"),
  db().query("SELECT slug,name_ar,name_en FROM categories WHERE active=true ORDER BY position,slug"),
  db().query('SELECT method,enabled FROM payment_methods ORDER BY method'),
  db().query('SELECT shipping_minor FROM store_settings WHERE id=1')
 ]);
 return publicJson({
  currency:'EGP',products:p.rows,categories:c.rows,methods:m.rows,
  shippingConfigured:s.rows[0]?.shipping_minor!==null&&s.rows[0]?.shipping_minor!==undefined,
  shippingMinor:s.rows[0]?.shipping_minor??null
 });
}
