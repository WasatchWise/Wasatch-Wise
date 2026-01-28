import { NextResponse } from 'next/server'

// GitHub Configuration
// You need to generate a Personal Access Token (classic) with 'repo' and 'workflow' scopes
const GITHUB_OWNER = 'MikeSartain' // Replace with actual owner if different
const GITHUB_REPO = 'grooveleads-pro' // Replace with actual repo name if different
const WORKFLOW_ID = 'scheduled-scraper.yml'
const BRANCH = 'main'

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication (add your auth check here if needed)
        // For now, we assume middleware handles protection or we check for God Mode headers

        const body = await req.json()
        const maxProjects = body.maxProjects || '50'

        const githubToken = process.env.GITHUB_PAT

        if (!githubToken) {
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing GITHUB_PAT' },
                { status: 500 }
            )
        }

        // 2. Call GitHub API
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_ID}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ref: BRANCH,
                    inputs: {
                        max_projects: maxProjects.toString(),
                        start_page: '1'
                    }
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('GitHub API Error:', errorText)
            return NextResponse.json(
                { error: `GitHub API failed: ${response.status} ${response.statusText}` },
                { status: 502 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Scraper triggered successfully',
            details: 'Check GitHub Actions tab for progress'
        })

    } catch (error: any) {
        console.error('Trigger Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
