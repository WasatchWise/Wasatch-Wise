/**
 * Dan's Audio Introduction API
 *
 * Generates multilingual audio of Dan introducing himself using ElevenLabs
 * Caches audio in Supabase Storage for instant playback
 * Supports 29 languages
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSpeech } from '@/lib/elevenlabs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
);

// Dan's introduction in 29 languages
const DAN_SCRIPTS: Record<string, string> = {
  en: "I didn't get the mascot job with the hockey team. The Mammoth had thicker fur and better skates. So now I'm the guide for SLCTrips.com instead. I spent almost twenty years around Liberty Park helping kids make music, videos, and wild ideas come to life. These mountains and canyons raised me as much as any classroom. People call me the Wasatch Sasquatch, but you can call me Dan. I'll help you find the trails worth walking, the coffee that wakes your soul, and the Utah moments you can't buy in a gift shop. Wander wisely, travel kindly, and stay curious.",

  es: "No conseguí el trabajo de mascota con el equipo de hockey. El Mamut tenía pelaje más grueso y mejores patines. Así que ahora soy el guía de SLCTrips.com. Pasé casi veinte años en Liberty Park ayudando a niños a crear música, videos e ideas increíbles. Estas montañas y cañones me criaron tanto como cualquier aula. La gente me llama el Wasatch Sasquatch, pero puedes llamarme Dan. Te ayudaré a encontrar los senderos que vale la pena caminar, el café que despierta tu alma y los momentos de Utah que no puedes comprar en una tienda de regalos. Viaja sabiamente, viaja amablemente y mantén la curiosidad.",

  fr: "Je n'ai pas obtenu le poste de mascotte pour l'équipe de hockey. Le Mammouth avait une fourrure plus épaisse et de meilleurs patins. Alors maintenant, je suis le guide de SLCTrips.com. J'ai passé près de vingt ans autour de Liberty Park à aider les enfants à créer de la musique, des vidéos et des idées folles. Ces montagnes et ces canyons m'ont élevé autant que n'importe quelle classe. Les gens m'appellent le Wasatch Sasquatch, mais vous pouvez m'appeler Dan. Je vous aiderai à trouver les sentiers qui valent la peine d'être parcourus, le café qui réveille votre âme et les moments de l'Utah que vous ne pouvez pas acheter dans une boutique de cadeaux. Voyagez sagement, voyagez gentiment et restez curieux.",

  de: "Ich habe den Maskottchen-Job beim Hockey-Team nicht bekommen. Das Mammut hatte dickeres Fell und bessere Schlittschuhe. Also bin ich jetzt der Führer für SLCTrips.com. Ich habe fast zwanzig Jahre in der Nähe von Liberty Park verbracht und Kindern geholfen, Musik, Videos und wilde Ideen zum Leben zu erwecken. Diese Berge und Canyons haben mich genauso erzogen wie jedes Klassenzimmer. Die Leute nennen mich den Wasatch Sasquatch, aber du kannst mich Dan nennen. Ich helfe dir, die Wege zu finden, die es wert sind, gegangen zu werden, den Kaffee, der deine Seele weckt, und die Utah-Momente, die du in keinem Geschenkeladen kaufen kannst. Reise weise, reise freundlich und bleib neugierig.",

  pt: "Não consegui o emprego de mascote no time de hóquei. O Mamute tinha pelo mais grosso e patins melhores. Então agora sou o guia do SLCTrips.com. Passei quase vinte anos perto do Liberty Park ajudando crianças a criar música, vídeos e ideias malucas. Essas montanhas e cânions me criaram tanto quanto qualquer sala de aula. As pessoas me chamam de Wasatch Sasquatch, mas você pode me chamar de Dan. Vou ajudá-lo a encontrar as trilhas que valem a pena percorrer, o café que desperta sua alma e os momentos de Utah que você não pode comprar em uma loja de presentes. Viaje com sabedoria, viaje com gentileza e permaneça curioso.",

  it: "Non ho ottenuto il lavoro di mascotte con la squadra di hockey. Il Mammut aveva pelliccia più spessa e pattini migliori. Quindi ora sono la guida di SLCTrips.com. Ho trascorso quasi vent'anni intorno a Liberty Park aiutando i bambini a creare musica, video e idee folli. Queste montagne e canyon mi hanno cresciuto tanto quanto qualsiasi classe. La gente mi chiama Wasatch Sasquatch, ma puoi chiamarmi Dan. Ti aiuterò a trovare i sentieri che vale la pena percorrere, il caffè che risveglia la tua anima e i momenti dello Utah che non puoi comprare in un negozio di souvenir. Viaggia con saggezza, viaggia con gentilezza e rimani curioso.",

  zh: "我没有得到曲棍球队吉祥物的工作。猛犸象有更厚的毛皮和更好的冰鞋。所以现在我是SLCTrips.com的向导。我在自由公园附近度过了将近二十年，帮助孩子们创作音乐、视频和疯狂的想法。这些山脉和峡谷就像任何教室一样养育了我。人们叫我瓦萨奇大脚怪，但你可以叫我丹。我会帮你找到值得走的小径，唤醒你灵魂的咖啡，以及那些在礼品店买不到的犹他时刻。明智地旅行，友善地旅行，保持好奇心。",

  ja: "私はホッケーチームのマスコットの仕事を得られませんでした。マンモスはより厚い毛皮とより良いスケート靴を持っていました。だから今、私はSLCTrips.comのガイドをしています。リバティパークの周辺で約20年間を過ごし、子供たちが音楽、ビデオ、そして素晴らしいアイデアを実現するのを手伝ってきました。これらの山々と峡谷は、どんな教室と同じくらい私を育ててくれました。人々は私をワサッチサスカッチと呼びますが、ダンと呼んでください。歩く価値のあるトレイル、魂を目覚めさせるコーヒー、そしてギフトショップでは買えないユタの瞬間を見つけるお手伝いをします。賢く旅し、親切に旅し、好奇心を持ち続けてください。",

  ko: "하키 팀 마스코트 일을 얻지 못했어요. 매머드가 더 두꺼운 털과 더 나은 스케이트를 가지고 있었거든요. 그래서 이제 SLCTrips.com의 가이드가 되었습니다. 리버티 파크 주변에서 거의 20년을 보내며 아이들이 음악, 비디오, 그리고 기발한 아이디어를 실현하도록 도왔습니다. 이 산과 협곡은 어떤 교실만큼이나 저를 키워주었어요. 사람들은 저를 와사치 사스콰치라고 부르지만, 댄이라고 불러주세요. 걸을 가치가 있는 길, 영혼을 깨우는 커피, 그리고 선물 가게에서 살 수 없는 유타의 순간을 찾는 데 도움을 드릴게요. 현명하게 여행하고, 친절하게 여행하며, 호기심을 유지하세요.",

  nl: "Ik kreeg de mascotte-baan bij het hockeyteam niet. De Mammoet had dikkere vacht en betere schaatsen. Dus nu ben ik de gids voor SLCTrips.com. Ik heb bijna twintig jaar rond Liberty Park doorgebracht om kinderen te helpen muziek, video's en wilde ideeën tot leven te brengen. Deze bergen en canyons hebben me net zoveel opgevoed als elk klaslokaal. Mensen noemen me de Wasatch Sasquatch, maar je mag me Dan noemen. Ik help je de paden te vinden die het lopen waard zijn, de koffie die je ziel wakker maakt, en de Utah-momenten die je niet in een cadeauwinkel kunt kopen. Reis verstandig, reis vriendelijk en blijf nieuwsgierig.",

  pl: "Nie dostałem pracy jako maskotka drużyny hokejowej. Mamut miał grubsze futro i lepsze łyżwy. Więc teraz jestem przewodnikiem dla SLCTrips.com. Spędziłem prawie dwadzieścia lat wokół Liberty Park, pomagając dzieciom tworzyć muzykę, filmy i dzikie pomysły. Te góry i kaniony wychowały mnie tak samo jak każda klasa. Ludzie nazywają mnie Wasatch Sasquatch, ale możesz mnie nazywać Dan. Pomogę ci znaleźć szlaki warte chodzenia, kawę, która budzi twoją duszę, oraz momenty Utah, których nie można kupić w sklepie z pamiątkami. Podróżuj mądrze, podróżuj życzliwie i zachowaj ciekawość.",

  tr: "Hokey takımında maskot işini alamadım. Mamut'un daha kalın kürkü ve daha iyi patenler vardı. Bu yüzden şimdi SLCTrips.com için rehberim. Liberty Park çevresinde neredeyse yirmi yıl geçirdim, çocukların müzik, video ve çılgın fikirleri hayata geçirmesine yardımcı oldum. Bu dağlar ve kanyonlar beni herhangi bir sınıf kadar büyüttü. İnsanlar bana Wasatch Sasquatch diyor ama bana Dan diyebilirsiniz. Yürümeye değer patikalar, ruhunuzu uyandıran kahve ve Utah'ın hediye dükkanında satın alamayacağınız anlarını bulmanıza yardımcı olacağım. Akıllıca seyahat edin, nazikçe seyahat edin ve meraklı kalın.",

  ru: "Я не получил работу талисмана в хоккейной команде. У Мамонта был более густой мех и лучшие коньки. Поэтому теперь я гид на SLCTrips.com. Я провел почти двадцать лет около Либерти-парка, помогая детям создавать музыку, видео и сумасшедшие идеи. Эти горы и каньоны вырастили меня не меньше, чем любой класс. Люди называют меня Вассач Снежный человек, но вы можете звать меня Дэн. Я помогу вам найти тропы, по которым стоит идти, кофе, который пробуждает вашу душу, и моменты Юты, которые нельзя купить в сувенирном магазине. Путешествуйте мудро, путешествуйте доброжелательно и оставайтесь любопытными.",

  ar: "لم أحصل على وظيفة التميمة مع فريق الهوكي. كان لدى الماموث فرو أكثر سمكًا وزلاجات أفضل. لذا أنا الآن دليل SLCTrips.com بدلاً من ذلك. قضيت ما يقرب من عشرين عامًا حول ليبرتي بارك مساعدة الأطفال على صنع الموسيقى ومقاطع الفيديو والأفكار الجامحة. هذه الجبال والوديان ربتني بقدر أي فصل دراسي. يطلق علي الناس اسم واساتش ساسكواتش، لكن يمكنك أن تناديني دان. سأساعدك في العثور على الممرات التي تستحق المشي، والقهوة التي توقظ روحك، ولحظات يوتا التي لا يمكنك شراؤها في متجر الهدايا. سافر بحكمة، وسافر بلطف، وابق فضوليًا.",

  hi: "मुझे हॉकी टीम के साथ शुभंकर की नौकरी नहीं मिली। मैमथ के पास मोटी फर और बेहतर स्केट्स थे। तो अब मैं SLCTrips.com के लिए गाइड हूं। मैंने लिबर्टी पार्क के आसपास लगभग बीस साल बिताए, बच्चों को संगीत, वीडियो और जंगली विचारों को जीवन में लाने में मदद की। इन पहाड़ों और घाटियों ने मुझे किसी भी कक्षा जितना ही पाला। लोग मुझे वासच सास्क्वाच कहते हैं, लेकिन आप मुझे डैन कह सकते हैं। मैं आपको चलने योग्य पगडंडियां, आपकी आत्मा को जगाने वाली कॉफी, और यूटा के पल खोजने में मदद करूंगा जिन्हें आप गिफ्ट शॉप में नहीं खरीद सकते। बुद्धिमानी से यात्रा करें, दयालुता से यात्रा करें, और जिज्ञासु बने रहें।",

  sv: "Jag fick inte maskot-jobbet med hockeylaget. Mamutten hade tjockare päls och bättre skridskor. Så nu är jag guide för SLCTrips.com istället. Jag tillbringade nästan tjugo år runt Liberty Park och hjälpte barn att skapa musik, videor och vilda idéer. Dessa berg och kanjoner uppfostrade mig lika mycket som något klassrum. Folk kallar mig Wasatch Sasquatch, men du kan kalla mig Dan. Jag hjälper dig hitta stigarna som är värda att vandra, kaffet som väcker din själ och Utah-ögonblicken du inte kan köpa i en presentbutik. Vandra klokt, res vänligt och förbli nyfiken.",

  da: "Jeg fik ikke maskot-jobbet med hockeyholdet. Mammuten havde tykkere pels og bedre skøjter. Så nu er jeg guide for SLCTrips.com i stedet. Jeg brugte næsten tyve år omkring Liberty Park på at hjælpe børn med at skabe musik, videoer og vilde ideer. Disse bjerge og kløfter opfostrede mig lige så meget som ethvert klasseværelse. Folk kalder mig Wasatch Sasquatch, men du kan kalde mig Dan. Jeg vil hjælpe dig med at finde stierne, der er værd at gå, kaffen der vækker din sjæl, og Utah-øjeblikkene du ikke kan købe i en gavebutik. Vandre klogt, rejs venligt og forbliv nysgerrig.",

  no: "Jeg fikk ikke maskot-jobben med ishockeylaget. Mammuten hadde tykkere pels og bedre skøyter. Så nå er jeg guide for SLCTrips.com i stedet. Jeg tilbrakte nesten tjue år rundt Liberty Park og hjalp barn med å lage musikk, videoer og ville ideer. Disse fjellene og kanyonene oppdro meg like mye som et hvilket som helst klasserom. Folk kaller meg Wasatch Sasquatch, men du kan kalle meg Dan. Jeg vil hjelpe deg med å finne stiene som er verdt å gå, kaffen som vekker din sjel, og Utah-øyeblikkene du ikke kan kjøpe i en gavebutikk. Vandre klokt, reis vennlig og hold deg nysgjerrig.",

  fi: "En saanut maskotti-työtä jääkiekkojoukkueessa. Mammutilla oli paksumpi turkki ja paremmat luistimet. Joten nyt olen SLCTrips.com-opas sen sijaan. Vietin lähes kaksikymmentä vuotta Liberty Parkin ympärillä auttaen lapsia luomaan musiikkia, videoita ja villejä ideoita. Nämä vuoret ja kanjonit kasvattivat minua yhtä paljon kuin mikä tahansa luokkahuone. Ihmiset kutsuvat minua Wasatch Sasquatchiksi, mutta voit kutsua minua Daniksi. Autan sinua löytämään polut, joita kannattaa kävellä, kahvin, joka herättää sielusi, ja Utahin hetket, joita et voi ostaa lahjakaupasta. Vaella viisaasti, matkusta ystävällisesti ja pysy uteliaana.",

  cs: "Nedostal jsem práci maskota v hokejovém týmu. Mamut měl hustší kožich a lepší brusle. Takže teď jsem průvodce pro SLCTrips.com. Strávil jsem téměř dvacet let kolem Liberty Park a pomáhal jsem dětem vytvářet hudbu, videa a divoké nápady. Tyto hory a kaňony mě vychovaly stejně jako každá třída. Lidé mi říkají Wasatch Sasquatch, ale můžete mi říkat Dan. Pomůžu vám najít stezky, které stojí za to jít, kávu, která probouzí vaši duši, a okamžiky Utahu, které nemůžete koupit v obchodě se suvenýry. Cestujte moudře, cestujte laskavě a zůstaňte zvědaví.",

  uk: "Я не отримав роботу талісмана в хокейній команді. У Мамонта було густіше хутро і кращі ковзани. Тому зараз я гід на SLCTrips.com. Я провів майже двадцять років біля Ліберті-парку, допомагаючи дітям створювати музику, відео та божевільні ідеї. Ці гори та каньйони виростили мене так само, як і будь-який клас. Люди називають мене Вассач Сніговик, але ви можете називати мене Дену. Я допоможу вам знайти стежки, якими варто йти, каву, яка пробуджує вашу душу, та моменти Юти, які не можна купити в сувенірному магазині. Подорожуйте мудро, подорожуйте доброзичливо і залишайтеся допитливими.",

  ro: "Nu am primit jobul de mascotă la echipa de hochei. Mamutul avea blana mai groasă și patine mai bune. Așa că acum sunt ghid pentru SLCTrips.com. Am petrecut aproape douăzeci de ani în jurul Liberty Park ajutând copiii să creeze muzică, videoclipuri și idei nebune. Aceste munți și canioane m-au crescut la fel de mult ca orice clasă. Oamenii mă numesc Wasatch Sasquatch, dar poți să-mi spui Dan. Te voi ajuta să găsești potecile care merită parcurse, cafeaua care îți trezește sufletul și momentele din Utah pe care nu le poți cumpăra într-un magazin de suveniruri. Călătorește înțelept, călătorește cu bunătate și rămâi curios.",

  el: "Δεν πήρα τη δουλειά ως μασκότ με την ομάδα χόκεϊ. Το Μαμούθ είχε πιο χοντρή γούνα και καλύτερα πατίνια. Έτσι τώρα είμαι ο οδηγός για το SLCTrips.com. Πέρασα σχεδόν είκοσι χρόνια γύρω από το Liberty Park βοηθώντας παιδιά να δημιουργήσουν μουσική, βίντεο και τρελές ιδέες. Αυτά τα βουνά και τα φαράγγια με μεγάλωσαν όσο και οποιαδήποτε τάξη. Οι άνθρωποι με αποκαλούν Wasatch Sasquatch, αλλά μπορείτε να με αποκαλείτε Dan. Θα σας βοηθήσω να βρείτε τα μονοπάτια που αξίζει να περπατήσετε, τον καφέ που ξυπνάει την ψυχή σας και τις στιγμές της Γιούτα που δεν μπορείτε να αγοράσετε σε ένα κατάστημα δώρων. Ταξιδέψτε σοφά, ταξιδέψτε ευγενικά και μείνετε περίεργοι.",

  hu: "Nem kaptam meg a jégkorong csapat kabalájának állását. A Mammutnak vastagabb bundája és jobb korcsolyája volt. Szóval most az SLCTrips.com útmutatója vagyok helyette. Majdnem húsz évet töltöttem a Liberty Park körül, segítve a gyerekeket zenék, videók és vad ötletek megalkotásában. Ezek a hegyek és kanyonok ugyanannyira neveltek, mint bármely osztályterem. Az emberek Wasatch Sasquatchnak hívnak, de te nevezhetsz Dannek. Segítek megtalálni a sétára érdemes ösvényeket, a lelkedet ébresztő kávét és azokat az Utah pillanatokat, amiket nem vehetsz meg egy ajándékboltban. Utazz bölcsen, utazz kedvesen és maradj kíváncsi.",

  bg: "Не получих работата като талисман с хокейния отбор. Мамутът имаше по-гъста козина и по-добри кънки. Така че сега съм водач за SLCTrips.com вместо това. Прекарах почти двадесет години около Liberty Park, помагайки на децата да създават музика, видеоклипове и луди идеи. Тези планини и каньони ме отгледаха толкова, колкото всяка класна стая. Хората ме наричат Уосач Саскуоч, но можете да ме наричате Дан. Ще ви помогна да намерите пътеките, които си заслужава да вървите, кафето, което събужда душата ви, и моментите на Юта, които не можете да купите в магазин за сувенири. Пътувайте мъдро, пътувайте любезно и оставайте любопитни.",

  hr: "Nisam dobio posao maskote u hokejaškos timu. Mamut je imao deblju krznu i bolje klizaljke. Dakle, sada sam vodič za SLCTrips.com umjesto toga. Proveo sam gotovo dvadeset godina oko Liberty Parka pomažući djeci stvarati glazbu, videe i divlje ideje. Ove planine i kanjone odgojili su me koliko i bilo koja učionica. Ljudi me zovu Wasatch Sasquatch, ali možete me zvati Dan. Pomoći ću vam pronaći staze koje vrijedi hodati, kavu koja budi vašu dušu i trenutke Utaha koje ne možete kupiti u suvenirnici. Putujte mudro, putujte ljubazno i ostanite radoznali.",

  sk: "Nedostal som prácu maskota v hokejovom tíme. Mamut mal hustejšiu srsť a lepšie korčule. Takže teraz som sprievodca pre SLCTrips.com. Strávil som takmer dvadsať rokov okolo Liberty Park a pomáhal som deťom vytvárať hudbu, videá a divoké nápady. Tieto hory a kaňony ma vychovali rovnako ako každá trieda. Ľudia ma volajú Wasatch Sasquatch, ale môžete ma volať Dan. Pomôžem vám nájsť chodníky, ktoré stoja za to prejsť, kávu, ktorá prebúdza vašu dušu, a momenty Utahu, ktoré nemôžete kúpiť v obchode so suvenírmi. Cestujte múdro, cestujte láskavo a zostaňte zvedaví.",

  sl: "Nisem dobil službe maskote pri hokejiški ekipi. Mamut je imel debelejšo krzno in boljše drsalke. Torej sem zdaj vodič za SLCTrips.com namesto tega. Preživel sem skoraj dvajset let okoli Liberty Parka in pomagal otrokom ustvarjati glasbo, videoposnetke in nore ideje. Te gore in soteske so me vzgojile toliko kot kateri koli razred. Ljudje me kličejo Wasatch Sasquatch, vendar me lahko kličete Dan. Pomagal vam bom najti poti, po katerih se splača hoditi, kavo, ki prebuja vašo dušo, in trenutke Utaha, ki jih ne morete kupiti v trgovini s spominki. Potujte modro, potujte prijazno in ostanite radovedni.",

  lt: "Negavau darbo kaip ledo ritulio komandos talismanas. Mamutas turėjo storesnį kailį ir geresnes pačiūžas. Taigi dabar esu gidas SLCTrips.com. Praleidau beveik dvidešimt metų aplink Liberty parką, padėdamas vaikams kurti muziką, vaizdo įrašus ir laukinius sumanymus. Šie kalnai ir kanjionai mane užaugino tiek pat, kiek bet kokia klasė. Žmonės mane vadina Wasatch Sasquatch, bet galite mane vadinti Dan. Aš padėsiu jums rasti takus, kuriais verta eiti, kavą, kuri pažadina jūsų sielą, ir Jutos akimirkas, kurių negalite nusipirkti dovanų parduotuvėje. Keliauk išmintingai, keliauk maloniai ir išlik smalsus.",

  lv: "Es nesaņēmu talismana darbu hokeja komandā. Mamutam bija biezāka spalva un labākas slidas. Tāpēc tagad esmu gids SLCTrips.com. Es pavadīju gandrīz divdesmit gadus ap Liberty parku, palīdzot bērniem radīt mūziku, videoklipus un trakus iedomu. Šie kalni un kanjoni mani izaudzināja tikpat daudz kā jebkura klase. Cilvēki mani sauc par Wasatch Sasquatch, bet jūs varat mani saukt par Dan. Es palīdzēšu jums atrast takas, pa kurām ir vērts staigāt, kafiju, kas modina jūsu dvēseli, un Jūtas mirkļus, kurus nevarat nopirkt dāvanu veikalā. Ceļojiet gudri, ceļojiet laipni un palieciet ziņkārīgi.",

  et: "Ma ei saanud jäähokimeeskonna talismani tööd. Mammuudil oli paksem kasukas ja paremad uisud. Nii et nüüd olen SLCTrips.com giid. Veetsin peaaegu kakskümmend aastat Liberty Parki ümbruses, aidates lastel luua muusikat, videoid ja hullumeelseid ideid. Need mäed ja kanjonid kasvatanud mind sama palju kui ükski klassiruum. Inimesed kutsuvad mind Wasatch Sasquatch'iks, aga võite mind kutsuda Dan'iks. Aitan teil leida radu, mida tasub kõndida, kohvi, mis äratab teie hinge, ja Utah'i hetki, mida ei saa kinkepoest osta. Rändake targalt, reisige lahkelt ja jääge uudishimulikuks."
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';

    // Validate language
    if (!DAN_SCRIPTS[language]) {
      return NextResponse.json(
        { error: `Language '${language}' not supported. Available: ${Object.keys(DAN_SCRIPTS).join(', ')}` },
        { status: 400 }
      );
    }

    // Check if audio already in Supabase Storage
    const audioPath = `${language}.mp3`;
    const { data: existingFile } = await supabase.storage
      .from('dan-audio')
      .list('', {
        search: `${language}.mp3`
      });

    if (existingFile && existingFile.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Cache hit for language: ${language}`);
      }
      const { data: { publicUrl } } = supabase.storage
        .from('dan-audio')
        .getPublicUrl(audioPath);

      return NextResponse.json({
        success: true,
        language,
        audio_url: publicUrl,
        cached: true,
        script: DAN_SCRIPTS[language]
      });
    }

    // Not in cache - generate new audio
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎙️  Generating Dan audio for language: ${language}`);
    }

    const script = DAN_SCRIPTS[language];
    const audioBuffer = await generateSpeech(script, language);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('dan-audio')
      .upload(audioPath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('dan-audio')
      .getPublicUrl(audioPath);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Audio generated and cached: ${language}`);
    }

    return NextResponse.json({
      success: true,
      language,
      audio_url: publicUrl,
      cached: false,
      script: script
    });

  } catch (error: unknown) {
    console.error('Dan audio generation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Dan audio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint to batch generate all languages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { languages } = body;

    const languagesToGenerate = languages || Object.keys(DAN_SCRIPTS);

    if (!Array.isArray(languagesToGenerate)) {
      return NextResponse.json(
        { error: 'Please provide an array of language codes' },
        { status: 400 }
      );
    }

    const results = [];

    for (const lang of languagesToGenerate) {
      if (!DAN_SCRIPTS[lang]) {
        results.push({ language: lang, success: false, error: 'Unsupported language' });
        continue;
      }

      try {
        const response = await fetch(`${request.nextUrl.origin}/api/dan/speak?lang=${lang}`);
        const data = await response.json();
        results.push({ language: lang, success: true, ...data });
      } catch (error: any) {
        results.push({ language: lang, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Batch generation failed', details: error.message },
      { status: 500 }
    );
  }
}
