import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { getArtifact } from '@/lib/daros/artifacts';
import { BoardOnePagerPDF } from '@/components/pdf/BoardOnePagerPDF';
import { createElement } from 'react';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const artifact = await getArtifact(id);

        if (!artifact) {
            return new NextResponse('Artifact not found', { status: 404 });
        }

        if (artifact.type !== 'board_one_pager') {
            return new NextResponse('PDF generation only supported for Board One-Pagers currently', { status: 400 });
        }

        // Render the PDF to a Node.js stream
        const stream = await renderToStream(
            // @ts-expect-error - react-pdf types behave oddly with Next.js specific element types
            createElement(BoardOnePagerPDF, { data: artifact.content })
        );

        // Create a Web Response object
        // @ts-expect-error - The stream type from react-pdf is compatible but types mismatch
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${artifact.title.replace(/\s+/g, '_')}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
