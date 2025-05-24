import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-white pt-6 sm:justify-center sm:pt-0">
            <div className="flex flex-col items-center">
                <Link href="/">
                    <ApplicationLogo className="h-28 w-auto" />
                </Link>
                <h2 className="text-xl font-semibold leading-tight text-gray-800 mt-2">
                    Sarawak Forestry Corporation
                </h2>
            </div>

            <div className="mt-6 w-full overflow-hidden px-6 sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
