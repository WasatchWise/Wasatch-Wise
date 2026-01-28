
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function importMultiFamilyData() {
    const filePath = path.join(process.cwd(), 'multifamily_data.txt');
    const rawText = fs.readFileSync(filePath, 'utf-8');

    // Split by the footer separator that appears between projects
    // "Login to: [Request Research] [Share] [Follow this Project]"
    const chunks = rawText.split('Login to: [Request Research] [Share] [Follow this Project]');

    // The first chunk contains the email header and the summary table, 
    // AND the first project ("Alta Merita").
    // We need to find where the first project details start in the first chunk.
    // Logic: Look for the first occurrence of "Construction Type:" and go back one line to get the title.

    // Actually, let's normalize the cleaning.
    // We can split by headers maybe?
    // Or just process each chunk.

    console.log(`Found ${chunks.length} chunks.`);

    // Parse summary table first to capture all projects
    const summaryHeaderIndex = rawText.indexOf('Project Title\tCity\tState');
    const firstDetailIndex = rawText.indexOf('Construction Type:');

    if (summaryHeaderIndex !== -1 && firstDetailIndex !== -1) {
        // Find the start of the summary data (after the header row)
        // The header ends at "Product Type"
        const productTypeIndex = rawText.indexOf('Product Type', summaryHeaderIndex);
        const summaryStart = productTypeIndex + 'Product Type'.length;

        // The summary section ends before the first detailed project.
        // The first detailed project is likely the first one in the list "Alta Merita".
        // Use the line before "Construction Type:" as the boundary, roughly.
        // Actually, we can just extract the text between Product Type and the first Construction Type, 
        // then verify if we cut off the title of the first detailed project.
        // The first detailed project title is "Alta Merita". 
        // The summary table ends with "Velocity Mixed-Use...".
        // The text has "Velocity Mixed-Use... > 350... Market Rate \n Alta Merita \n Construction Type:"

        // Regex to find "Title \n Construction Type:"
        const detailStartMatch = rawText.match(/(.*?)\nConstruction Type:/);
        if (detailStartMatch) {
            const summaryEnd = detailStartMatch.index!;
            const summarySection = rawText.substring(summaryStart, summaryEnd).trim();
            await processSummarySection(summarySection);
        }
    }

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i].trim();
        if (!chunk) continue;

        await processProjectChunk(chunk);
    }
}

async function processSummarySection(summaryText: string) {
    console.log("Processing Summary Table...");
    const lines = summaryText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Pattern: 
    // Title
    // Status \t City \t State \t Date
    // Units \t Type \t Product

    let i = 0;
    while (i < lines.length) {
        // We expect a group of 3 lines, but sometimes lines might be merged.
        // Check for Status keyword in line i+1?
        // Status is NEW or UPDATED.

        // Let's iterate and try to match the pattern.
        // Line i: Title?
        // Line i+1: Starts with NEW or UPDATED?

        if (i + 1 >= lines.length) break;

        const line2 = lines[i + 1];
        if (line2.startsWith('NEW') || line2.startsWith('UPDATED')) {
            // Found a block
            const title = lines[i];
            const statusLine = lines[i + 1]; // UPDATED \t City \t State \t Date
            const typeLine = lines[i + 2];   // Units \t Type \t Product

            // Parse Status Line
            const statusParts = statusLine.split('\t');
            // [Status, City, State, Date]
            // Sometimes formatting might be loose.
            const status = statusParts[0];
            const city = statusParts[1];
            const state = statusParts[2];
            const date = statusParts[3];

            // Parse Type Line
            let units = null;
            let projectType = null;
            if (typeLine) {
                const typeParts = typeLine.split('\t');
                units = typeParts[0];
                projectType = typeParts[1];
                // Product type = typeParts[2]
            }

            let unitsCount = null;
            if (units) {
                if (units.includes('-')) {
                    unitsCount = parseInt(units.split('-')[0].replace(/\D/g, ''));
                } else {
                    unitsCount = parseInt(units.replace(/\D/g, ''));
                }
            }

            console.log(`  Summary found: ${title} (${city}, ${state})`);

            const projectData = {
                project_name: title,
                city: city,
                state: state,
                units_count: unitsCount,
                project_type: projectType,
                estimated_start_date: parseDate(date),
                data_source: 'MultiFamilyData Email (Summary)',
                last_updated: new Date().toISOString()
            };

            // Upsert
            const { data: existing } = await supabase
                .from('projects')
                .select('id')
                .eq('project_name', title)
                .eq('city', city)
                .single();

            if (existing) {
                // If it exists, we update minimal info from summary? 
                // Or skip? Use summary data if detailed data is missing later.
                // We can update. detailed parsing will overwrite later if available.
                // console.log(`   (Updating from summary)`);
                await supabase.from('projects').update(projectData).eq('id', existing.id);
            } else {
                console.log(`   Creating from summary`);
                await supabase.from('projects').insert(projectData);
            }

            // Move pointer
            // If typeLine existed, we consumed 3 lines.
            // If line2 was the last line, we messed up.
            i += (typeLine ? 3 : 2);
        } else {
            // Expected status line not found, maybe alignment issue or title spread on multiple lines?
            // Skip line
            i++;
        }
    }
}

