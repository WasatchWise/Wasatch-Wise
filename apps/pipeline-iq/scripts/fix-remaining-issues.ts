#!/usr/bin/env tsx
/**
 * Fix remaining data issues
 */

import dotenv from 'dotenv'
import { createServiceSupabaseClient } from '../lib/supabase/service'

dotenv.config({ path: '.env.local' })

async function fixRemainingIssues() {
  const supabase = createServiceSupabaseClient()
  
  console.log('🔧 Fixing remaining issues...\n')
  
  // Fix the duplicate Hyatt companies
  const { data: hyattCompanies } = await supabase
    .from('companies')
    .select('*')
    .ilike('company_name', '%hyatt%')
    .order('created_at', { ascending: true })
  
  if (hyattCompanies && hyattCompanies.length > 1) {
    console.log(`Found ${hyattCompanies.length} Hyatt companies`)
    
    // Find exact duplicates
    const nameMap = new Map<string, any[]>()
    hyattCompanies.forEach((c) => {
      const normalized = c.company_name.toLowerCase().trim()
      if (!nameMap.has(normalized)) {
        nameMap.set(normalized, [])
      }
      nameMap.get(normalized)!.push(c)
    })
    
    for (const [name, instances] of nameMap.entries()) {
      if (instances.length > 1) {
        console.log(`\nFound ${instances.length} instances of "${name}"`)
        
        // Keep the oldest one
        const canonical = instances[0]
        const duplicates = instances.slice(1)
        
        console.log(`  Keeping: ${canonical.id} (created: ${canonical.created_at})`)
        
        for (const duplicate of duplicates) {
          // Update project_stakeholders
          await supabase
            .from('project_stakeholders')
            .update({ company_id: canonical.id })
            .eq('company_id', duplicate.id)
          
          // Delete duplicate
          const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', duplicate.id)
          
          if (error) {
            console.error(`  ❌ Error deleting ${duplicate.id}: ${error.message}`)
          } else {
            console.log(`  ✅ Deleted duplicate: ${duplicate.id}`)
          }
        }
      }
    }
  }
  
  // Fix the project with missing location
  const { data: projectMissingLocation } = await supabase
    .from('projects')
    .select('*')
    .eq('project_name', '5300 Farrington Road Multifamily')
    .single()
  
  if (projectMissingLocation) {
    console.log('\nFixing project: 5300 Farrington Road Multifamily')
    
    // Try to get location from the similar project
    const { data: similarProject } = await supabase
      .from('projects')
      .select('city, state')
      .eq('project_name', '5300 Farrington Road Townhouses')
      .single()
    
    if (similarProject && similarProject.city && similarProject.state) {
      const { error } = await supabase
        .from('projects')
        .update({ 
          city: similarProject.city, 
          state: similarProject.state 
        })
        .eq('id', projectMissingLocation.id)
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`)
      } else {
        console.log(`  ✅ Fixed location: ${similarProject.city}, ${similarProject.state}`)
      }
    } else {
      // Try to infer from address
      if (projectMissingLocation.address) {
        const address = projectMissingLocation.address.toLowerCase()
        if (address.includes('chapel hill') || address.includes('nc')) {
          const { error } = await supabase
            .from('projects')
            .update({ city: 'Chapel Hill', state: 'NC' })
            .eq('id', projectMissingLocation.id)
          
          if (!error) {
            console.log(`  ✅ Fixed location: Chapel Hill, NC`)
          }
        }
      }
    }
  }
  
  console.log('\n✅ Done!')
}

fixRemainingIssues().catch(console.error)

