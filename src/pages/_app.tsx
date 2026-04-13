import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'

import { LoadingProvider }            from '@/contexts/LoadingContext'
import { AuthProvider }               from '@/contexts/AuthContext'
import { SidebarProvider }            from '@/contexts/SidebarContext'
import { SchoolReportConfigProvider } from '@/contexts/SchoolReportConfigContext'
import { SchoolReportProvider }       from '@/contexts/SchoolReportContext'
import { GenerateImageProvider }      from '@/contexts/GenerateImageContext'
import { LocalStorageProvider }       from '@/contexts/LocalStorageContext'
import { CookieConcent } from '@/components/modal/cookieConcent'
import BuildProviderTree from '@/utils/providerTree'

import Head from 'next/head'
import '@/styles/globals.css'

const Providers = BuildProviderTree([
    [ThemeProvider, { attribute: 'class' }],
    [LoadingProvider],
    [AuthProvider],
    [SidebarProvider],
    [SchoolReportConfigProvider],
    [SchoolReportProvider],
    [GenerateImageProvider],
    [LocalStorageProvider]
])

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Providers>
            <Head>
                <meta name='viewport' content='width=device-width, initial-scale=1.0' />
                <title>Boletim Escolar</title>
            </Head>
            <Component {...pageProps} />
            <footer className='fixed bottom-0 left-0 right-0 z-30 text-center text-xs py-2 bg-black text-white/80 border-t border-white/20'>
                tricode solutions direito reservados
            </footer>
            <CookieConcent />
        </Providers>
    )
}