async function processProjectChunk(chunk: string) {
    // Basic extraction regexes
    // Assuming the Project Name is the line just before "Construction Type:" matched at the start of a line?
    // Or it might be embedded in the text.

    // Let's look for "Construction Type:"
    const constructionTypeIndex = chunk.indexOf('Construction Type:');
    if (constructionTypeIndex === -1) {
        console.log('Skipping chunk (no Construction Type found)');
        return;
    }

    // Attempt to extract title by looking at the line before "Construction Type:"
    const preText = chunk.substring(0, constructionTypeIndex).trim();
    // Split by newline, filter out empty lines to find the true title line
    const lines = preText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const projectTitle = lines[lines.length - 1]; // The last non-empty line before Construction Type should be the title

    // If the chunk is the first one, it has all the email header stuff. 
    // But taking the last line before "Construction Type" should still be correct for "Alta Merita".

    // Extract other fields
    const getField = (label: string) => {
        const regex = new RegExp(`${label}\\t(.*?)(?:\\t|\\n|$)`);
        const match = chunk.match(regex);
        return match ? match[1].trim() : null;
    };

    const getLineField = (label: string) => {
        const regex = new RegExp(`${label}\\t(.*?)(?:\\n|$)`);
        const match = chunk.match(regex);
        return match ? match[1].trim() : null;
    }

    const constructionType = getField('Construction Type:');
    const units = getField('# of Units:');
    const projectType = getField('Project Type:');
    const stage = getField('Stage:');
    const estimatedStart = getField('Construction Start:');
    const estimatedEnd = getField('Construction End:');

    // Location is tricky: "Location:\tEtiwanda, CA 91739. 12939 Foothill Blvd"
    const locationLine = getLineField('Location:');
    let city = null;
    let state = null;
    let zip = null;
    let address = null;

    if (locationLine) {
        // pattern: "City, ST Zip. Address"
        // Etiwanda, CA 91739. 12939 Foothill Blvd
        const parts = locationLine.split('.');
        const cityStateZip = parts[0].trim();
        address = parts.slice(1).join('.').trim();

        const cszParts = cityStateZip.split(',');
        if (cszParts.length >= 2) {
            city = cszParts[0].trim();
            const stateZip = cszParts[1].trim().split(' ');
            state = stateZip[0];
            if (stateZip.length > 1) {
                zip = stateZip[1];
            }
        }
    }

    const details = getLineField('Details:');

    // News and Notes
    // Everything after "News and Notes"
    let notes = '';
    const newsIndex = chunk.indexOf('News and Notes');
    if (newsIndex !== -1) {
        notes = chunk.substring(newsIndex).trim();
    }

    // Parsing Units to number
    let unitsCount = null;
    if (units) {
        // Handle "251-350", "> 350", "257"
        if (units.includes('-')) {
            // take average or min? Let's take min for now or keep text if column is text. 
            // projects.units_count might be int or text. 
            // schema check said: units_count: integer? let's assume integer. check schema output again.
            // Schema output didn't show types in sample keys, but assume int if possible.
            // Actually check-projects-schema output didn't show types for sample, but typically it is int.
            // If it's a range, I'll take the lower bound or just parseInt which stops at non-digit?
            const parts = units.split('-');
            unitsCount = parseInt(parts[0].replace(/\D/g, ''));
        } else if (units.includes('>')) {
            unitsCount = parseInt(units.replace(/\D/g, ''));
        } else {
            unitsCount = parseInt(units.replace(/\D/g, ''));
        }
    }

    console.log(`Processing: ${projectTitle}`);
    console.log(`  Location: ${city}, ${state} ${zip}`);
    console.log(`  Units: ${unitsCount}`);

    // Upsert to projects
    const projectData = {
        project_name: projectTitle,
        city: city,
        state: state,
        zip: zip,
        address: address,
        units_count: unitsCount,
        project_type: projectType,
        project_stage: stage,
        estimated_start_date: parseDate(estimatedStart),
        estimated_completion_date: parseDate(estimatedEnd),
        notes: notes ? details + '\n\n' + notes : details,
        data_source: 'MultiFamilyData Email',
        last_updated: new Date().toISOString(),
        raw_data: chunk // Store full text for reference
    };

    // Upsert based on project_name and city (composite key conceptually) needed?
    // Or just look up if exists.
    // The "UPDATED" flag in the email suggests these might already exist.
    // "Alta Merita UPDATED"
    // I should probably clean "UPDATED" or "NEW" from the title if it leaked in.
    // But my title extraction takes the last line before Construction Type.
    // In "Alta Merita", the line before "Construction Type" is "Alta Merita".
    // In the summary table: "Alta Merita\nUPDATED".
    // But in the detail section: "Alta Merita\nConstruction Type:"
    // So logic seems sound.

    // Let's insert/update
    // We'll use project_name as a key for now, maybe combined with city if needed.
    // But let's try to find existing first.

    const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('project_name', projectTitle)
        .eq('city', city)
        .single();

    if (existing) {
        console.log(`  Updating existing project ${existing.id}`);
        await supabase.from('projects').update(projectData).eq('id', existing.id);
    } else {
        console.log(`  Creating new project`);
        await supabase.from('projects').insert(projectData);
    }
}

function parseDate(dateStr: string | null) {
    if (!dateStr) return null;
    // 4/2023 -> 2023-04-01
    // Q1/2055 -> 2055-01-01
    // Q2/2027 -> 2027-04-01

    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        let month = 1;
        const year = parseInt(parts[1]);
        const firstPart = parts[0];

        if (firstPart.startsWith('Q')) {
            const q = parseInt(firstPart[1]);
            month = (q - 1) * 3 + 1;
        } else {
            month = parseInt(firstPart);
        }

        return new Date(year, month - 1, 1).toISOString();
    }
    return null;
}

importMultiFamilyData().catch(console.error);
