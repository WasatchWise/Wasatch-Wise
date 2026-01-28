#!/usr/bin/env node

/**
 * ENHANCED Construction Wire Scraper - JS FIX EDITION
 */

const { config } = require('dotenv');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const CW_USERNAME = process.env.CONSTRUCTION_WIRE_USERNAME;
const CW_PASSWORD = process.env.CONSTRUCTION_WIRE_PASSWORD;
const HEADLESS = process.argv.includes('--headless');
// const FETCH_DETAILS = process.argv.includes('--details'); // Disabled for basic test
const MAX_PROJECTS = parseInt(process.argv.find(arg => arg.startsWith('--max='))?.split('=')[1] || '5');

// --- INLINED SCORING LOGIC ---

function calculateGrooveScore(project) {
    let score = 0;

    // 1. Project Type Score (30 points)
    const highValueTypes = ['hotel', 'senior_living', 'multifamily', 'student_housing'];
    const mediumValueTypes = ['rv_park', 'restaurant', 'arena', 'healthcare', 'campground'];
    const lowValueTypes = ['retail', 'office', 'warehouse'];

    const types = project.project_type || [];
    const typeScore = types.reduce((acc, type) => {
        if (highValueTypes.includes(type)) return Math.max(acc, 30);
        if (mediumValueTypes.includes(type)) return Math.max(acc, 20);
        if (lowValueTypes.includes(type)) return Math.max(acc, 10);
        return acc;
    }, 0);
    score += typeScore;

    // 2. Project Stage Score (25 points)
    const stageScores = {
        'planning': 25,
        'pre-construction': 22,
        'design': 18,
        'bidding': 15,
        'construction': 8,
        'completed': 0
    };
    score += stageScores[project.project_stage] || 5;

    // 3. Project Value Score (20 points)
    if (project.project_value >= 20000000) score += 20;
    else if (project.project_value >= 10000000) score += 17;
    else if (project.project_value >= 5000000) score += 14;
    else if (project.project_value >= 2000000) score += 10;
    else if (project.project_value >= 1000000) score += 7;
    else if (project.project_value >= 500000) score += 4;

    // 4. Project Size Score (10 points)
    const size = project.project_size_sqft || 0;
    const units = project.units_count || 0;

    if (size >= 100000 || units >= 200) score += 10;
    else if (size >= 50000 || units >= 100) score += 8;
    else if (size >= 25000 || units >= 50) score += 6;
    else if (size >= 10000 || units >= 20) score += 4;
    else if (size >= 5000 || units >= 10) score += 2;

    // 5. Timeline Score (10 points)
    const timeline = project.decision_timeline || project.estimated_start_date;
    if (timeline) {
        const monthsOut = calculateMonthsToStart(timeline);
        if (monthsOut <= 3) score += 10;
        else if (monthsOut <= 6) score += 8;
        else if (monthsOut <= 9) score += 5;
        else if (monthsOut <= 12) score += 3;
    }

    // 6. Location Score (5 points)
    const priorityStates = ['UT', 'CA', 'TX', 'FL', 'NY', 'IL'];
    const priorityCities = ['Salt Lake City', 'Las Vegas', 'Phoenix', 'Denver', 'Seattle'];

    if (priorityStates.includes(project.state || '')) score += 3;
    if (priorityCities.includes(project.city || '')) score += 2;

    // Bonus multipliers
    let multiplier = 1.0;
    const grooveServices = ['wifi', 'directv', 'phone', 'cabling', 'access_control', 'structured_cabling'];
    const servicesMatch = (project.services_needed || [])
        .filter(s => grooveServices.some(gs => s.toLowerCase().includes(gs)))
        .length;
    if (servicesMatch >= 3) multiplier *= 1.1;

    if (project.project_value >= 10000000 && (project.units_count || 0) >= 100) {
        multiplier *= 1.05;
    }

    return Math.min(Math.round(score * multiplier), 100);
}

function calculateMonthsToStart(dateStr) {
    if (!dateStr) return 999;
    const date = new Date(dateStr);
    const now = new Date();
    const months = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
    return Math.max(0, months);
}

// --- SCRAPER LOGIC ---

class EnhancedConstructionWireScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.projectsScraped = 0;
        this.projectsSaved = 0;
        this.errors = 0;
    }

    async init() {
        console.log('🚀 ENHANCED Construction Wire Scraper - JS FIX EDITION');
        console.log(`Mode: ${HEADLESS ? 'Headless' : 'Visible Browser'}`);

        this.browser = await puppeteer.launch({
            headless: HEADLESS,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
            timeout: 60000,
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('✅ Browser initialized');
    }

    async login() {
        console.log('\n🔐 Logging in...');
        await this.page.goto('https://www.constructionwire.com', { waitUntil: 'networkidle2', timeout: 60000 });
        await this.wait(2000);

        // Login logic
        await this.page.type('input[placeholder="Email"]', CW_USERNAME, { delay: 50 });
        await this.page.type('input[placeholder="Password"]', CW_PASSWORD, { delay: 50 });

        // Try click login
        const loginSelectors = ['button[type="submit"]', 'input[type="submit"]', '.btn-primary'];
        for (const sel of loginSelectors) {
            if (await this.page.$(sel)) {
                await this.page.click(sel);
                break;
            }
        }

        await this.wait(5000);
        console.log('✅ Logged in (hopefully)');
    }

    async navigateToHotels() {
        console.log('\n🏨 Navigating to Hotels...');
        // Just force navigation to hotels if button click is flaky
        // or try finding the button like before
        // For now, let's try assuming we are there or clicking Search Projects

        await this.wait(2000);
        const success = await this.page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a'));
            const searchBtn = buttons.find(el => el.textContent.includes('Search Projects') || el.textContent.includes('Search'));
            if (searchBtn) {
                searchBtn.click();
                return true;
            }
            return false;
        });

        if (success) {
            console.log('   Clicked search button');
            await this.wait(5000);
        } else {
            console.log('   Could not find search button, assuming we might be on list or need manual nav');
        }
    }

    async scrapeProjects(maxProjects = 5) {
        console.log(`\n📊 Scraping projects...`);
        await this.page.waitForSelector('a.title', { timeout: 15000 }).catch(e => console.log('Wait for a.title timeout but continuing...'));
        await this.wait(2000);

        const projectData = await this.page.evaluate(() => {
            const titleAnchors = Array.from(document.querySelectorAll('a.title'));

            return titleAnchors.map((anchor, index) => {
                const projectName = anchor.textContent?.trim() || '';
                const href = anchor.getAttribute('href') || '';

                const textNodes = [];
                let nextNode = anchor.nextSibling;
                let siblingsChecked = 0;

                while (nextNode && siblingsChecked < 15) {
                    if (nextNode.nodeType === 1 && nextNode.tagName === 'INPUT' && nextNode.id.startsWith('ReportId')) {
                        break;
                    }
                    if (nextNode.nodeType === 3) {
                        const text = nextNode.textContent?.trim();
                        if (text && text.length > 0 && text !== ',') {
                            textNodes.push(text);
                        }
                    }
                    nextNode = nextNode.nextSibling;
                    siblingsChecked++;
                }

                // Mapping based on observation
                const address = textNodes[0] || '';
                const location = textNodes[1] || '';
                const rooms = textNodes[2] || '0';
                const type = textNodes[4] || '';

                return {
                    index,
                    projectName,
                    href,
                    location: `${address}\n${location}`,
                    type: type,
                    rooms: rooms,
                    stage: 'Planning',
                    status: 'Active',
                    contacts: [], // Simplified for this check
                };
            });
        });

        console.log(`\n✅ Found ${projectData.length} projects`);
        if (projectData.length > 0) {
            console.log('Sample:', projectData[0]);
        }

        // Process and Save
        const processedProjects = [];
        for (const raw of projectData.slice(0, maxProjects)) {
            if (!raw.projectName) continue;

            const project = this.parseProjectData(raw);
            if (project) {
                processedProjects.push(project);
                await this.saveToDatabase(project);
            }
        }

        return processedProjects;
    }

    parseProjectData(raw) {
        try {
            const cwProjectId = raw.href ? `CW-${raw.href.split('/').pop()}` : `CW-${Date.now()}-${raw.index}`;

            // Parse "City State Zip"
            const locationParts = raw.location.split('\n');
            let city = 'Unknown';
            let state = 'Unknown';
            let zip = '';
            let address = '';

            if (locationParts.length > 0) {
                const lastLine = locationParts[locationParts.length - 1] || '';
                const match = lastLine.match(/^(.+?)([A-Z]{2})\s*(\d{5})?/);
                if (match) {
                    city = match[1].trim();
                    state = match[2];
                    zip = match[3] || '';
                }
                if (locationParts.length > 1) {
                    address = locationParts[0];
                }
            }

            const roomMatch = raw.rooms?.match(/(\d+)/);
            const unitsCount = roomMatch ? parseInt(roomMatch[1]) : undefined;

            // Simplified Type Logic
            const type = (raw.type || '').toLowerCase();
            let projectTypes = ['hotel'];
            if (type.includes('renovation')) projectTypes.push('renovation');
            if (type.includes('new')) projectTypes.push('new_construction');

            // Estimate Value
            let estimatedValue = 0;
            if (unitsCount) {
                const costPerRoom = type.includes('renovation') ? 100000 : 250000;
                estimatedValue = unitsCount * costPerRoom;
            }

            return {
                cw_project_id: cwProjectId,
                project_name: raw.projectName,
                project_type: projectTypes,
                project_stage: raw.stage, // Defaulted to Planning
                project_value: estimatedValue,
                city,
                state,
                zip,
                address,
                units_count: unitsCount,
                raw_data: { original: raw }
            };

        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    }

    async saveToDatabase(project) {
        if (!project) return;
        const score = calculateGrooveScore(project);

        const projectData = {
            organization_id: ORGANIZATION_ID,
            cw_project_id: project.cw_project_id,
            project_name: project.project_name,
            groove_fit_score: score,
            priority_level: score >= 80 ? 'hot' : 'cold',
            project_value: project.project_value,
            city: project.city,
            state: project.state
        };

        console.log(`   Saving: ${project.project_name} (Score: ${score}) -> ${project.city}, ${project.state}`);

        const { error } = await supabase
            .from('projects')
            .upsert(projectData, { onConflict: 'cw_project_id' });

        if (error) console.error('   DB Error:', error.message);
        else console.log('   ✅ Saved to DB');
    }

    wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

// Run
(async () => {
    const scraper = new EnhancedConstructionWireScraper();
    await scraper.init();
    try {
        await scraper.login();
        await scraper.navigateToHotels();
        await scraper.scrapeProjects(MAX_PROJECTS);
    } catch (e) {
        console.error(e);
    } finally {
        if (scraper.browser) await scraper.browser.close();
        process.exit(0);
    }
})();
