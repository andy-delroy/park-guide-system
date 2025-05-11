import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="bg-gray-100 flex relative h-screen overflow-hidden">
            {/* Sidebar */}
            <nav
                className={`${
                    sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-60'
                } transition-all duration-300 border-r border-gray-100 bg-[--forest-green] h-screen fixed sm:block hidden`}
            >
                <div className="flex flex-col h-full pt-3">
                    <div className="flex items-center justify-center mb-3">
                        <Link href="/">
                            <ApplicationLogo className="h-16 w-auto" />
                        </Link>
                    </div>

                    <div className="flex flex-col flex-grow">
                        <NavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            href={route('trainings.index')}
                            active={route().current('trainings.index')}
                        >
                            Trainings
                        </NavLink>
                        <NavLink
                            href={route('certification.index')}
                            active={route().current('certification.index')}
                        >
                            Certification
                        </NavLink>
                        <NavLink
                            href={route('guides.index')}
                            active={route().current('guides.index')}
                        >
                            Guides
                        </NavLink>
                        <NavLink
                            href={route('quiz.index')}
                            active={route().current('quiz.index')}
                        >
                            Quiz
                        </NavLink>
                        <NavLink
                            href={route('map.parkmap')}
                            active={route().current('map.parkmap')}
                        >
                            Map
                        </NavLink>
                        <NavLink
                            href={route('courses.index')}
                            active={route().current('courses.index')}
                        >
                            Courses
                        </NavLink>
                        <NavLink
                            href={route('profile.edit')}
                            active={route().current('profile.edit')}
                        >
                            Profile
                        </NavLink>

                        <div className="flex-grow" />

                        <NavLink
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="w-full text-left"
                        >
                            Log Out
                        </NavLink>
                    </div>
                </div>
            </nav>

            {/* Toggle Button */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute top-1/2 -translate-y-1/2 sm:flex hidden z-20 bg-[--secondary-contrast] hover:bg-gray-100 p-2 w-8 h-20 rounded-r-lg transition-all duration-300 items-center justify-center"
                style={{
                    left: sidebarCollapsed ? '0rem' : '14.95rem',
                }}
            >
                <svg
                    className={`w-8 h-8 text-gray-700 transform transition-transform duration-300 ${
                        sidebarCollapsed ? '' : 'rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${
                    sidebarCollapsed ? 'ml-0' : 'sm:ml-60'
                }`}
            >
                {/* Mobile Nav (top bar toggle) */}
                <div className="sm:hidden border-b border-gray-100 bg-[--forest-green] p-4 flex justify-between items-center">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>

                    <button
                        onClick={() =>
                            setShowingNavigationDropdown((prev) => !prev)
                        }
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                className={
                                    !showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                            <path
                                className={
                                    showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Dropdown Mobile Menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2 px-4 bg-white border-b">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('trainings.index')}
                            active={route().current('trainings.index')}
                        >
                            Trainings
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('certification.index')}
                            active={route().current('certification.index')}
                        >
                            Certification
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('guides.index')}
                            active={route().current('guides.index')}
                        >
                            Guides
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('quiz.index')}
                            active={route().current('quiz.index')}
                        >
                            Quiz
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('map.parkmap')}
                            active={route().current('map.parkmap')}
                        >
                            Map
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('courses.index')}
                            active={route().current('courses.index')}
                        >
                            Courses
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 px-4 bg-white">
                        <div className="text-base font-medium text-gray-800">
                            {user.name}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {user.email}
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>

                {/* Header */}
                {header && (
                    <header className="bg-white shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                {/* Main */}
                <main>{children}</main>
            </div>
        </div>
    );
}
