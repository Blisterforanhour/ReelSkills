import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecommendSkillsRequest {
  profileId: string;
  currentSkills: string[];
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

    const { profileId, currentSkills }: RecommendSkillsRequest = await req.json()

    // Get skill recommendations based on current skills
    const recommendations = await generateSkillRecommendations(currentSkills)

    return new Response(
      JSON.stringify({ recommendations }),
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

async function generateSkillRecommendations(currentSkills: string[]) {
  // This would typically use ML models or market data APIs
  // For now, we'll use rule-based recommendations
  
  const skillMap: Record<string, string[]> = {
    'JavaScript': ['TypeScript', 'React', 'Node.js', 'Vue.js'],
    'Python': ['Django', 'Flask', 'Data Science', 'Machine Learning'],
    'React': ['Next.js', 'Redux', 'TypeScript', 'GraphQL'],
    'AWS': ['Docker', 'Kubernetes', 'Terraform', 'DevOps'],
    'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
    'Data Science': ['SQL', 'Python', 'R', 'Tableau'],
  }

  const recommendations = new Set<string>()
  
  // Add complementary skills
  currentSkills.forEach(skill => {
    const related = skillMap[skill] || []
    related.forEach(relatedSkill => {
      if (!currentSkills.includes(relatedSkill)) {
        recommendations.add(relatedSkill)
      }
    })
  })

  // Add trending skills if none present
  const trendingSkills = ['Artificial Intelligence', 'Machine Learning', 'Cloud Computing', 'Cybersecurity']
  const hasTrending = currentSkills.some(skill => 
    trendingSkills.some(trending => skill.toLowerCase().includes(trending.toLowerCase()))
  )

  if (!hasTrending) {
    trendingSkills.forEach(skill => recommendations.add(skill))
  }

  return Array.from(recommendations).slice(0, 8) // Limit to 8 recommendations
}