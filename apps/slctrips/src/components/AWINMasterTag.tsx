'use client';

import Script from 'next/script';

/**
 * AWIN Publisher Master Tag
 *
 * Implements AWIN's tracking script for:
 * - Automatic link conversion to trackable affiliate links
 * - Improved tracking accuracy
 * - Automatic disclosure of monetized links
 *
 * As recommended in the Booking.com affiliate approval email.
 */
export default function AWINMasterTag() {
    const publisherId = process.env.NEXT_PUBLIC_AWIN_AFFILIATE_ID || '2060961';

    return (
        <>
            {/* AWIN MasterTag Script */}
            <Script
                id="awin-mastertag"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            (function(w,d,s,l,publisherId){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.awin1.com/'+publisherId+'.js'+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','AWIN_DataLayer','${publisherId}');
          `,
                }}
            />

            {/* AWIN Tracking Image */}
            <Script
                id="awin-tracking"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            var AWIN = AWIN || {};
            AWIN.Tracking = AWIN.Tracking || {};
            AWIN.Tracking.Sale = {};
          `,
                }}
            />
        </>
    );
}
