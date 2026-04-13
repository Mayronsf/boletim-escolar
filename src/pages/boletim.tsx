import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { useAuth } from '@/hooks/useAuth'
import { useLoading } from '@/hooks/useLoading'
import { useSidebar } from '@/hooks/useSidebar'
import { useTheme } from '@/hooks/useTheme'
import { SkeletonHome } from '@/components/Skeleton/pages/SkeletonHome'
import { Sidebar } from '@/components/sidebar'
import { SchoolReport } from '@/components/schoolReport'

export default function BoletimPage() {
    const router = useRouter()
    const { user, isAuthLoading } = useAuth()
    const { currentTheme } = useTheme()
    const { isLoading } = useLoading()
    const { isOpen } = useSidebar()

    useEffect(() => {
        const body = document.getElementsByTagName('body') as HTMLCollectionOf<HTMLBodyElement>
        if (!body) return

        const backgroundImage = {
            bg: currentTheme === 'dark' ? '#030712' : '#e2e8f0',
            fg: currentTheme === 'dark' ? '#111827' : '#cbd5e1'
        }

        body[0].style.backgroundImage = `radial-gradient(${backgroundImage.fg} 2px, ${backgroundImage.bg} 2px)`
        body[0].style.backgroundSize = '40px 40px'
    }, [currentTheme])

    useEffect(() => {
        if (isAuthLoading) return
        if (!user) router.replace('/')
    }, [isAuthLoading, router, user])

    if (isAuthLoading || !user || isLoading) {
        return <SkeletonHome />
    }

    return (
        <div className='w-screen h-screen flex items-end lg:justify-end'>
            <Sidebar />
            <div
                className={
                    `w-full lg:h-full h-[calc(98%-2rem)] overflow-auto flex
                    ${!isOpen ? 'lg:w-[calc(98%-2rem)]' : 'lg:max-w-[calc(100%-18rem)]'}`
                }
            >
                <SchoolReport />
            </div>
        </div>
    )
}
