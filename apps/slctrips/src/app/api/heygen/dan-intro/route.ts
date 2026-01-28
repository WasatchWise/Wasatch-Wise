/**
 * Dan's Introduction Video API
 *
 * Generates multilingual HeyGen videos of Dan introducing himself
 * Uses caching to avoid regenerating videos
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/lib/logger';
import { generateTalkingVideo, pollVideoCompletion, DAN_AVATAR_ID } from '@/lib/heygen';
import { generateSpeech } from '@/lib/elevenlabs';

// Dan's introduction in different languages
const DAN_SCRIPTS: Record<string, string> = {
  en: "I didn't get the mascot job with the hockey team. The Mammoth had thicker fur and better skates. So now I'm the guide for SLCTrips.com instead. I spent almost twenty years around Liberty Park helping kids make music, videos, and wild ideas come to life. These mountains and canyons raised me as much as any classroom. People call me the Wasatch Sasquatch, but you can call me Dan. I'll help you find the trails worth walking, the coffee that wakes your soul, and the Utah moments you can't buy in a gift shop. Wander wisely, travel kindly, and stay curious.",

  es: "No conseguí el trabajo de mascota con el equipo de hockey. El Mamut tenía pelaje más grueso y mejores patines. Así que ahora soy el guía de SLCTrips.com. Pasé casi veinte años en Liberty Park ayudando a niños a crear música, videos e ideas increíbles. Estas montañas y cañones me criaron tanto como cualquier aula. La gente me llama el Wasatch Sasquatch, pero puedes llamarme Dan. Te ayudaré a encontrar los senderos que vale la pena caminar, el café que despierta tu alma y los momentos de Utah que no puedes comprar en una tienda de regalos. Viaja sabiamente, viaja amablemente y mantén la curiosidad.",

  fr: "Je n'ai pas obtenu le poste de mascotte pour l'équipe de hockey. Le Mammouth avait une fourrure plus épaisse et de meilleurs patins. Alors maintenant, je suis le guide de SLCTrips.com. J'ai passé près de vingt ans autour de Liberty Park à aider les enfants à créer de la musique, des vidéos et des idées folles. Ces montagnes et ces canyons m'ont élevé autant que n'importe quelle classe. Les gens m'appellent le Wasatch Sasquatch, mais vous pouvez m'appeler Dan. Je vous aiderai à trouver les sentiers qui valent la peine d'être parcourus, le café qui réveille votre âme et les moments de l'Utah que vous ne pouvez pas acheter dans une boutique de cadeaux. Voyagez sagement, voyagez gentiment et restez curieux.",

  de: "Ich habe den Maskottchen-Job beim Hockey-Team nicht bekommen. Das Mammut hatte dickeres Fell und bessere Schlittschuhe. Also bin ich jetzt der Führer für SLCTrips.com. Ich habe fast zwanzig Jahre in der Nähe von Liberty Park verbracht und Kindern geholfen, Musik, Videos und wilde Ideen zum Leben zu erwecken. Diese Berge und Canyons haben mich genauso erzogen wie jedes Klassenzimmer. Die Leute nennen mich den Wasatch Sasquatch, aber du kannst mich Dan nennen. Ich helfe dir, die Wege zu finden, die es wert sind, gegangen zu werden, den Kaffee, der deine Seele weckt, und die Utah-Momente, die du in keinem Geschenkeladen kaufen kannst. Reise weise, reise freundlich und bleib neugierig.",

  zh: "我没有得到曲棍球队吉祥物的工作。猛犸象有更厚的毛皮和更好的冰鞋。所以现在我是SLCTrips.com的向导。我在自由公园附近度过了将近二十年，帮助孩子们创作音乐、视频和疯狂的想法。这些山脉和峡谷就像任何教室一样养育了我。人们叫我瓦萨奇大脚怪，但你可以叫我丹。我会帮你找到值得走的小径，唤醒你灵魂的咖啡，以及那些在礼品店买不到的犹他时刻。明智地旅行，友善地旅行，保持好奇心。",

  ja: "私はホッケーチームのマスコットの仕事を得られませんでした。マンモスはより厚い毛皮とより良いスケート靴を持っていました。だから今、私はSLCTrips.comのガイドをしています。リバティパークの周辺で約20年間を過ごし、子供たちが音楽、ビデオ、そして素晴らしいアイデアを実現するのを手伝ってきました。これらの山々と峡谷は、どんな教室と同じくらい私を育ててくれました。人々は私をワサッチサスカッチと呼びますが、ダンと呼んでください。歩く価値のあるトレイル、魂を目覚めさせるコーヒー、そしてギフトショップでは買えないユタの瞬間を見つけるお手伝いをします。賢く旅し、親切に旅し、好奇心を持ち続けてください。"
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('lang') || 'en';

    // Validate language code
    if (!DAN_SCRIPTS[language]) {
      return NextResponse.json(
        { error: `Language '${language}' not supported. Available: ${Object.keys(DAN_SCRIPTS).join(', ')}` },
        { status: 400 }
      );
    }

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('dan_videos')
      .select('*')
      .eq('language_code', language)
      .single();

    if (cached && !cacheError) {
      logger.info('Cache hit for Dan video', { language });
      return NextResponse.json({
        success: true,
        language,
        video_url: cached.video_url,
        cached: true,
        script: cached.script
      });
    }

    // Not in cache - generate new video
    logger.info('Generating Dan video', { language });

    // First, generate audio with ElevenLabs
    const script = DAN_SCRIPTS[language];
    const audioBuffer = await generateSpeech(script);

    // TODO: If HeyGen rejects data URLs, upload audio to Supabase Storage first
    // and use the public URL instead. For now, trying data URL approach.
    const base64Audio = audioBuffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // Generate HeyGen video with Dan's avatar
    const videoId = await generateTalkingVideo({
      avatarId: DAN_AVATAR_ID,
      audioUrl: audioDataUrl,
      title: `Dan Introduction - ${language}`,
      backgroundColor: '#0d2a40' // Navy Ridge from brand
    });

    logger.info('Polling for video completion', { videoId });

    // Poll for completion (this can take 30-60 seconds)
    const result = await pollVideoCompletion(videoId, 60, 10000);

    if (!result.videoUrl) {
      throw new Error('Video generation completed but no URL returned');
    }

    // Cache the result
    const { error: insertError } = await supabase
      .from('dan_videos')
      .insert({
        language_code: language,
        video_url: result.videoUrl,
        script: script
      });

    if (insertError) {
      console.error('Failed to cache video:', insertError);
      // Don't fail the request, just log it
    }

    logger.info('Video generated and cached', { language });

    return NextResponse.json({
      success: true,
      language,
      video_url: result.videoUrl,
      cached: false,
      script: script,
      duration: result.duration
    });

  } catch (error: any) {
    console.error('Dan video generation failed:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Dan video',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST endpoint to manually trigger video generation for specific languages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { languages } = body;

    if (!languages || !Array.isArray(languages)) {
      return NextResponse.json(
        { error: 'Please provide an array of language codes' },
        { status: 400 }
      );
    }

    const results = [];

    for (const lang of languages) {
      if (!DAN_SCRIPTS[lang]) {
        results.push({ language: lang, success: false, error: 'Unsupported language' });
        continue;
      }

      try {
        // Use the GET logic via internal request
        const response = await fetch(`${request.nextUrl.origin}/api/heygen/dan-intro?lang=${lang}`);
        const data = await response.json();
        results.push({ language: lang, success: true, ...data });
      } catch (error: any) {
        results.push({ language: lang, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Batch generation failed', details: error.message },
      { status: 500 }
    );
  }
}
