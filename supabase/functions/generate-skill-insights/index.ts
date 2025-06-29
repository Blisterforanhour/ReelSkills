import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateInsightsRequest {
  profileId: string;
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

    const { profileId }: GenerateInsightsRequest = await req.json()

    // Fetch user's skills
    const { data: skills, error: skillsError } = await supabaseClient
      .from('skills')
      .select('*')
      .eq('profile_id', profileId)

    if (skillsError) throw skillsError

    // Fetch user's profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError) throw profileError

    // Generate AI insights based on skills and profile
    const insights = await generatePersonalizedInsights(skills, profile)

    return new Response(
      JSON.stringify({ insights }),
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

async function generatePersonalizedInsights(skills: any[], profile: any) {
  const insights = []

  // Skill advancement opportunities
  const advancableSkills = skills.filter(skill => 
    skill.proficiency !== 'master' && skill.years_experience > 0
  )

  if (advancableSkills.length > 0) {
    insights.push({
      type: 'learning-path',
      title: 'Skill Advancement Opportunity',
      description: `Your ${advancableSkills[0].name} skills show ${advancableSkills[0].years_experience} years of experience. Consider advancing to the next proficiency level.`,
      actionable: true,
      priority: 'high',
      data: { skill: advancableSkills[0] }
    })
  }

  // Market trends (this would typically come from a real market data API)
  const trendingSkills = ['Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Cybersecurity']
  const userHasTrendingSkills = skills.some(skill => 
    trendingSkills.some(trending => 
      skill.name.toLowerCase().includes(trending.toLowerCase())
    )
  )

  if (!userHasTrendingSkills) {
    insights.push({
      type: 'market-trend',
      title: 'High-Demand Skills Alert',
      description: 'AI and Cloud Computing skills are seeing 40% growth in job postings. Consider adding these to your portfolio.',
      actionable: true,
      priority: 'critical',
      data: { 
        trendingSkills: ['Artificial Intelligence', 'Machine Learning', 'AWS', 'Python'],
        growthRate: 40
      }
    })
  }

  // Skill gap analysis
  const technicalSkills = skills.filter(skill => skill.category === 'technical')
  const hasCloudSkills = technicalSkills.some(skill => 
    ['aws', 'azure', 'cloud', 'docker', 'kubernetes'].some(cloud => 
      skill.name.toLowerCase().includes(cloud)
    )
  )

  if (technicalSkills.length > 0 && !hasCloudSkills) {
    insights.push({
      type: 'skill-gap',
      title: 'Cloud Skills Gap Identified',
      description: 'Your technical skills would benefit from cloud computing expertise. 85% of companies are adopting cloud technologies.',
      actionable: true,
      priority: 'medium',
      data: { 
        recommendedSkills: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
        reason: 'Cloud skills complement your existing technical expertise'
      }
    })
  }

  // Portfolio completion
  const skillsWithVideos = skills.filter(skill => skill.video_demo_url)
  const completionRate = skills.length > 0 ? (skillsWithVideos.length / skills.length) * 100 : 0

  if (completionRate < 50 && skills.length > 2) {
    insights.push({
      type: 'recommendation',
      title: 'Strengthen Your Portfolio',
      description: `Only ${Math.round(completionRate)}% of your skills have video demonstrations. Adding videos can increase profile views by 300%.`,
      actionable: true,
      priority: 'medium',
      data: { completionRate, skillsNeedingVideos: skills.filter(s => !s.video_demo_url) }
    })
  }

  return insights
}