// Bölümler sırayla açılır: bir bölümün kilidi, kendisinden önceki tüm bölümler "tamamlandı" olunca kalkar.
// Durum yalnızca bu tarayıcıda (localStorage) tutulur; yazar önizlemesi için /?kilitleri-ac ile kapatılır.
const read=(key:string,fallback:any)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
export const gateOff=():boolean=>read('noir-gate-off',false)===true;
export const isDone=(slug:string):boolean=>read('noir-progress',{})?.[slug]?.done===true;
/** Verilen sıralı bölümlerden ilk tamamlanmamış olanı döndürür; hepsi tamamsa (ya da kilit kapalıysa) null. */
export const firstIncomplete=(before:string[]):string|null=>gateOff()?null:(before.find(slug=>!isDone(slug))??null);
