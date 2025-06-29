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

    // Simulate AI video analysis (replace with actual AI service)
    const analysisResult = await analyzeVideoWithAI(videoUrl, skillName, proficiencyLevel)

    // Update skill with AI feedback
    const { error: updateError } = await supabaseClient
      .from('skills')
      .update({
        ai_rating: analysisResult.rating,
        ai_feedback: analysisResult.feedback,
        video_verified: analysisResult.verified,
        video_uploaded_at: new Date().toISOString()
      })
      .eq('id', skillId)

    if (updateError) throw updateError

    // Create video verification record
    const { error: verificationError } = await supabaseClient
      .from('skill_video_verifications')
      .insert({
        skill_id: skillId,
        video_url: videoUrl,
        ai_prompt: `Analyze ${skillName} skill demonstration at ${proficiencyLevel} level`,
        ai_rating: analysisResult.rating,
        ai_feedback: analysisResult.feedback,
        verification_status: analysisResult.verified ? 'verified' : 'pending'
      })

    if (verificationError) throw verificationError

    return new Response(
      JSON.stringify({
        success: true,
        rating: analysisResult.rating,
        feedback: analysisResult.feedback,
        verified: analysisResult.verified
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

async function analyzeVideoWithAI(videoUrl: string, skillName: string, proficiencyLevel: string) {
  // This is a mock implementation - replace with actual AI service
  // You could integrate with OpenAI, AWS Bedrock, or other AI services here
  
  const mockAnalysis = {
    rating: Math.floor(Math.random() * 2) + 3, // 3-5 rating
    feedback: generateMockFeedback(skillName, proficiencyLevel),
    verified: Math.random() > 0.3 // 70% verification rate
  }

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))

  return mockAnalysis
}

function generateMockFeedback(skillName: string, proficiencyLevel: string): string {
  const feedbackTemplates = [
    `Great demonstration of ${skillName} skills! Your ${proficiencyLevel} level expertise is clearly visible in the video.`,
    `Solid ${skillName} demonstration. Consider adding more advanced techniques to showcase your ${proficiencyLevel} proficiency.`,
    `Excellent ${skillName} showcase! Your understanding of core concepts aligns well with ${proficiencyLevel} level expectations.`,
    `Good ${skillName} demonstration. To strengthen your profile, consider showing more complex problem-solving scenarios.`
  ]
  
  return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)]
}