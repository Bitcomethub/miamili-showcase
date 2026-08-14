import { redirect } from 'next/navigation';

import { birincilProje } from '@/lib/projects';

/**
 * Kök URL, birincil projeye yönlendirir. Tek projeli bir dağıtımda kullanıcı
 * farkı hissetmez; ikinci bir proje eklendiğinde her ikisi de kendi URL'inde
 * yaşar ve buradaki tercih tek satırda değişir.
 */
export default function Home() {
  redirect(`/${birincilProje().slug}`);
}
