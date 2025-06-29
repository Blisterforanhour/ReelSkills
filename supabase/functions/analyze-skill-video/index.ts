import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyzeVideoRequest {
  skillId: string;
  videoUrl: string;
  skillName: string;
  proficiencyLevel: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { skillId, videoUrl, skillName, proficiencyLevel }: AnalyzeVideoRequest = await req.json()

    // TODO: Replace with actual AI service integration
    // For now, return a basic response indicating the video was received
    const analysisResult = {
      rating: null, // No mock rating
      feedback: null, // No mock feedback
      verified: false // Not verified until real AI analysis
    }

    // Update skill with video URL only (no fake AI data)
    const { error: updateError } = await supabaseClient
      .from('skills')
      .update({
        video_demo_url: videoUrl,
        video_uploaded_at: new Date().toISOString()
      })
      .eq('id', skillId)

    if (updateError) throw updateError

    // Create video verification record without fake AI data
    const { error: verificationError } = await supabaseClient
      .from('skill_video_verifications')
      .insert({
        skill_id: skillId,
        video_url: videoUrl,
        ai_prompt: `Analyze ${skillName} skill demonstration at ${proficiencyLevel} level`,
        verification_status: 'pending'
      })

    if (verificationError) throw verificationError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Video uploaded successfully. AI analysis will be available when integrated.',
        rating: null,
        feedback: null,
        verified: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})